// CareSafe v0.2 — Cloud Functions
// /alerts/{alertId} 신규 생성 시 모든 admin 토큰에 FCM 푸시 발송.
// 향후: senior_owners 매핑 도입 시 해당 가구 보호자만 타겟팅.

const { onValueCreated, onValueWritten } = require("firebase-functions/v2/database");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

// RTDB 경로: /alerts/{alertId}
exports.sendPushOnAlert = onValueCreated(
  {
    ref: "/alerts/{alertId}",
    region: "asia-southeast1",
    instance: "caresafe-mvp-default-rtdb",
  },
  async (event) => {
    const alert = event.data.val();
    if (!alert) return;

    // P3는 푸시 안 함 (정보성). P0~P2만 발송.
    if (alert.priority === "P3") {
      console.log("[Push] P3 알림 — 푸시 skip", alert.id);
      return;
    }

    const db = getDatabase();

    // 시니어 이름 조회 (메시지에 포함)
    let seniorName = "";
    try {
      const snap = await db.ref(`/seniors_public/${alert.uid}/name`).get();
      seniorName = snap.val() || "";
    } catch (e) { /* ignore */ }

    // 받을 대상: /push_tokens 에 등록된 모든 사용자 (closed pilot 기준).
    // v0.3+ senior_owners 매핑 도입 시 alert.uid의 보호자 token만 타겟팅 예정.
    const tokensSnap = await db.ref("/push_tokens").get();
    const tokensRoot = tokensSnap.val() || {};
    const ownerByToken = new Map(); // token → uid (만료 정리용)
    const tokens = [];
    for (const [uid, tokenMap] of Object.entries(tokensRoot)) {
      for (const token of Object.keys(tokenMap || {})) {
        tokens.push(token);
        ownerByToken.set(token, uid);
      }
    }

    if (tokens.length === 0) {
      console.log("[Push] 등록된 토큰 없음. skip.");
      return;
    }

    const priority = alert.priority || "P2";
    const levelIcon = alert.level === "danger" ? "🚨" :
                     alert.level === "warn" ? "⚠️" : "🟢";
    const title = `${levelIcon} ${priority} ${seniorName ? seniorName + " 어르신" : "CareSafe"}`;
    const body = alert.text || "새 알림이 도착했습니다.";

    // 토큰별 개별 send (multicast 대신 — 만료 토큰 정리 용이)
    const message = {
      notification: { title, body },
      data: {
        alertId: alert.id || "",
        priority,
        level: alert.level || "",
        uid: alert.uid || "",
        url: `/guardian.html?mode=firebase`,
      },
      android: {
        priority: priority === "P0" || priority === "P1" ? "high" : "normal",
        notification: {
          channelId: priority === "P0" ? "caresafe-critical" : "caresafe-alerts",
        },
      },
      webpush: {
        headers: {
          Urgency: priority === "P0" ? "high" : "normal",
        },
      },
    };

    const messaging = getMessaging();
    const results = await Promise.allSettled(
      tokens.map((token) => messaging.send({ ...message, token }))
    );

    // 실패 토큰 정리
    const expired = [];
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const code = r.reason?.errorInfo?.code || r.reason?.code || "";
        if (code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token") {
          expired.push(tokens[i]);
        } else {
          console.warn("[Push] send 실패:", code, r.reason?.message);
        }
      }
    });

    if (expired.length > 0) {
      console.log("[Push] 만료 토큰 정리:", expired.length);
      for (const token of expired) {
        const uid = ownerByToken.get(token);
        if (uid) {
          await db.ref(`/push_tokens/${uid}/${token}`).remove().catch(() => {});
        }
      }
    }

    console.log(`[Push] 알림 ${alert.id} → ${tokens.length}개 토큰 발송 완료 (만료 ${expired.length})`);
  }
);

// =====================================================================
// 자동 안부 체크인 — 매시간 :05분에 실행, 등록된 시간과 매칭되는 시니어에게 안부 카드 발송
// 시간대: Asia/Seoul. 1시간 단위 매칭 (분 단위 정확도는 RTDB 폴링 부담 회피).
// =====================================================================
exports.scheduledCheckin = onSchedule(
  {
    schedule: "every 60 minutes",
    timeZone: "Asia/Seoul",
    region: "asia-southeast1",
  },
  async () => {
    const db = getDatabase();
    const now = new Date(Date.now() + 9 * 3600 * 1000); // UTC → KST 보정
    const hhmm = String(now.getUTCHours()).padStart(2, "0") + ":00";
    const today = `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,'0')}${String(now.getUTCDate()).padStart(2,'0')}`;

    // 모든 시니어 _private 노드에서 checkInSchedule 시간 매칭 확인
    const privateSnap = await db.ref("/seniors_private").get();
    const privateMap = privateSnap.val() || {};
    let dispatched = 0;
    for (const [uid, prv] of Object.entries(privateMap)) {
      const sched = prv.checkInSchedule;
      if (!sched || sched.enabled === false || !sched.time) continue;
      // 정시 매칭: 'HH:00' (분 단위 무시)
      const schedHour = String(sched.time).slice(0, 2) + ":00";
      if (schedHour !== hhmm) continue;
      // 오늘 이미 보냈으면 skip
      const existing = await db.ref(`/checkins/${uid}/${today}`).get();
      if (existing.exists()) { continue; }
      // 메시지 풀에서 랜덤 선택 (없으면 디폴트)
      const msgs = (sched.messages && sched.messages.length) ? sched.messages : [
        { text: "오늘 하루 어떠세요? 잘 지내고 계시면 한 번 눌러주세요.", hint: "안부 확인" },
      ];
      const pick = msgs[Math.floor(Math.random() * msgs.length)];
      await db.ref(`/checkins/${uid}/${today}`).set({
        msg: pick.text,
        hint: pick.hint || "",
        sentAt: Date.now(),
        confirmedAt: null,
      });
      dispatched++;
      console.log(`[Checkin] ${uid} ${today} '${pick.text.slice(0, 30)}' 발송`);
    }
    console.log(`[Checkin] 정시 ${hhmm} — ${dispatched}건 발송`);
  }
);

// =====================================================================
// 안부 확인 → 보호자 알림. /checkins/{uid}/{date}/confirmedAt 가 채워지면 /alerts 발사.
// =====================================================================
exports.onCheckinConfirmed = onValueWritten(
  {
    ref: "/checkins/{uid}/{date}/confirmedAt",
    region: "asia-southeast1",
    instance: "caresafe-mvp-default-rtdb",
  },
  async (event) => {
    const after = event.data.after.val();
    const before = event.data.before.val();
    if (!after || before) return; // 새로 채워질 때만
    const uid = event.params.uid;
    const date = event.params.date;
    const db = getDatabase();
    let seniorName = "";
    try {
      const snap = await db.ref(`/seniors_public/${uid}/name`).get();
      seniorName = snap.val() || "";
    } catch (e) { /* ignore */ }
    const alertId = "a" + Date.now() + Math.floor(Math.random() * 1000);
    await db.ref(`/alerts/${alertId}`).set({
      id: alertId,
      uid,
      type: "activity",
      level: "ok",
      priority: "P3",
      text: `💚 ${seniorName || "돌봄대상자"} 님 안부 확인 — 오늘도 잘 지내고 계세요`,
      time: Date.now(),
      checkinDate: date,
    });
    console.log(`[Checkin] ${uid} ${date} 확인 → 알림 ${alertId} 발사`);
  }
);
