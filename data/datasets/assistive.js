// data/datasets/assistive.js — CareSafe v0.2
//
// 보조기기 데이터셋 — 시니어 일상 생활 보조기기.
// 출처: 식약처 의료기기 분류 + 보건복지부 노인 일상생활 지원용구 분류.
// 시니어 다빈도 ~25개. 직접 입력은 /custom_entries/assistive 검토 큐.

window.CareSafeAssistive = (function () {
  const ITEMS = [
    // ===== 청각·시각 =====
    { id: 'as-hearing-aid', name: '보청기', aliases: ['귀에 끼는 것'], category: '청각', source: '식약처-의료기기' },
    { id: 'as-glasses',     name: '안경', aliases: [], category: '시각', source: '일상' },
    { id: 'as-reading-glasses', name: '돋보기 안경', aliases: ['돋보기'], category: '시각', source: '일상' },
    { id: 'as-magnifier',   name: '확대 돋보기 (휴대용)', aliases: ['루페'], category: '시각', source: '일상' },
    { id: 'as-cataract-iol',name: '인공수정체 (IOL) 착용', aliases: [], category: '시각', source: '식약처-의료기기' },

    // ===== 치과 =====
    { id: 'as-denture-full',name: '의치 (전체 틀니)', aliases: ['틀니'], category: '치과', source: '식약처-의료기기' },
    { id: 'as-denture-partial', name: '의치 (부분 틀니)', aliases: ['부분 틀니'], category: '치과', source: '식약처-의료기기' },
    { id: 'as-dental-implant-bridge', name: '치과 임플란트·브릿지', aliases: ['임플란트'], category: '치과', source: '식약처-의료기기' },

    // ===== 이동·보행 =====
    { id: 'as-walking-cane',name: '지팡이', aliases: ['스틱'], category: '이동', source: '일상' },
    { id: 'as-walker',      name: '보행기 (롤레이터)', aliases: ['보행보조기'], category: '이동', source: '식약처-의료기기' },
    { id: 'as-walker-wheel',name: '바퀴 달린 보행기', aliases: ['바퀴 워커'], category: '이동', source: '식약처-의료기기' },
    { id: 'as-wheelchair-manual', name: '수동 휠체어', aliases: ['휠체어'], category: '이동', source: '식약처-의료기기' },
    { id: 'as-wheelchair-electric', name: '전동 휠체어', aliases: ['전동 휠체어'], category: '이동', source: '식약처-의료기기' },
    { id: 'as-scooter',     name: '전동 스쿠터', aliases: ['실버 스쿠터'], category: '이동', source: '식약처-의료기기' },
    { id: 'as-crutches',    name: '목발', aliases: ['크러치'], category: '이동', source: '일상' },

    // ===== 호흡 =====
    { id: 'as-oxygen-conc', name: '산소발생기', aliases: ['산소 호흡기'], category: '호흡', source: '식약처-의료기기' },
    { id: 'as-cpap',        name: '양압기 (CPAP)', aliases: ['CPAP', '수면무호흡 기계'], category: '호흡', source: '식약처-의료기기' },
    { id: 'as-nebulizer',   name: '네뷸라이저 (흡입기)', aliases: ['네뷸라이저'], category: '호흡', source: '식약처-의료기기' },

    // ===== 자가 모니터링 =====
    { id: 'as-bp-monitor',  name: '가정용 혈압계', aliases: ['혈압계'], category: '모니터링', source: '식약처-의료기기' },
    { id: 'as-glucose-meter', name: '혈당측정기', aliases: ['혈당계'], category: '모니터링', source: '식약처-의료기기' },
    { id: 'as-cgm',         name: '연속혈당측정기 (CGM)', aliases: ['CGM'], category: '모니터링', source: '식약처-의료기기' },
    { id: 'as-pulse-ox',    name: '맥박산소측정기', aliases: ['산소포화도 측정기', 'SpO2'], category: '모니터링', source: '식약처-의료기기' },

    // ===== 생활 =====
    { id: 'as-grab-bar',    name: '안전 손잡이 (그랩바)', aliases: ['손잡이'], category: '생활', source: '일상' },
    { id: 'as-shower-chair',name: '샤워 의자', aliases: [], category: '생활', source: '일상' },
    { id: 'as-bed-rail',    name: '침대 안전바', aliases: ['침대바'], category: '생활', source: '일상' },
    { id: 'as-diaper',      name: '성인용 기저귀', aliases: ['요실금 기저귀'], category: '생활', source: '일상' },
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
