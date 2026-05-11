// auth-guard.js — CareSafe v0.2
//
// 학습 메모:
// 보호자 페이지(guardian.html, admin.html) 앞단에 로그인 게이트.
// ?mode=firebase 일 때만 활성화. 로컬 모드(시연용)는 통과.
//
// 동작:
// 1. firebase.js 로드 완료 대기
// 2. onAuthStateChanged 구독
// 3. 미로그인 시 풀스크린 로그인 오버레이 표시
// 4. 로그인 시 /users/{uid} 레코드 자동 생성 (첫 로그인)
// 5. 페이지 코드는 window.CareSafeUser 로 사용자 접근

import "./firebase.js";

const params = new URLSearchParams(location.search);
// Auth 활성 조건: ?mode=firebase 또는 firebase-test 페이지 (개발 도구도 Firebase 쓰니까)
const isFbTest = location.pathname.endsWith("firebase-test.html");
const FB_MODE = params.get("mode") === "firebase" || isFbTest;

// 로컬 모드는 인증 안 함 (시연·개발용)
if (!FB_MODE) {
  console.log("[Auth] 로컬 모드 — 인증 비활성");
} else {
  await waitForFB();
  installAuthGuard();
}

async function waitForFB(timeoutMs = 5000) {
  const t0 = Date.now();
  while (!window.CareSafeFB) {
    if (Date.now() - t0 > timeoutMs) throw new Error("Firebase SDK 로드 타임아웃");
    await new Promise((r) => setTimeout(r, 50));
  }
  return window.CareSafeFB;
}

