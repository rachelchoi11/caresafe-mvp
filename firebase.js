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

// 콘솔에서 수동 테스트 가능하도록 전역 노출.
// 운영 단계엔 제거하거나 디버그 플래그로 감쌀 것.
window.CareSafeFB = {
  app, db, auth,
  writePath, readPath, pushChild, watchPath, reserveOnce,
  serverTimestamp,
  signInGoogle, signOutUser, observeAuth,
};

console.log("[CareSafe FB] Firebase 초기화 완료 ·", firebaseConfig.projectId);
