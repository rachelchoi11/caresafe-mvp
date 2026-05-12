// app-firebase.js — CareSafe v0.2
//
// 학습 메모:
// 이 모듈은 ‘어댑터 패턴’의 핵심. app.js가 등록한 window.CareSafe API를
// Firebase Realtime Database 백엔드로 ‘대체’한다. 페이지 코드는 한 줄도 안 바꿈.
//
// 활성화 조건: URL에 ?mode=firebase
//   - 그 외엔 아무 일도 안 함 → app.js의 localStorage 어댑터가 그대로 동작.
//
// 데이터 모델 (v0.2 Phase 2 #6 — path 분리):
//   /seniors_public/{uid}   — 응급카드용 의료정보 (익명 read 허용)
//   /seniors_private/{uid}  — 운영용 상태·보호자 정보 (인증 필수)
//   /alerts/{aid}           — 알림 객체
//   /activeUid              — 현재 보호자가 보고 있는 시니어 id
//   /qr_index/{token}: uid  — emergency.html?token=… 조회용

import "./firebase.js";

const params = new URLSearchParams(location.search);
const FB_MODE = params.get("mode") === "firebase";

if (!FB_MODE) {
  console.log("[CareSafe] 로컬 모드. URL에 ?mode=firebase 붙이면 Firebase 모드로 전환.");
} else {
  console.log("[CareSafe] Firebase 모드 시작 — 인증 대기 중…");
  try {
    const FB = await waitForFB();
    // 보안 규칙 적용 후 Firebase 읽기는 auth 필요.
    // auth-guard.js가 로그인 완료 후 caresafe-auth-ready 이벤트 발화.
    await waitForAuth();
    console.log("[CareSafe] 인증 완료. Firebase 어댑터 활성화…");
    installFirebaseAdapter(FB);
  } catch (e) {
    console.error("[CareSafe] Firebase 어댑터 활성화 실패:", e);
    alert("Firebase 연결 실패: " + e.message + "\n로컬 모드로 동작합니다.");
  }
}

