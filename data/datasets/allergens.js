// data/datasets/allergens.js — CareSafe v0.2
//
// 알레르겐 공식 데이터셋
// - 식품: 식품의약품안전처 알레르기 유발 식품 22종 (식품등의 표시·광고에 관한 법률 시행규칙 §5)
// - 의약품: 임상에서 자주 보고되는 약물 알레르기 (KIMS·식약처 의약품안전성정보)
// - 환경: 임상 빈도 높은 흡입·접촉 알레르기
//
// 출처 표기:
//   - 식약처-22식품: 표시광고법 시행규칙 §5 별표 14, 2024년 개정 기준
//   - KIMS 의약품: 의약품 알레르기 표시 가이드
//   - 임상 환경: 보편적 의학 분류
//
// 직접 입력 항목은 /custom_entries/allergens 에 별도 저장 (admin 검토 후 정식 데이터셋 반영 가능).

window.CareSafeAllergens = (function () {
  const ITEMS = [
    // ===== 식약처 알레르기 유발 식품 22종 (식품 의무 표시 대상) =====
    { id: 'food-egg',       name: '난류 (계란)', aliases: ['계란', '달걀', '에그'], category: '식품', source: '식약처-22식품' },
    { id: 'food-milk',      name: '우유', aliases: ['젖', '유제품', '밀크'], category: '식품', source: '식약처-22식품' },
    { id: 'food-buckwheat', name: '메밀', aliases: ['소바'], category: '식품', source: '식약처-22식품' },
    { id: 'food-peanut',    name: '땅콩', aliases: ['피넛'], category: '식품', source: '식약처-22식품' },
    { id: 'food-soy',       name: '대두', aliases: ['콩', '대두 단백', '두유'], category: '식품', source: '식약처-22식품' },
    { id: 'food-wheat',     name: '밀', aliases: ['글루텐', '밀가루', '면류'], category: '식품', source: '식약처-22식품' },
    { id: 'food-mackerel',  name: '고등어', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-crab',      name: '게', aliases: ['크랩'], category: '식품', source: '식약처-22식품' },
    { id: 'food-shrimp',    name: '새우', aliases: ['쉬림프'], category: '식품', source: '식약처-22식품' },
    { id: 'food-pork',      name: '돼지고기', aliases: ['포크'], category: '식품', source: '식약처-22식품' },
    { id: 'food-peach',     name: '복숭아', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-tomato',    name: '토마토', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-sulfite',   name: '아황산류 (보존료)', aliases: ['이산화황', '와인'], category: '식품', source: '식약처-22식품' },
    { id: 'food-walnut',    name: '호두', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-chicken',   name: '닭고기', aliases: ['치킨'], category: '식품', source: '식약처-22식품' },
    { id: 'food-beef',      name: '쇠고기', aliases: ['소고기', '비프'], category: '식품', source: '식약처-22식품' },
    { id: 'food-squid',     name: '오징어', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-shellfish', name: '조개류', aliases: ['굴', '홍합', '바지락', '전복'], category: '식품', source: '식약처-22식품' },
    { id: 'food-pine-nut',  name: '잣', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-almond',    name: '아몬드', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-quail-egg', name: '메추리알', aliases: [], category: '식품', source: '식약처-22식품' },
    { id: 'food-tree-nuts', name: '견과류 (혼합)', aliases: ['넛츠', '캐슈넛', '피칸', '브라질너트'], category: '식품', source: '식약처-22식품' },

    // ===== 의약품 알레르기 (임상 빈도 높음) =====
    { id: 'drug-penicillin',    name: '페니실린 계열', aliases: ['아목시실린', '암피실린', '페니실린G'], category: '의약품', source: 'KIMS-약물알레르기', criticalLabel: '항생제 알레르기' },
    { id: 'drug-cephalosporin', name: '세팔로스포린 계열', aliases: ['세파', '세파클러', '세프트리악손'], category: '의약품', source: 'KIMS-약물알레르기', criticalLabel: '항생제 알레르기' },
    { id: 'drug-sulfonamide',   name: '설폰아미드 (설파제)', aliases: ['설파', '박트림', 'TMP-SMX'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-aspirin',       name: '아스피린', aliases: ['ASA', '아세틸살리실산'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-nsaid',         name: 'NSAIDs (소염진통제)', aliases: ['이부프로펜', '나프록센', '디클로페낙', '쎄레브렉스'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-acetaminophen', name: '아세트아미노펜', aliases: ['타이레놀', '파라세타몰'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-iodine-contrast', name: '요오드 조영제', aliases: ['CT 조영제', '이오헥솔', '이오프로마이드'], category: '의약품', source: 'KIMS-약물알레르기', criticalLabel: '영상검사 주의' },
    { id: 'drug-anesthetic',    name: '국소마취제', aliases: ['리도카인', '프로카인', '벤조카인'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-quinolone',     name: '퀴놀론 계열 항생제', aliases: ['시프로플록사신', '레보플록사신'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-macrolide',     name: '마크로라이드 항생제', aliases: ['아지스로마이신', '에리스로마이신', '클라리스로마이신'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-statin',        name: '스타틴 (지질강하제)', aliases: ['아토르바스타틴', '심바스타틴', '로수바스타틴'], category: '의약품', source: 'KIMS-약물알레르기' },
    { id: 'drug-heparin',       name: '헤파린', aliases: ['저분자량 헤파린', '에녹사파린'], category: '의약품', source: 'KIMS-약물알레르기' },

    // ===== 환경·기타 (보편적 임상 분류) =====
    { id: 'env-latex',     name: '라텍스 (고무)', aliases: ['고무장갑'], category: '환경', source: '임상-환경' },
    { id: 'env-pollen',    name: '꽃가루', aliases: ['화분', '봄철 알레르기'], category: '환경', source: '임상-환경' },
    { id: 'env-dust-mite', name: '집먼지 진드기', aliases: ['진드기'], category: '환경', source: '임상-환경' },
    { id: 'env-animal-dander', name: '동물 비듬 (반려동물)', aliases: ['고양이 털', '강아지 털'], category: '환경', source: '임상-환경' },
    { id: 'env-bee-venom', name: '벌 독', aliases: ['벌침'], category: '환경', source: '임상-환경', criticalLabel: '아나필락시스 위험' },
    { id: 'env-mold',      name: '곰팡이', aliases: [], category: '환경', source: '임상-환경' },
  ];

  // 검색 — 한글 음절·alias·부분 일치
  function search(query, limit = 8) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const it of ITEMS) {
      const candidates = [it.name, ...(it.aliases || [])].map(s => s.toLowerCase());
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
