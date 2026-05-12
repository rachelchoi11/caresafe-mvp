// CareSafe v0.2 — Firebase Realtime Database 연결 모듈
//
// 학습 메모:
// 이 파일은 Firebase SDK 초기화와 RTDB 헬퍼만 담당한다.
// 실제 비즈니스 로직(SOS 알림 처리, 시뮬레이터 이벤트 등)은
// 이 파일을 사용하는 페이지들에서 작성한다.
//
// ESM(ES Modules) 방식이라 file:// 더블클릭 열기는 동작 안 함.
// 로컬 테스트: 프로젝트 루트에서 `python3 -m http.server 8000` 실행 후
//             http://localhost:8000/firebase-test.html 접속.

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getDatabase, ref, set, get, push, onValue, serverTimestamp, off, runTransaction,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  getMessaging, getToken, onMessage, isSupported as isMessagingSupported,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging.js";

// Firebase 콘솔에서 발급받은 config — apiKey는 식별자(비밀 아님).
// 실제 보안은 RTDB ‘규칙’으로 통제 (학습 가이드 6장 참조).
const firebaseConfig = {
  apiKey: "AIzaSyBHyNXHGPW707HPUHGjneJdbKZX2C4FxVY",
  authDomain: "caresafe-mvp.firebaseapp.com",
  databaseURL: "https://caresafe-mvp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "caresafe-mvp",
  storageBucket: "caresafe-mvp.firebasestorage.app",
  messagingSenderId: "1047544288928",
  appId: "1:1047544288928:web:ae19db9abedc825cc9dbc5",
  measurementId: "G-C6P7J61E0E",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ----- 헬퍼: 경로 단위 read/write -----

// 특정 path에 값 쓰기 (기존 값 덮어씀).
async function writePath(path, value) {
  await set(ref(db, path), value);
}

// 특정 path 값 한 번 읽기.
async function readPath(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

// 컬렉션 path에 자동 키로 자식 추가. 새 자식의 키 반환.
async function pushChild(parentPath, value) {
  const childRef = push(ref(db, parentPath));
  await set(childRef, value);
  return childRef.key;
}

// 특정 path 변경을 실시간 구독. 콜백은 변경될 때마다 호출됨.
// 반환된 unsubscribe 함수 호출 시 구독 해제.
function watchPath(path, callback) {
  const target = ref(db, path);
  onValue(target, (snap) => callback(snap.val()));
  return () => off(target);
}

// 원자적 ‘처음 한 번만’ 예약. path 가 비어 있을 때만 value 쓰고 true 반환.
// 이미 값이 있으면 트랜잭션 abort 후 false 반환.
// 여러 탭·기기 동시 시도에서도 한 번만 성공 — 알림 중복 방지(P2 #7) 핵심.
async function reserveOnce(path, value) {
  try {
    const result = await runTransaction(ref(db, path), (current) => {
      if (current !== null && current !== undefined) return; // abort — 이미 존재
      return value;
    });
    return result.committed && result.snapshot.val() != null;
  } catch (e) {
    console.warn("[FB reserveOnce] 실패:", path, e);
    return false;
  }
}

// ----- Auth helpers -----

// Google 팝업 로그인. 사용자가 Google 계정 선택 → user 객체 반환.
async function signInGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// 로그아웃.
async function signOutUser() {
  await signOut(auth);
}

// 로그인 상태 변경 구독. 콜백 인자: user 객체 또는 null.
function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ----- FCM Web Push -----
// VAPID public key — Firebase Console > Project Settings > Cloud Messaging > Web Push 인증서.
// 사용자가 발급받아 여기에 붙여넣어야 동작.
const VAPID_KEY = "REPLACE_WITH_VAPID_PUBLIC_KEY";

// 푸시 권한 요청 + 토큰 발급. 성공 시 RTDB /push_tokens/{uid}: token 저장.
async function registerPushToken() {
  if (!(await isMessagingSupported())) {
    return { ok: false, reason: "이 브라우저는 푸시 알림을 지원하지 않습니다 (iOS Safari 등)." };
  }
  if (!auth.currentUser) {
    return { ok: false, reason: "로그인이 필요합니다." };
  }
  if (VAPID_KEY === "REPLACE_WITH_VAPID_PUBLIC_KEY") {
    return { ok: false, reason: "VAPID 키 미설정 — Firebase Console에서 발급 후 firebase.js에 붙여넣으세요." };
  }
  try {
    // Service Worker 등록 (FCM SDK 자동 등록도 가능하지만 명시적 등록이 안전)
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { ok: false, reason: "푸시 권한이 거부되었습니다 — 브라우저 설정에서 허용 필요." };
    }
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    if (!token) {
      return { ok: false, reason: "토큰 발급 실패 — 권한·인증서 재확인." };
    }
    // RTDB에 토큰 저장 — 백엔드가 이 토큰으로 push.send 호출
    await writePath(`/push_tokens/${auth.currentUser.uid}/${token}`, {
      createdAt: Date.now(),
      userAgent: navigator.userAgent.slice(0, 200),
    });
    // foreground 메시지도 OS 알림으로 표시 (페이지 열려있을 때 SW가 자동 표시 안 함)
    onMessage(messaging, (payload) => {
      console.log("[FCM] foreground 메시지:", payload);
      const notif = payload.notification || payload.data || {};
      if (Notification.permission === "granted") {
        new Notification(notif.title || "CareSafe 알림", {
          body: notif.body || "새 알림",
          icon: "/favicon.ico",
          tag: payload.data?.alertId,
        });
      }
    });
    return { ok: true, token };
  } catch (e) {
    return { ok: false, reason: e?.message || String(e) };
  }
}

// 토큰 비활성화 (사용자가 푸시 거부할 때) — 현재 기기 토큰만 제거.
// Codex 검토 반영: 멀티디바이스 사용자가 한 기기만 해제할 수 있어야 함.
async function unregisterPushToken(token) {
  if (!auth.currentUser) return;
  if (!token) {
    console.warn("[FCM] unregisterPushToken: 토큰 인자 필요");
    return;
  }
  try {
    await writePath(`/push_tokens/${auth.currentUser.uid}/${token}`, null);
  } catch (e) { console.warn("[FCM] 토큰 제거 실패:", e); }
}

// 콘솔에서 수동 테스트 가능하도록 전역 노출.
// 운영 단계엔 제거하거나 디버그 플래그로 감쌀 것.
window.CareSafeFB = {
  app, db, auth,
  writePath, readPath, pushChild, watchPath, reserveOnce,
  serverTimestamp,
  signInGoogle, signOutUser, observeAuth,
  registerPushToken, unregisterPushToken,
};

console.log("[CareSafe FB] Firebase 초기화 완료 ·", firebaseConfig.projectId);