function buildOverlay() {
  const wrap = document.createElement("div");
  wrap.id = "csAuthOverlay";
  wrap.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background:linear-gradient(135deg,#0A9396 0%,#005F73 100%);
    display:flex; align-items:center; justify-content:center;
    padding:20px; font-family:system-ui,-apple-system,sans-serif;
  `;
  wrap.innerHTML = `
    <div style="max-width:380px;width:100%;background:white;border-radius:20px;
                padding:36px 28px;text-align:center;
                box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="font-size:48px;margin-bottom:6px">🛡️</div>
      <h1 style="font-size:26px;margin:0 0 6px;color:#0F172A;letter-spacing:-0.5px">CareSafe</h1>
      <p style="color:#64748B;font-size:14px;margin:0 0 28px;line-height:1.55">
        퇴원 후 가장 불안한 2주<br>부모님 상태를 스마트폰으로 실시간 확인하세요
      </p>
      <button id="csSignInBtn"
              style="width:100%;padding:14px;background:white;border:2px solid #E2E8F0;
                     border-radius:12px;font-size:15px;font-weight:600;color:#0F172A;
                     cursor:pointer;display:flex;align-items:center;justify-content:center;
                     gap:10px;font-family:inherit;transition:border-color 0.15s;">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 계속하기
      </button>
      <p style="color:#94A3B8;font-size:11px;margin:20px 0 0;line-height:1.65">
        로그인하면 <a href="terms.html" target="_blank" style="color:#0A9396;text-decoration:none">이용약관</a>과
        <a href="privacy.html" target="_blank" style="color:#0A9396;text-decoration:none">개인정보 처리방침</a>에 동의한 것으로 간주됩니다.
        <br>본 서비스는 베타이며, 의료 진단·치료를 대체하지 않습니다.
      </p>
      <div id="csAuthError" style="color:#DC2626;font-size:13px;margin-top:14px;display:none;
                                   background:#FEE2E2;padding:10px;border-radius:8px"></div>
    </div>
  `;
  return wrap;
}

function buildUserBadge(user) {
  const b = document.createElement("div");
  b.id = "csUserBadge";
  b.style.cssText = `
    position:fixed; top:8px; left:8px; z-index:9000;
    display:flex; align-items:center; gap:6px;
    background:rgba(15,23,42,0.85); color:white; padding:4px 8px 4px 4px;
    border-radius:999px; font-size:11px; font-family:system-ui;
    box-shadow:0 2px 8px rgba(0,0,0,0.15);
  `;
  const photo = user.photoURL
    ? `<img src="${user.photoURL}" alt="" style="width:20px;height:20px;border-radius:50%;object-fit:cover">`
    : `<div style="width:20px;height:20px;border-radius:50%;background:#94A3B8;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700">${(user.displayName || user.email || "?")[0].toUpperCase()}</div>`;
  b.innerHTML = `
    ${photo}
    <span style="font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
      ${user.displayName || user.email}
    </span>
    <button id="csSignOutBtn" title="로그아웃"
            style="background:none;border:none;color:white;cursor:pointer;
                   font-size:11px;opacity:0.7;padding:2px 4px;margin-left:2px">↪</button>
  `;
  return b;
}

function installAuthGuard() {
  const FB = window.CareSafeFB;

  const overlay = buildOverlay();
  document.body.appendChild(overlay);
  overlay.style.display = "flex";

  const signInBtn = overlay.querySelector("#csSignInBtn");
  const errorEl = overlay.querySelector("#csAuthError");

  signInBtn.addEventListener("click", async () => {
    errorEl.style.display = "none";
    signInBtn.disabled = true;
    signInBtn.style.opacity = "0.6";
    const originalHtml = signInBtn.innerHTML;
    signInBtn.innerHTML = "<span>로그인 중...</span>";
    try {
      await FB.signInGoogle();
      // 성공 시 onAuthStateChanged 가 화면 토글 처리
    } catch (e) {
      console.error("[Auth] 로그인 실패:", e);
      const msg = humanizeAuthError(e);
      errorEl.textContent = msg;
      errorEl.style.display = "block";
      signInBtn.disabled = false;
      signInBtn.style.opacity = "1";
      signInBtn.innerHTML = originalHtml;
    }
  });

  FB.observeAuth(async (user) => {
    const overlay = document.getElementById("csAuthOverlay");
    const existingBadge = document.getElementById("csUserBadge");

    if (user) {
      // 로그인 성공 — 오버레이 숨김 + 뱃지 표시
      if (overlay) overlay.style.display = "none";

      // 첫 로그인 시 /users/{uid} 생성
      try {
        const existing = await FB.readPath(`/users/${user.uid}`);
        if (!existing) {
          await FB.writePath(`/users/${user.uid}`, {
            name: user.displayName || "",
            email: user.email || "",
            createdAt: Date.now(),
            role: "guardian",
            // 약관·개인정보 동의 — 가입 단계에서 받음 (오버레이 안내 문구로 간주)
            acceptedToS: Date.now(),
            acceptedPrivacy: Date.now(),
          });
          console.log("[Auth] 신규 보호자 등록:", user.email);
        }
      } catch (e) {
        console.error("[Auth] /users/{uid} 쓰기 실패:", e);
        // 보안 규칙 적용 전까지는 무시 (rule이 막을 수 있음)
      }

      // 사용자 뱃지 추가
      if (!existingBadge) {
        const badge = buildUserBadge(user);
        document.body.appendChild(badge);
        badge.querySelector("#csSignOutBtn").addEventListener("click", async () => {
          if (confirm("로그아웃 하시겠습니까?")) {
            await FB.signOutUser();
          }
        });
      }

      window.CareSafeUser = user;
      window.dispatchEvent(new CustomEvent("caresafe-auth-ready", { detail: user }));
    } else {
      // 로그아웃 — 오버레이 표시 + 뱃지 제거
      if (overlay) overlay.style.display = "flex";
      if (existingBadge) existingBadge.remove();
      window.CareSafeUser = null;
    }
  });
}

function humanizeAuthError(e) {
  const code = e?.code || "";
  if (code.includes("popup-closed-by-user")) return "로그인이 취소되었습니다.";
  if (code.includes("popup-blocked")) return "팝업이 차단되었습니다. 브라우저 설정에서 허용해주세요.";
  if (code.includes("network")) return "네트워크 연결을 확인해주세요.";
  if (code.includes("unauthorized-domain"))
    return "이 도메인에서 로그인 불가. Firebase 콘솔 ‘Authorized domains’에 추가 필요.";
  return "로그인 실패: " + (e?.message || code || "알 수 없는 오류");
}
