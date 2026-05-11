// app-firebase.js — CareSafe v0.2
//
// 학습 메모:
// 이 모듈은 ‘어댑터 패턴’의 핵심. app.js가 등록한 window.CareSafe API를
// Firebase Realtime Database 백엔드로 ‘대체’한다. 페이지 코드는 한 줄도 안 바꿈.
//
// 활성화 조건: URL에 ?mode=firebase
//   - 그 외엔 아무 일도 안 함 → app.js의 localStorage 어댑터가 그대로 동작.
//
// 데이터 모델 (v0.2 1단계): v0.1의 로컬 모양 그대로 옮김.
//   /seniors/{uid}    — 시니어 객체 (id, name, age, status, ...)
//   /alerts/{aid}     — 알림 객체 (id, uid, type, level, text, time)
//   /activeUid        — 현재 보호자가 보고 있는 시니어 id

import "./firebase.js";

const params = new URLSearchParams(location.search);
const FB_MODE = params.get("mode") === "firebase";

if (!FB_MODE) {
  console.log("[CareSafe] 로컬 모드. URL에 ?mode=firebase 붙이면 Firebase 모드로 전환.");
} else {
  console.log("[CareSafe] Firebase 모드 시작…");
  try {
    const FB = await waitForFB();
    installFirebaseAdapter(FB);
  } catch (e) {
    console.error("[CareSafe] Firebase 어댑터 활성화 실패:", e);
    alert("Firebase 연결 실패: " + e.message + "\n로컬 모드로 동작합니다.");
  }
}

async function waitForFB(timeoutMs = 5000) {
  const t0 = Date.now();
  while (!window.CareSafeFB) {
    if (Date.now() - t0 > timeoutMs) throw new Error("Firebase SDK 로드 타임아웃");
    await new Promise(r => setTimeout(r, 50));
  }
  return window.CareSafeFB;
}

function installFirebaseAdapter(FB) {
  // app.js의 같은 구독자 풀을 공유. 페이지가 이미 등록한 subscribe(fn)이 그대로 동작.
  const subs = window.CareSafe._subs;

  // 내부 캐시 — Firebase 최신 스냅샷 미러.
  // load()가 sync로 동작해야 페이지 코드 호환되므로 캐시 유지.
  const cache = { seniors: [], alerts: [], activeUid: null };

  // 초기 3개 path 첫 스냅샷 도착 여부 추적 → 다 받은 뒤에만 ‘활성화’ 처리.
  const initial = { seniors: false, alerts: false, activeUid: false };
  let activated = false;

  function fireSubs(msg) {
    subs.forEach((fn) => {
      try { fn(msg); } catch (e) { console.error(e); }
    });
  }

  function tryActivate() {
    if (activated) {
      fireSubs({ type: "sync", source: "firebase" });
      return;
    }
    if (initial.seniors && initial.alerts && initial.activeUid) {
      activated = true;
      // Firebase 백엔드 메서드로 교체 (subscribe / fmtTime 등은 app.js 것 유지).
      Object.assign(window.CareSafe, fbAPI);
      console.log("[CareSafe] Firebase 어댑터 활성화 완료. seniors=%d, alerts=%d",
                  cache.seniors.length, cache.alerts.length);
      fireSubs({ type: "ready", source: "firebase" });
    }
  }

  // 3개 path 실시간 구독.
  FB.watchPath("/seniors", (data) => {
    cache.seniors = data ? Object.values(data) : [];
    initial.seniors = true;
    tryActivate();
  });

  FB.watchPath("/alerts", (data) => {
    cache.alerts = data
      ? Object.values(data).sort((a, b) => b.time - a.time)
      : [];
    initial.alerts = true;
    tryActivate();
  });

  FB.watchPath("/activeUid", (val) => {
    cache.activeUid = val;
    initial.activeUid = true;
    tryActivate();
  });

  // ----- API surface (window.CareSafe와 1:1 매칭) -----
  const fbAPI = {
    load() {
      // 깊은 복사로 페이지가 캐시를 직접 수정 못 하게.
      return JSON.parse(JSON.stringify(cache));
    },

    async save(state) {
      const seniorsMap = {};
      (state.seniors || []).forEach((s) => { seniorsMap[s.id] = s; });
      const alertsMap = {};
      (state.alerts || []).forEach((a) => { alertsMap[a.id] = a; });
      await FB.writePath("/seniors", seniorsMap);
      await FB.writePath("/alerts", alertsMap);
      await FB.writePath("/activeUid", state.activeUid || null);
    },

    async reset() {
      if (!confirm("Firebase의 모든 데이터를 삭제합니다. 계속할까요?")) return;
      await FB.writePath("/seniors", null);
      await FB.writePath("/alerts", null);
      await FB.writePath("/activeUid", null);
      location.reload();
    },

    async addAlert(alert) {
      const id = "a" + Date.now() + Math.floor(Math.random() * 1000);
      const full = Object.assign({ id, time: Date.now() }, alert);
      await FB.writePath(`/alerts/${id}`, full);

      const senior = cache.seniors.find((s) => s.id === full.uid);
      if (senior) {
        await FB.writePath(`/seniors/${senior.id}/lastPing`, Date.now());
        const next =
          full.level === "danger" ? "danger"
          : full.level === "warn" && senior.status === "ok" ? "warn"
          : senior.status;
        if (next !== senior.status) {
          await FB.writePath(`/seniors/${senior.id}/status`, next);
        }
      }
      return full;
    },

    async setStatus(uid, status) {
      await FB.writePath(`/seniors/${uid}/status`, status);
      await FB.writePath(`/seniors/${uid}/lastPing`, Date.now());
    },

    async setActive(uid) {
      await FB.writePath("/activeUid", uid);
    },

    // local 모드의 broadcast는 BroadcastChannel을 쓰지만, firebase 모드에선
    // 모든 변경이 RTDB onValue로 자동 전파되므로 no-op.
    broadcast() {},
  };

  // 모드 표시용 작은 배지를 화면 우상단에 추가 (선택적, 디버깅 도움).
  injectModeBadge();
}

function injectModeBadge() {
  const badge = document.createElement("div");
  badge.textContent = "🔥 Firebase";
  Object.assign(badge.style, {
    position: "fixed", top: "8px", right: "8px",
    background: "#F59E0B", color: "white",
    padding: "4px 10px", borderRadius: "999px",
    fontSize: "11px", fontWeight: "700",
    zIndex: "9999", fontFamily: "system-ui, sans-serif",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    pointerEvents: "none",
  });
  document.body.appendChild(badge);
}
