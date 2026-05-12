// CareSafe v0.2 — Cloud Functions
// /alerts/{alertId} 신규 생성 시 모든 admin 토큰에 FCM 푸시 발송.
// 향후: senior_owners 매핑 도입 시 해당 가구 보호자만 타겟팅.

const { onValueCreated } = require("firebase-functions/v2/database");
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
