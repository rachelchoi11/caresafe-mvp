/* CareSafe MVP — shared state & realtime bus */
(function () {
  const STORAGE_KEY = 'caresafe:v1';
  const CHANNEL = 'caresafe';

  // ---------- seed data (서울·분당 고소득 비동거 자녀 페르소나 기반) ----------
  const seed = {
    seniors: [
      { id: 'u1', name: '김영자', age: 78, region: '서울 강남구', guardian: '김민지 (딸)', phone: '010-2xxx-1234', status: 'ok', battery: 92, lastPing: Date.now() - 1000 * 60 * 3, note: '고관절 수술 퇴원 2주차' },
      { id: 'u2', name: '박순애', age: 82, region: '분당 수내동', guardian: '박진우 (아들)', phone: '010-5xxx-7788', status: 'ok', battery: 74, lastPing: Date.now() - 1000 * 60 * 8, note: '고혈압·당뇨 관리' },
      { id: 'u3', name: '이정호', age: 75, region: '서울 서초구', guardian: '이수연 (딸)', phone: '010-7xxx-4120', status: 'warn', battery: 31, lastPing: Date.now() - 1000 * 60 * 22, note: '뇌졸중 재활 중' },
      { id: 'u4', name: '최명숙', age: 84, region: '분당 정자동', guardian: '최현우 (아들)', phone: '010-3xxx-9912', status: 'ok', battery: 88, lastPing: Date.now() - 1000 * 60 * 1, note: '척추협착증 수술 회복' },
      { id: 'u5', name: '장태영', age: 79, region: '서울 송파구', guardian: '장예린 (딸)', phone: '010-9xxx-3322', status: 'ok', battery: 56, lastPing: Date.now() - 1000 * 60 * 12, note: '심근경색 스텐트 시술' }
    ],
    alerts: [
      { id: 'a1', uid: 'u3', type: 'battery', level: 'warn', text: '기기 배터리 31% — 충전이 필요합니다', time: Date.now() - 1000 * 60 * 22 },
      { id: 'a2', uid: 'u2', type: 'medication', level: 'warn', text: '오전 복약 알림 — 15분 내 확인 필요', time: Date.now() - 1000 * 60 * 45 },
      { id: 'a3', uid: 'u1', type: 'activity', level: 'ok', text: '오전 활동 감지 — 정상 리듬', time: Date.now() - 1000 * 60 * 3 },
      { id: 'a4', uid: 'u4', type: 'activity', level: 'ok', text: '체크인 완료 — 외출 후 귀가', time: Date.now() - 1000 * 60 * 60 * 2 }
    ],
    activeUid: 'u1'
  };

  // ---------- storage ----------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { save(seed); return JSON.parse(JSON.stringify(seed)); }
      return JSON.parse(raw);
    } catch (e) {
      save(seed);
      return JSON.parse(JSON.stringify(seed));
    }
  }
  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    broadcast({ type: 'reset' });
    location.reload();
  }

  // ---------- realtime bus ----------
  const bus = ('BroadcastChannel' in window) ? new BroadcastChannel(CHANNEL) : null;
  const subs = [];
  if (bus) bus.onmessage = (e) => subs.forEach(fn => fn(e.data));
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) subs.forEach(fn => fn({ type: 'sync' }));
  });

  function subscribe(fn) { subs.push(fn); return () => { const i = subs.indexOf(fn); if (i >= 0) subs.splice(i, 1); }; }
  function broadcast(msg) { if (bus) bus.postMessage(msg); }

  // ---------- mutation helpers ----------
  function addAlert(alert) {
    const state = load();
    const full = Object.assign({ id: 'a' + Date.now(), time: Date.now() }, alert);
    state.alerts.unshift(full);
    const senior = state.seniors.find(s => s.id === full.uid);
    if (senior) {
      senior.lastPing = Date.now();
      if (full.level === 'danger') senior.status = 'danger';
      else if (full.level === 'warn' && senior.status === 'ok') senior.status = 'warn';
    }
    save(state);
    broadcast({ type: 'alert', payload: full });
    return full;
  }

  function setStatus(uid, status) {
    const state = load();
    const senior = state.seniors.find(s => s.id === uid);
    if (senior) { senior.status = status; senior.lastPing = Date.now(); save(state); broadcast({ type: 'status', uid, status }); }
  }

  function setActive(uid) {
    const state = load();
    state.activeUid = uid;
    save(state);
    broadcast({ type: 'active', uid });
  }

  // ---------- formatting ----------
  function fmtTime(ts) {
    const d = new Date(ts);
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return d.getMonth() + 1 + '/' + d.getDate();
  }
  function fmtClock(ts) {
    const d = new Date(ts);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  // ---------- toast ----------
  function toast(text, level) {
    let root = document.querySelector('.toast-root');
    if (!root) { root = document.createElement('div'); root.className = 'toast-root'; document.body.appendChild(root); }
    const el = document.createElement('div');
    el.className = 'toast ' + (level || '');
    el.textContent = text;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
  }

  window.CareSafe = {
    load, save, reset,
    subscribe, broadcast,
    addAlert, setStatus, setActive,
    fmtTime, fmtClock, toast
  };
})();
