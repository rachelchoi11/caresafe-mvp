// data/datasets/implants.js — CareSafe v0.2
//
// 이식·장착 의료기기 데이터셋 — 시니어 임상에서 자주 보는 항목.
// 출처: 식약처 의료기기 분류 + KMDIA 가이드 + 임상 흔히 관찰되는 분류.
// 응급실 분기점 — MRI 호환 라벨(mriRisk)·제세동기 호환·금속 알람.
//
// 시니어 다빈도 ~40개. 직접 입력은 /custom_entries/implants 검토 큐.

window.CareSafeImplants = (function () {
  const ITEMS = [
    // ===== 정형외과 — 인공관절·금속 고정 =====
    { id: 'imp-hip-thr',     name: '인공 고관절 (THR)', aliases: ['고관절 인공', '인공 엉덩이 관절'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-knee-tkr',    name: '인공 무릎관절 (TKR)', aliases: ['무릎 인공관절', 'TKR'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-shoulder',    name: '인공 어깨관절', aliases: ['견관절 인공'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-spine-fusion',name: '척추 고정용 금속 (척추유합)', aliases: ['척추 나사', '척추 케이지'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-bone-plate',  name: '골절 고정 금속판', aliases: ['금속판', '플레이트 스크류'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-bone-screw',  name: '골절 고정 나사', aliases: ['금속 스크류'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-intramed-rod',name: '골수강내 정 (IM rod)', aliases: ['골수강 정', 'IM nail'], category: '정형외과', mriRisk: 'caution', source: '식약처-의료기기' },

    // ===== 심혈관 — 페이스메이커·스텐트·인공판막 =====
    { id: 'imp-pacemaker',   name: '심박동기 (페이스메이커)', aliases: ['페이스메이커', '심박동기', 'pacemaker'], category: '심혈관', mriRisk: 'caution', defibCompat: '특별 주의', source: '식약처-의료기기', criticalLabel: '응급실 알림 필수' },
    { id: 'imp-icd',         name: '제세동기 (ICD)', aliases: ['ICD', '이식형 제세동기'], category: '심혈관', mriRisk: 'unsafe', source: '식약처-의료기기', criticalLabel: '응급실 알림 필수' },
    { id: 'imp-crt',         name: '심장재동기화 치료기 (CRT)', aliases: ['CRT', 'CRT-D'], category: '심혈관', mriRisk: 'unsafe', source: '식약처-의료기기' },
    { id: 'imp-coronary-stent', name: '관상동맥 스텐트', aliases: ['관동맥 스텐트', '심장 스텐트'], category: '심혈관', mriRisk: 'safe', source: '식약처-의료기기' },
    { id: 'imp-aortic-valve',name: '대동맥 판막 (인공판막)', aliases: ['인공판막', 'TAVI'], category: '심혈관', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-mitral-valve',name: '승모판막 (인공)', aliases: ['승모판 인공'], category: '심혈관', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-aortic-graft',name: '대동맥 인조혈관', aliases: ['대동맥 그래프트'], category: '심혈관', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-loop-rec',    name: '이식형 심전도 기록계', aliases: ['루프 레코더', 'ILR'], category: '심혈관', mriRisk: 'caution', source: '식약처-의료기기' },

    // ===== 신경 — DBS·뇌척수 자극기 =====
    { id: 'imp-dbs',         name: '뇌 심부 자극기 (DBS)', aliases: ['DBS', '심부뇌자극'], category: '신경', mriRisk: 'unsafe', source: '식약처-의료기기' },
    { id: 'imp-spinal-stim', name: '척수신경 자극기 (SCS)', aliases: ['척수자극기', 'SCS'], category: '신경', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-vns',         name: '미주신경 자극기 (VNS)', aliases: ['VNS'], category: '신경', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-shunt',       name: '뇌실복강 단락 (VP shunt)', aliases: ['VP 셔트', 'VP shunt'], category: '신경', mriRisk: 'caution', source: '식약처-의료기기' },

    // ===== 청각 =====
    { id: 'imp-cochlear',    name: '인공 와우 (인공 달팽이관)', aliases: ['인공 와우', 'CI'], category: '청각', mriRisk: 'unsafe', source: '식약처-의료기기' },
    { id: 'imp-bone-anchored', name: '골고정 보청기 (BAHA)', aliases: ['BAHA'], category: '청각', mriRisk: 'caution', source: '식약처-의료기기' },

    // ===== 안과 =====
    { id: 'imp-iol',         name: '인공 수정체 (IOL)', aliases: ['IOL', '안내 렌즈'], category: '안과', mriRisk: 'safe', source: '식약처-의료기기' },
    { id: 'imp-glaucoma-stent', name: '녹내장 배출 임플란트', aliases: ['녹내장 임플란트'], category: '안과', mriRisk: 'safe', source: '식약처-의료기기' },

    // ===== 비뇨·기타 =====
    { id: 'imp-urinary-cath',name: '유치 도뇨관 (Foley)', aliases: ['도뇨관', 'Foley'], category: '비뇨', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-port',        name: '항암치료용 포트 (Chemo port)', aliases: ['케모포트', '포트'], category: '혈관 접근', mriRisk: 'safe', source: '식약처-의료기기' },
    { id: 'imp-cv-cath',     name: '중심정맥관 (CVC)', aliases: ['CVC', '중심정맥'], category: '혈관 접근', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-piccline',    name: 'PICC 라인', aliases: ['PICC'], category: '혈관 접근', mriRisk: 'caution', source: '식약처-의료기기' },
    { id: 'imp-peg',         name: '경피적 위루관 (PEG)', aliases: ['PEG', '위루관'], category: '소화관', mriRisk: 'safe', source: '식약처-의료기기' },
    { id: 'imp-tracheostomy',name: '기관절개관', aliases: ['기관절개', 'tracheostomy'], category: '호흡기', mriRisk: 'caution', source: '식약처-의료기기' },

    // ===== 치과 =====
    { id: 'imp-dental',      name: '치과 임플란트', aliases: ['임플란트', '치아 임플란트'], category: '치과', mriRisk: 'safe', source: '식약처-의료기기' },

    // ===== 비활성화·제거된 ID (기록 보존용) =====
    { id: 'imp-other',       name: '기타 이식 의료기기', aliases: [], category: '기타', mriRisk: 'caution', source: '식약처-의료기기' },
  ];

  function search(query, limit = 8) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const it of ITEMS) {
      const candidates = [it.name, ...(it.aliases || [])].map(s => String(s).toLowerCase());
      let bestScore = 0;
      for (const c of candidates) {
        if (c === q) bestScore = Math.max(bestScore, 100);
        else if (c.startsWith(q)) bestScore = Math.max(bestScore, 80);
        else if (c.includes(q)) bestScore = Math.max(bestScore, 50);
      }
      if (bestScore > 0) scored.push({ score: bestScore, item: it });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.item);
  }
  function getById(id) { return ITEMS.find(i => i.id === id) || null; }
  function all() { return ITEMS.slice(); }
  function byCategory(cat) { return ITEMS.filter(i => i.category === cat); }
  return { search, getById, all, byCategory, _items: ITEMS };
})();
