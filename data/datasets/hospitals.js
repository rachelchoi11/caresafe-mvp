// data/datasets/hospitals.js — CareSafe v0.2
//
// 의료기관 데이터셋 — 시니어 임상에서 자주 보는 상급종합·종합·대학병원 위주.
// 출처: 건강보험심사평가원(HIRA) 의료기관 정보 + 보건복지부 상급종합병원 지정 명단.
// 전국 ~70,000 의료기관 중 상급·종합 100여개만 정적. 동네 의원·요양병원은 직접 입력 운영.

window.CareSafeHospitals = (function () {
  const ITEMS = [
    // ===== 상급종합병원 (전국 47개) =====
    { id: 'h-snuh',      name: '서울대학교병원', aliases: ['서울대병원', 'SNUH'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-asanmc',    name: '서울아산병원', aliases: ['아산병원', 'AMC'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-samsung',   name: '삼성서울병원', aliases: ['삼성병원', 'SMC'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-severance', name: '연세대학교 세브란스병원', aliases: ['세브란스', '신촌세브란스'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-gangnam-sev', name: '강남세브란스병원', aliases: ['강남세브란스'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-kuh',       name: '고려대학교 안암병원', aliases: ['고대안암병원'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-guro-kuh',  name: '고려대학교 구로병원', aliases: ['고대구로'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cmcseoul',  name: '서울성모병원', aliases: ['가톨릭 서울성모'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-yeouido-cmc', name: '여의도성모병원', aliases: ['여의도 가톨릭'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-ewha',      name: '이대목동병원', aliases: ['이화여대 목동'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-mizmedi',   name: '한양대학교병원', aliases: ['한양대병원'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cau',       name: '중앙대학교병원', aliases: ['중앙대병원'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-konkuk',    name: '건국대학교병원', aliases: ['건대병원'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-kyunghee',  name: '경희대학교병원', aliases: ['경희대병원'], region: '서울', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-snubh',     name: '분당서울대학교병원', aliases: ['분당서울대'], region: '경기', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cha-bundang', name: '차의과대학 분당차병원', aliases: ['분당차병원'], region: '경기', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-bundang-cmc', name: '분당제생병원', aliases: ['분당제생'], region: '경기', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-ajou',      name: '아주대학교병원', aliases: ['아주대병원'], region: '경기', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-hallym',    name: '한림대학교 성심병원', aliases: ['한림성심', '평촌성심'], region: '경기', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-dongtan-sungsim', name: '한림대학교 동탄성심병원', aliases: ['동탄성심'], region: '경기', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-suwon-sm',  name: '가톨릭대학교 성빈센트병원', aliases: ['성빈센트', '수원'], region: '경기', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-koreainch', name: '인하대학교병원', aliases: ['인하대'], region: '인천', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-gachon',    name: '가천대 길병원', aliases: ['길병원'], region: '인천', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-pnu',       name: '부산대학교병원', aliases: ['부산대병원'], region: '부산', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-pnuy',      name: '양산부산대학교병원', aliases: ['양산부산대'], region: '경남', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-dongainsdu', name: '동아대학교병원', aliases: ['동아대'], region: '부산', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-inje-pussan', name: '인제대학교 부산백병원', aliases: ['부산백병원'], region: '부산', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cnuh',      name: '경북대학교병원', aliases: ['경북대병원'], region: '대구', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-knu-cm',    name: '계명대학교 동산병원', aliases: ['계명대 동산', '동산병원'], region: '대구', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-yu',        name: '영남대학교병원', aliases: ['영남대병원'], region: '대구', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cnuh-d',    name: '대구가톨릭대학교병원', aliases: ['대구가톨릭'], region: '대구', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cnuh-da',   name: '충남대학교병원', aliases: ['충남대병원'], region: '대전', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cnuh-ds',   name: '대전을지대학교병원', aliases: ['대전을지'], region: '대전', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-cbnu',      name: '충북대학교병원', aliases: ['충북대'], region: '충북', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-knuh',      name: '강원대학교병원', aliases: ['강원대'], region: '강원', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-wonju',     name: '연세대학교 원주세브란스기독병원', aliases: ['원주세브란스'], region: '강원', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-chnu-jn',   name: '전남대학교병원', aliases: ['전남대'], region: '광주', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-chosun',    name: '조선대학교병원', aliases: ['조선대'], region: '광주', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-chnu-jb',   name: '전북대학교병원', aliases: ['전북대'], region: '전북', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-wonkwang',  name: '원광대학교병원', aliases: ['원광대'], region: '전북', tier: '상급종합', source: 'HIRA-2024' },
    { id: 'h-jejunu',    name: '제주대학교병원', aliases: ['제주대'], region: '제주', tier: '상급종합', source: 'HIRA-2024' },

    // ===== 주요 종합병원 (시니어 의뢰 빈도 높음) =====
    { id: 'h-nmc',       name: '국립중앙의료원', aliases: ['NMC'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-borame',    name: '서울특별시 보라매병원', aliases: ['보라매'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-mizmedi-mz', name: '미즈메디병원', aliases: ['미즈메디'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-nokwon',    name: '노원을지대학교병원', aliases: ['노원을지'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-mokdong',   name: '목동힘찬병원', aliases: ['힘찬병원'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-seonam',    name: '서울의료원', aliases: ['시립 서울의료원'], region: '서울', tier: '종합', source: 'HIRA-2024' },
    { id: 'h-bsbm',      name: '부산시립 보훈병원', aliases: ['부산보훈'], region: '부산', tier: '종합', source: 'HIRA-2024' },

    // ===== 보훈·국가병원 =====
    { id: 'h-vetmc-seoul', name: '중앙보훈병원', aliases: ['보훈병원'], region: '서울', tier: '종합', source: '보훈처' },
    { id: 'h-nccc',      name: '국립암센터', aliases: ['암센터'], region: '경기', tier: '특수', source: '복지부' },

    // ===== 재활·요양 (시니어 다빈도) =====
    { id: 'h-rehab-natl', name: '국립재활원', aliases: ['재활원'], region: '서울', tier: '재활', source: '복지부' },
  ];

  function search(query, limit = 8) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const it of ITEMS) {
      const candidates = [it.name, it.region, ...(it.aliases || [])].map(s => String(s).toLowerCase());
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
  function byRegion(region) { return ITEMS.filter(i => i.region === region); }
  return { search, getById, all, byRegion, _items: ITEMS };
})();
