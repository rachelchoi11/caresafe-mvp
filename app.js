/* CareSafe MVP — shared state & realtime bus */
(function () {
  const STORAGE_KEY = 'caresafe:v1';
  const CHANNEL = 'caresafe';

  // ---------- seed data (서울·분당 고소득 비동거 자녀 페르소나 기반) ----------
  // v0.2: 응급정보 카드용 필드 확장 (blood, allergies, meds, diseases, doctor,
  // emergencyContacts, qrToken). qrToken은 emergency.html?token=… 으로 접근.
  const seed = {
    // 응급카드 강화 (Phase 2 #2): 한국 의료 표준 정렬
    // - meds.critical: anticoagulant/antiplatelet/insulin/steroid (적색 강조)
    // - allergies: { agent, reaction, severity:'mild'|'severe' } 양상 분리
    // - advanceDirective: DNR/사전연명의료의향서 (등록증 번호만, 내용은 lst.go.kr)
    // - recentHistory: 최근 2~4주 입원·수술 이력
    // - cognitiveBaseline: 평소 의식 수준 (의식 저하 시 비교 기준)
    // - implants: 이식 의료기기 (MRI·제세동 결정 보조)
    // - assistiveDevices: 보조기기 (소통·낙상 평가)
    // 근거: 보건복지부 E-Gen, 의료기관평가인증원, 대한응급의학회 SAMPLE, 국립연명의료관리기관, Vial of Life
    seniors: [
      {
        id: 'u1', name: '김영자', age: 78, gender: 'F',
        height: 158, weight: 52,
        region: '서울 강남구', guardian: '김민지 (딸)', phone: '010-2xxx-1234',
        status: 'ok', battery: 92, lastPing: Date.now() - 1000 * 60 * 3,
        note: '고관절 수술 퇴원 2주차',
        blood: 'A+',
        allergies: [
          { agent: '페니실린', reaction: '발진·두드러기', severity: 'mild' }
        ],
        meds: [
          { name: '와파린', dose: '5mg', time: '아침/저녁', for: '혈전 예방', critical: 'anticoagulant' },
          { name: '칼슘 보충제', dose: '1정', time: '점심', for: '골다공증' }
        ],
        diseases: ['고혈압', '골다공증', '심방세동'],
        doctor: { hospital: '강남세브란스병원', dept: '정형외과', name: '박지훈 교수', phone: '02-2019-3000', erPhone: '02-2019-4111' },
        emergencyContacts: [
          { name: '김민지 (딸)', phone: '010-2xxx-1234', priority: 1 },
          { name: '김민호 (아들)', phone: '010-9xxx-7766', priority: 2 }
        ],
        advanceDirective: { registered: false, registryNumber: null },
        recentHistory: [
          { date: '2026-04-25', type: '수술', description: '좌측 고관절 인공관절 치환술' },
          { date: '2026-04-23', type: '입원', description: '강남세브란스병원 정형외과 (입원 7일)' }
        ],
        cognitiveBaseline: 'alert',
        implants: [
          { type: 'joint', description: '좌측 고관절 인공관절 (티타늄)', date: '2026-04-25', mriRisk: 'safe' }
        ],
        assistiveDevices: ['안경', '보행기'],
        qrToken: 'a1b2c3d4e5f6'
      },
      {
        id: 'u2', name: '박순애', age: 82, gender: 'F',
        height: 152, weight: 60,
        region: '분당 수내동', guardian: '박진우 (아들)', phone: '010-5xxx-7788',
        status: 'ok', battery: 74, lastPing: Date.now() - 1000 * 60 * 8,
        note: '고혈압·당뇨 관리',
        blood: 'B+',
        allergies: [
          { agent: '아스피린', reaction: '발진', severity: 'mild' },
          { agent: '갑각류 (조개·새우)', reaction: '아나필락시스', severity: 'severe' }
        ],
        meds: [
          { name: '메트포르민', dose: '500mg', time: '아침/저녁', for: '당뇨' },
          { name: '암로디핀', dose: '5mg', time: '아침', for: '혈압' }
        ],
        diseases: ['2형 당뇨', '고혈압', '백내장 수술 이력'],
        doctor: { hospital: '분당서울대병원', dept: '내분비내과', name: '한지영 교수', phone: '031-787-7114', erPhone: '031-787-7119' },
        emergencyContacts: [
          { name: '박진우 (아들)', phone: '010-5xxx-7788', priority: 1 },
          { name: '박소연 (며느리)', phone: '010-6xxx-1199', priority: 2 }
        ],
        advanceDirective: { registered: true, registryNumber: 'LST-2025-087654' },
        recentHistory: [
          { date: '2026-05-04', type: '검진', description: '정기 당화혈색소·혈압 검진 (외래)' }
        ],
        cognitiveBaseline: 'alert',
        implants: [
          { type: 'iol', description: '양안 인공수정체 (백내장 수술 후)', date: '2023-09-15', mriRisk: 'safe' }
        ],
        assistiveDevices: ['돋보기'],
        qrToken: 'b2c3d4e5f6a1'
      },
      {
        id: 'u3', name: '이정호', age: 75, gender: 'M',
        height: 168, weight: 65,
        region: '서울 서초구', guardian: '이수연 (딸)', phone: '010-7xxx-4120',
        status: 'warn', battery: 31, lastPing: Date.now() - 1000 * 60 * 22,
        note: '뇌졸중 재활 중',
        blood: 'O+',
        allergies: [],
        meds: [
          { name: '클로피도그렐', dose: '75mg', time: '아침', for: '혈전 예방', critical: 'antiplatelet' },
          { name: '아토르바스타틴', dose: '20mg', time: '저녁', for: '콜레스테롤' }
        ],
        diseases: ['뇌경색 (좌측 편마비 회복기)', '고지혈증'],
        doctor: { hospital: '서울아산병원', dept: '재활의학과', name: '정수민 교수', phone: '02-3010-3114', erPhone: '02-3010-3333' },
        emergencyContacts: [
          { name: '이수연 (딸)', phone: '010-7xxx-4120', priority: 1 },
          { name: '이영자 (배우자)', phone: '010-4xxx-2280', priority: 2 }
        ],
        advanceDirective: { registered: true, registryNumber: 'LST-2025-034521' },
        recentHistory: [
          { date: '2026-04-18', type: '입원', description: '서울아산병원 신경과 (뇌경색 급성기, 7일)' },
          { date: '2026-04-25', type: '전과', description: '재활의학과 (재활 치료)' }
        ],
        cognitiveBaseline: 'mild_impairment',
        implants: [],
        assistiveDevices: ['보행기', '보청기 (좌측)'],
        qrToken: 'c3d4e5f6a1b2'
      },
      {
        id: 'u4', name: '최명숙', age: 84, gender: 'F',
        height: 150, weight: 48,
        region: '분당 정자동', guardian: '최현우 (아들)', phone: '010-3xxx-9912',
        status: 'ok', battery: 88, lastPing: Date.now() - 1000 * 60 * 1,
        note: '척추협착증 수술 회복',
        blood: 'A-',
        allergies: [
          { agent: '조영제 (요오드계)', reaction: '아나필락시스', severity: 'severe' }
        ],
        meds: [
          { name: '트라마돌', dose: '50mg', time: '필요 시', for: '통증 조절' },
          { name: '오메프라졸', dose: '20mg', time: '아침', for: '위장 보호' }
        ],
        diseases: ['요추 척추관 협착증 (수술)', '경증 치매'],
        doctor: { hospital: '분당차병원', dept: '신경외과', name: '윤재민 교수', phone: '031-780-5000', erPhone: '031-780-5100' },
        emergencyContacts: [
          { name: '최현우 (아들)', phone: '010-3xxx-9912', priority: 1 },
          { name: '최지원 (손녀)', phone: '010-2xxx-5544', priority: 2 }
        ],
        advanceDirective: { registered: true, registryNumber: 'LST-2024-198472' },
        recentHistory: [
          { date: '2026-04-22', type: '수술', description: '요추 4-5번 척추관 협착증 감압술' },
          { date: '2026-04-19', type: '입원', description: '분당차병원 신경외과 (입원 9일)' }
        ],
        cognitiveBaseline: 'dementia_mild',
        implants: [
          { type: 'spine', description: '요추 4-5번 척추 케이지 (수술 시 삽입)', date: '2026-04-22', mriRisk: 'caution' }
        ],
        assistiveDevices: ['보청기', '의치 (상악)'],
        qrToken: 'd4e5f6a1b2c3'
      },
      {
        id: 'u5', name: '장태영', age: 79, gender: 'M',
        height: 172, weight: 70,
        region: '서울 송파구', guardian: '장예린 (딸)', phone: '010-9xxx-3322',
        status: 'ok', battery: 56, lastPing: Date.now() - 1000 * 60 * 12,
        note: '심근경색 스텐트 시술',
        blood: 'B-',
        allergies: [
          { agent: '요오드 (조영제 포함)', reaction: '아나필락시스', severity: 'severe' }
        ],
        meds: [
          { name: '아스피린', dose: '100mg', time: '아침', for: '항혈소판', critical: 'antiplatelet' },
          { name: '베타블로커 (비소프롤롤)', dose: '2.5mg', time: '아침/저녁', for: '심박 조절' },
          { name: '니트로글리세린 (설하정)', dose: '0.3mg', time: '발작 시', for: '협심증 응급' }
        ],
        diseases: ['관상동맥질환 (스텐트 2개)', '협심증', '경증 고지혈증'],
        doctor: { hospital: '서울성모병원', dept: '순환기내과', name: '강민호 교수', phone: '02-2258-1114', erPhone: '02-2258-7119' },
        emergencyContacts: [
          { name: '장예린 (딸)', phone: '010-9xxx-3322', priority: 1 },
          { name: '장영수 (아들)', phone: '010-1xxx-8800', priority: 2 }
        ],
        advanceDirective: { registered: false, registryNumber: null },
        recentHistory: [
          { date: '2026-04-26', type: '시술', description: 'PCI (좌전하행지 스텐트 1개 추가)' },
          { date: '2026-04-25', type: '입원', description: '서울성모병원 순환기내과 (입원 3일)' }
        ],
        cognitiveBaseline: 'alert',
        implants: [
          { type: 'stent', description: '관상동맥 약물용출 스텐트 2개 (좌전하행지·우관상동맥)', date: '2024-08-12', mriRisk: 'safe' }
        ],
        assistiveDevices: ['안경'],
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