// auth-guard.js가 발화하는 caresafe-auth-ready 이벤트 대기.
// 이미 로그인된 경우엔 window.CareSafeUser가 채워져 있음.
async function waitForAuth(timeoutMs = 60000) {
  if (window.CareSafeUser) return window.CareSafeUser;
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("인증 대기 타임아웃")), timeoutMs);
    window.addEventListener("caresafe-auth-ready", (e) => {
      clearTimeout(t);
      resolve(e.detail);
    }, { once: true });
  });
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
  // public + private 두 path를 시니어 id 기준으로 병합해서 cache.seniors 구성.
  const cache = { seniors: [], alerts: [], activeUid: null };
  const _publicMap = {};   // {uid: publicFields}
  const _privateMap = {};  // {uid: privateFields}

  function _rebuildSeniorsCache() {
    const allUids = new Set([
      ...Object.keys(_publicMap),
      ...Object.keys(_privateMap),
    ]);
    cache.seniors = Array.from(allUids).map(uid => ({
      ...(_publicMap[uid] || {}),
      ...(_privateMap[uid] || {}),
      id: uid,
    }));
  }

  // 초기 path 첫 스냅샷 도착 여부 추적 → 다 받은 뒤에만 ‘활성화’ 처리.
  const initial = { seniors_public: false, seniors_private: false, alerts: false, activeUid: false };
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
    if (initial.seniors_public && initial.seniors_private && initial.alerts && initial.activeUid) {
      activated = true;
      Object.assign(window.CareSafe, fbAPI);
      console.log("[CareSafe] Firebase 어댑터 활성화 완료. seniors=%d (public path 분리), alerts=%d",
                  cache.seniors.length, cache.alerts.length);
      fireSubs({ type: "ready", source: "firebase" });
    }
  }

  // Codex P2 #9: 레거시 /seniors 노드 자동 마이그레이션.
  // public/private 분리 이전 데이터가 남아있으면 분리해 옮기되 원본은 보존.
  // 안전 설계 (Codex 검토 반영):
  //   - /migrations/seniors_split_v1 플래그로 완료 표시 — 부분 실패 시 재시도 가능
  //   - 이미 분리된 UID는 skip (멱등성). 누락 UID만 복사.
  //   - 레거시 /seniors는 절대 삭제 안 함. 라이브 race 시에도 원본 손실 ✗.
  (async () => {
    try {
      const done = await FB.readPath("/migrations/seniors_split_v1");
      if (done === true) return;
      const legacy = await FB.readPath("/seniors");
      if (!legacy || typeof legacy !== "object") {
        await FB.writePath("/migrations/seniors_split_v1", true);
        return;
      }
      const existingPublic = (await FB.readPath("/seniors_public")) || {};
      const existingPrivate = (await FB.readPath("/seniors_private")) || {};
      console.log("[CareSafe] 레거시 /seniors 마이그레이션 시작 — 누락 부분만 복사");
      let copied = 0, skipped = 0, partial = 0;
      for (const [uid, s] of Object.entries(legacy)) {
        const havePub = !!existingPublic[uid];
        const havePrv = !!existingPrivate[uid];
        if (havePub && havePrv) { skipped++; continue; }
        const senior = { ...s, id: uid };
        const { pub, prv } = _splitSeniorObj(senior);
        if (prv.locationConsent === undefined) prv.locationConsent = false;
        // 부분 실패 회복: 없는 쪽만 다시 쓰기
        if (!havePub) await FB.writePath(`/seniors_public/${uid}`, pub);
        if (!havePrv) await FB.writePath(`/seniors_private/${uid}`, prv);
        if (senior.qrToken) {
          const existingQr = await FB.readPath(`/qr_index/${senior.qrToken}`);
          if (!existingQr) await FB.writePath(`/qr_index/${senior.qrToken}`, uid);
        }
        if (havePub || havePrv) partial++;
        else copied++;
      }
      await FB.writePath("/migrations/seniors_split_v1", true);
      console.log(`[CareSafe] 마이그레이션 완료: 신규 ${copied} · 부분복구 ${partial} · skip ${skipped}. 레거시 /seniors는 운영자 수동 정리 대상.`);
    } catch (e) {
      console.warn("[CareSafe] 레거시 마이그레이션 실패 (다음 로드에서 재시도):", e);
    }
  })();

  // 4개 path 실시간 구독 (public/private 분리)
  FB.watchPath("/seniors_public", (data) => {
    if (data) {
      for (const [uid, pub] of Object.entries(data)) _publicMap[uid] = pub;
    } else {
      for (const k of Object.keys(_publicMap)) delete _publicMap[k];
    }
    _rebuildSeniorsCache();
    initial.seniors_public = true;
    tryActivate();
  });

  FB.watchPath("/seniors_private", (data) => {
    if (data) {
      for (const [uid, prv] of Object.entries(data)) _privateMap[uid] = prv;
    } else {
      for (const k of Object.keys(_privateMap)) delete _privateMap[k];
    }
    _rebuildSeniorsCache();
    initial.seniors_private = true;
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

  // Phase 2 #6 + Codex P1 #4 (2026-05-12 재정의):
  // 트레이드오프 — 응급 발견자 가치 vs PII 노출.
  // PUBLIC = ER triage·119 인계·보호자 연락에 직접 필요한 항목만.
  // PRIVATE = 식별 가능성 큰 구체 이력·운영 정보·민감 식별자.
  // consent.html·help.html은 이 분류와 정확히 일치하는 문구.
  const _PUBLIC_KEYS = new Set([
    "id","name","age","gender","height","weight",
    "blood","allergies","diseases","meds",
    "doctor",              // 병원·과·담당의·외래·응급실 전화 (119 인계용)
    "emergencyContacts",   // 핵심 가치 — 발견자가 보호자 연결
    "cognitiveBaseline",   // 응급실 의식 평가 기준선 (라벨만, 진단 X)
    "qrToken"
  ]);
  const _PRIVATE_KEYS = new Set([
    "region","note","notes","guardian","phone","status","battery","lastPing","locationConsent",
    "relationship",         // 보호자 기준 관계 — 보호자 시점 정보, 외부 응급 노출 ❌
    "advanceDirective",     // DNR 등록번호 = 민감 식별자. 등록 여부만 별도 노출 검토 (v1.0)
    "recentHistory",        // 구체 입원·수술 일자 = 식별 가능
    "implants",             // 모델명·수술일자 = 식별 가능
    "assistiveDevices",     // 일부 식별 가능 — 보호자 페이지에서만 표시
  ]);

  function _splitSeniorObj(s) {
    const pub = {}, prv = {};
    for (const [k, v] of Object.entries(s || {})) {
      if (_PUBLIC_KEYS.has(k)) pub[k] = v;
      else if (_PRIVATE_KEYS.has(k)) prv[k] = v;
      // 알 수 없는 필드는 무시 (private 쪽에 떨어뜨릴 수도 있지만 보수적으로 drop)
    }
    return { pub, prv };
  }

  // ----- API surface (window.CareSafe와 1:1 매칭) -----
  const fbAPI = {
    load() {
      // 깊은 복사로 페이지가 캐시를 직접 수정 못 하게.
      return JSON.parse(JSON.stringify(cache));
    },

    // Codex P1 #2 수정: save() 전체 트리 덮어쓰기 = 동시 알림 silent 삭제 위험.
    // 마이그레이션·리셋 외엔 사용 금지. 일반 편집은 saveSenior·deleteSenior·setActive 사용.
    async save(state) {
      console.warn("[CareSafe] save(state) 호출됨 — 전체 트리 덮어쓰기. 마이그레이션 의도가 맞나? 일반 편집은 saveSenior·deleteSenior 권장.");
      const publicMap = {}, privateMap = {};
      (state.seniors || []).forEach((s) => {
        const { pub, prv } = _splitSeniorObj(s);
        publicMap[s.id] = pub;
        privateMap[s.id] = prv;
      });
      const alertsMap = {};
      (state.alerts || []).forEach((a) => { alertsMap[a.id] = a; });
      await FB.writePath("/seniors_public", publicMap);
      await FB.writePath("/seniors_private", privateMap);
      await FB.writePath("/alerts", alertsMap);
      await FB.writePath("/activeUid", state.activeUid || null);
    },

    // 단일 시니어 update — 다른 시니어·알림에 영향 ✗
    async saveSenior(senior) {
      const { pub, prv } = _splitSeniorObj(senior);
      await FB.writePath(`/seniors_public/${senior.id}`, pub);
      await FB.writePath(`/seniors_private/${senior.id}`, prv);
      if (senior.qrToken) {
        await FB.writePath(`/qr_index/${senior.qrToken}`, senior.id);
      }
    },

    // 단일 시니어 삭제 + 관련 알림·qr_index 정리
    async deleteSenior(uid) {
      // 시니어 본체
      await FB.writePath(`/seniors_public/${uid}`, null);
      await FB.writePath(`/seniors_private/${uid}`, null);
      // 관련 알림 — alerts cache에서 uid 일치 항목만 null 처리
      const myAlerts = cache.alerts.filter(a => a.uid === uid);
      for (const a of myAlerts) {
        await FB.writePath(`/alerts/${a.id}`, null);
      }
      // qr_index — 시니어 qrToken 모르면 cache에서 조회
      const senior = cache.seniors.find(s => s.id === uid);
      if (senior?.qrToken) {
        await FB.writePath(`/qr_index/${senior.qrToken}`, null);
      }
      // activeUid 자기 자신이면 다른 시니어로 전환
      if (cache.activeUid === uid) {
        const other = cache.seniors.find(s => s.id !== uid);
        await FB.writePath("/activeUid", other ? other.id : null);
      }
    },

    async reset() {
      if (!confirm("Firebase의 모든 데이터를 삭제합니다. 계속할까요?")) return;
      await FB.writePath("/seniors_public", null);
      await FB.writePath("/seniors_private", null);
      await FB.writePath("/alerts", null);
      await FB.writePath("/activeUid", null);
      location.reload();
    },

    async addAlert(alert) {
      const id = "a" + Date.now() + Math.floor(Math.random() * 1000);
      // 알림 우선순위 자동 라벨링 (app.js와 동일 규칙)
      const priority = alert.priority ||
        (alert.level === "danger" && (alert.type === "sos" || alert.type === "fall") ? "P0" :
         alert.level === "danger" ? "P1" :
         alert.level === "warn" ? "P2" : "P3");
      const full = Object.assign({ id, time: Date.now() }, alert, { priority });
      await FB.writePath(`/alerts/${id}`, full);

      const senior = cache.seniors.find((s) => s.id === full.uid);
      if (senior) {
        // status·lastPing 은 private 영역
        await FB.writePath(`/seniors_private/${senior.id}/lastPing`, Date.now());
        const next =
          full.level === "danger" ? "danger"
          : full.level === "warn" && senior.status === "ok" ? "warn"
          : senior.status;
        if (next !== senior.status) {
          await FB.writePath(`/seniors_private/${senior.id}/status`, next);
        }
      }
      return full;
    },

    async setStatus(uid, status) {
      await FB.writePath(`/seniors_private/${uid}/status`, status);
      await FB.writePath(`/seniors_private/${uid}/lastPing`, Date.now());
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
