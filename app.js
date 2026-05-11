/* CareSafe MVP — shared state & realtime bus */
(function () {
  const STORAGE_KEY = 'caresafe:v1';
  const CHANNEL = 'caresafe';

  // ---------- seed data (서울·분당 고소득 비동거 자녀 페르소나 기반) ----------
  // v0.2: 응급정보 카드용 필드 확장 (blood, allergies, meds, diseases, doctor,
  // emergencyContacts, qrToken). qrToken은 emergency.html?token=… 으로 접근.
  const seed = {
    seniors: [
      {
        id: 'u1', name: '김영자', age: 78, gender: 'F',
        region: '서울 강남구', guardian: '김민지 (딸)', phone: '010-2xxx-1234',
        status: 'ok', battery: 92, lastPing: Date.now() - 1000 * 60 * 3,
        note: '고관절 수술 퇴원 2주차',
        blood: 'A+',
        allergies: ['페니실린'],
        meds: [
          { name: '와파린', dose: '5mg', time: '아침/저녁', for: '혈전 예방' },
          { name: '칼슘 보충제', dose: '1정', time: '점심', for: '골다공증' }
        ],
        diseases: ['고혈압', '골다공증', '심방세동'],
        doctor: { hospital: '강남세브란스병원', dept: '정형외과', name: '박지훈 교수', phone: '02-2019-3000' },
        emergencyContacts: [
          { name: '김민지 (딸)', phone: '010-2xxx-1234', priority: 1 },
          { name: '김민호 (아들)', phone: '010-9xxx-7766', priority: 2 }
        ],
        qrToken: 'a1b2c3d4e5f6'
      },
      {
        id: 'u2', name: '박순애', age: 82, gender: 'F',
        region: '분당 수내동', guardian: '박진우 (아들)', phone: '010-5xxx-7788',
        status: 'ok', battery: 74, lastPing: Date.now() - 1000 * 60 * 8,
        note: '고혈압·당뇨 관리',
        blood: 'B+',
        allergies: ['아스피린', '조개류'],
        meds: [
          { name: '메트포르민', dose: '500mg', time: '아침/저녁', for: '당뇨' },
          { name: '암로디핀', dose: '5mg', time: '아침', for: '혈압' }
        ],
        diseases: ['2형 당뇨', '고혈압', '백내장 수술 이력'],
        doctor: { hospital: '분당서울대병원', dept: '내분비내과', name: '한지영 교수', phone: '031-787-7114' },
        emergencyContacts: [
          { name: '박진우 (아들)', phone: '010-5xxx-7788', priority: 1 },
          { name: '박소연 (며느리)', phone: '010-6xxx-1199', priority: 2 }
        ],
        qrToken: 'b2c3d4e5f6a1'
      },
      {
        id: 'u3', name: '이정호', age: 75, gender: 'M',
        region: '서울 서초구', guardian: '이수연 (딸)', phone: '010-7xxx-4120',
        status: 'warn', battery: 31, lastPing: Date.now() - 1000 * 60 * 22,
        note: '뇌졸중 재활 중',
        blood: 'O+',
        allergies: [],
        meds: [
          { name: '클로피도그렐', dose: '75mg', time: '아침', for: '혈전 예방' },
          { name: '아토르바스타틴', dose: '20mg', time: '저녁', for: '콜레스테롤' }
        ],
        diseases: ['뇌경색 (좌측 편마비 회복기)', '고지혈증'],
        doctor: { hospital: '서울아산병원', dept: '재활의학과', name: '정수민 교수', phone: '02-3010-3114' },
        emergencyContacts: [
          { name: '이수연 (딸)', phone: '010-7xxx-4120', priority: 1 },
          { name: '이영자 (배우자)', phone: '010-4xxx-2280', priority: 2 }
        ],
        qrToken: 'c3d4e5f6a1b2'
      },
      {
        id: 'u4', name: '최명숙', age: 84, gender: 'F',
        region: '분당 정자동', guardian: '최현우 (아들)', phone: '010-3xxx-9912',
        status: 'ok', battery: 88, lastPing: Date.now() - 1000 * 60 * 1,
        note: '척추협착증 수술 회복',
        blood: 'A-',
        allergies: ['조영제'],
        meds: [
          { name: '트라마돌', dose: '50mg', time: '필요 시', for: '통증 조절' },
          { name: '오메프라졸', dose: '20mg', time: '아침', for: '위장 보호' }
        ],
        diseases: ['요추 척추관 협착증 (수술)', '경증 치매 의심'],
        doctor: { hospital: '분당차병원', dept: '신경외과', name: '윤재민 교수', phone: '031-780-5000' },
        emergencyContacts: [
          { name: '최현우 (아들)', phone: '010-3xxx-9912', priority: 1 },
          { name: '최지원 (손녀)', phone: '010-2xxx-5544', priority: 2 }
        ],
        qrToken: 'd4e5f6a1b2c3'
      },
      {
        id: 'u5', name: '장태영', age: 79, gender: 'M',
        region: '서울 송파구', guardian: '장예린 (딸)', phone: '010-9xxx-3322',
        status: 'ok', battery: 56, lastPing: Date.now() - 1000 * 60 * 12,
        note: '심근경색 스텐트 시술',
        blood: 'B-',
        allergies: ['요오드'],
        meds: [
          { name: '아스피린', dose: '100mg', time: '아침', for: '항혈소판' },
          { name: '베타블로커', dose: '25mg', time: '아침/저녁', for: '심박 조절' },
          { name: '니트로글리세린', dose: '0.3mg', time: '발작 시', for: '협심증 응급' }
        ],
        diseases: ['관상동맥질환 (스텐트 2개)', '협심증'],
        doctor: { hospital: '서울성모병원', dept: '순환기내과', name: '강민호 교수', phone: '02-2258-1114' },
        emergencyContacts: [
          { name: '장예린 (딸)', phone: '010-9xxx-3322', priority: 1 },
          { name: '장영수 (아들)', phone: '010-1xxx-8800', priority: 2 }
        ],
        qrToken: 'e5f6a1b2c3d4'
      }
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

  // _subs와 _fireLocal은 firebase 어댑터가 같은 구독자 풀을 공유하기 위한 hook.
  // 일반 페이지 코드는 사용하지 않음.
  function fireLocal(msg) { subs.forEach(fn => fn(msg)); }

  window.CareSafe = {
    load, save, reset,
    subscribe, broadcast,
    addAlert, setStatus, setActive,
    fmtTime, fmtClock, toast,
    _subs: subs, _fireLocal: fireLocal,
  };
})();
