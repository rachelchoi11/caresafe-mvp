// mode-link.js — CareSafe v0.2
//
// 내부 페이지 링크에 ?mode= URL 파라미터 자동 보존.
// firebase 모드에서 한 페이지 → 다른 페이지 이동 시 모드 유지.
// 외부 URL·tel:·mailto:·앵커는 그대로.

(function () {
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode");
  if (!mode) return;  // 로컬 모드면 손댈 것 없음

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
