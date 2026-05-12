// CareSafe v0.2 — FCM Service Worker (백그라운드 푸시 수신)
//
// 이 파일은 반드시 루트(/firebase-messaging-sw.js)에 있어야 Firebase SDK가 자동 등록.
// 사용자 페이지를 닫아도 이 SW가 살아있는 동안 푸시 알림을 받음.
//
// 표시 흐름:
//   1. 백엔드(Cloud Function)에서 알림 발생 → FCM → 이 SW의 push event
//   2. firebase/messaging onBackgroundMessage 콜백 호출
//   3. self.registration.showNotification(...) 으로 OS 알림 표시
//   4. 사용자가 알림 클릭 → notificationclick → 보호자 페이지 열기

importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBHyNXHGPW707HPUHGjneJdbKZX2C4FxVY",
  authDomain: "caresafe-mvp.firebaseapp.com",
  databaseURL: "https://caresafe-mvp-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "caresafe-mvp",
  storageBucket: "caresafe-mvp.firebasestorage.app",
  messagingSenderId: "1047544288928",
  appId: "1:1047544288928:web:ae19db9abedc825cc9dbc5",
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 — 페이지 닫혀있어도 동작
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] 백그라운드 메시지:", payload);
  const data = payload.data || {};
  const notif = payload.notification || {};
  const title = notif.title || data.title || "CareSafe 알림";
  const body = notif.body || data.body || "새 알림이 있습니다";
  // 우선순위별 진동·색상 차별화
  const priority = data.priority || "P3";
  const vibrate = priority === "P0" ? [400, 100, 400, 100, 400]
                : priority === "P1" ? [300, 150, 300]
                : priority === "P2" ? [200] : [];
  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.alertId || `caresafe-${Date.now()}`,
    requireInteraction: priority === "P0" || priority === "P1",
    vibrate,
    data: {
      url: data.url || "/guardian.html?mode=firebase",
      alertId: data.alertId,
      priority,
    },
  });
});

// 알림 클릭 → 보호자 페이지 열기·포커스
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/guardian.html?mode=firebase";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (w.url.includes("/guardian.html") || w.url.includes("/alerts.html")) {
          w.focus();
          return;
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
