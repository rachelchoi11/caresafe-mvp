// mode-link.js — CareSafe v0.2
//
// 두 가지 역할:
// 1) Production host (github.io 등)에서 첫 진입 시 ?mode=firebase 자동 강제.
//    이유: localStorage 모드로 들어오면 stale demo 데이터 + 편집 손실 (Codex P1 #1)
// 2) Firebase 모드에서 내부 페이지 링크에 ?mode=firebase 자동 보존.
//    외부 URL·tel:·mailto:·앵커는 그대로.

(function () {
  const params = new URLSearchParams(location.search);
  let mode = params.get("mode");

  // Production host 자동 강제 — localhost·127.0.0.1·file:// 외엔 firebase
  const host = location.hostname;
  const isLocal = (
    host === "localhost" || host === "127.0.0.1" || host === "" ||
    host.endsWith(".local")
  );
  if (!mode && !isLocal) {
    // 첫 진입자 redirect — ?mode=firebase 강제. 페이지 새로고침으로 auth-guard·app-firebase 활성화.
    const u = new URL(location.href);
    u.searchParams.set("mode", "firebase");
    location.replace(u.href);
    return;
  }
  if (!mode) return;  // 진짜 로컬 dev면 손댈 것 없음

  const sameSite = (href) => {
    try {
      const u = new URL(href, location.href);
      return u.origin === location.origin && u.pathname.endsWith(".html");
    } catch { return false; }
  };

  // DOMContentLoaded 시 + 새로 추가되는 a 태그도 커버
  function patchLinks(root = document) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || a.dataset.modeProcessed) return;
      if (!sameSite(href)) return;
      // 이미 ?mode= 있으면 건드리지 않음
      const u = new URL(href, location.href);
      if (!u.searchParams.has("mode")) {
        u.searchParams.set("mode", mode);
        a.setAttribute("href", u.pathname + "?" + u.searchParams.toString() + u.hash);
      }
      a.dataset.modeProcessed = "1";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => patchLinks());
  } else {
    patchLinks();
  }

  // MutationObserver — 동적 추가되는 a 태그도 처리 (예: render() 후 생성된 링크)
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) patchLinks(n);
      });
    }
  });
  observer.observe(document.body || document.documentElement, {
    childList: true, subtree: true,
  });

  console.log("[mode-link] " + mode + " 모드 — 내부 링크 mode 보존 활성");
})();
