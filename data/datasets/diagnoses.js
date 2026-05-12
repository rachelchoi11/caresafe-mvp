// data/datasets/diagnoses.js — CareSafe v0.2
//
// 진단명 데이터셋 — 시니어 다빈도 질환 (KCD-8 한국표준질병사인분류 기준)
// 출처:
//   - 통계청 KCD-8 (Korean Classification of Diseases 8th)
//   - 국민건강보험공단 노인 외래·입원 다빈도 통계
//
// 전체 ~16,000코드 중 시니어 임상 핵심 ~200개. 직접 입력은 /custom_entries/diagnoses 검토 큐.

window.CareSafeDiagnoses = (function () {
  const ITEMS = [
    // ===== 순환기계 (I00-I99) — 시니어 최다빈도 =====
    { id: 'dx-I10',   code: 'I10',   name: '본태성 고혈압', aliases: ['고혈압', '혈압'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I11',   code: 'I11',   name: '고혈압성 심장병', aliases: ['고혈압 심장병'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I20',   code: 'I20',   name: '협심증', aliases: ['앙기나'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I21',   code: 'I21',   name: '급성 심근경색증', aliases: ['심근경색', '심장마비'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I25',   code: 'I25',   name: '만성 허혈성 심장병', aliases: ['협심증 만성', '관상동맥질환'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I48',   code: 'I48',   name: '심방세동·심방조동', aliases: ['부정맥', '심방세동', 'AF'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I50',   code: 'I50',   name: '심부전', aliases: ['심장기능 저하', 'CHF'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I63',   code: 'I63',   name: '뇌경색증', aliases: ['뇌졸중', '중풍', '스트로크'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I64',   code: 'I64',   name: '뇌졸중 (출혈·경색 미상)', aliases: [], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I65',   code: 'I65',   name: '뇌혈관 협착·폐쇄', aliases: ['경동맥 협착'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I69',   code: 'I69',   name: '뇌혈관질환 후유증', aliases: ['뇌졸중 후유증'], category: '순환기', source: 'KCD-8' },
    { id: 'dx-I83',   code: 'I83',   name: '하지 정맥류', aliases: ['정맥류'], category: '순환기', source: 'KCD-8' },

    // ===== 내분비·대사 (E00-E89) =====
    { id: 'dx-E11',   code: 'E11',   name: '제2형 당뇨병', aliases: ['당뇨', '당뇨병'], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E10',   code: 'E10',   name: '제1형 당뇨병', aliases: ['1형 당뇨'], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E78',   code: 'E78',   name: '이상지질혈증 (고지혈증)', aliases: ['고지혈증', '콜레스테롤'], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E03',   code: 'E03',   name: '기타 갑상선기능저하증', aliases: ['갑상선저하'], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E05',   code: 'E05',   name: '갑상선중독증 (항진증)', aliases: ['갑상선항진'], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E66',   code: 'E66',   name: '비만', aliases: [], category: '내분비', source: 'KCD-8' },
    { id: 'dx-E86',   code: 'E86',   name: '체액량 감소 (탈수)', aliases: ['탈수'], category: '내분비', source: 'KCD-8' },

    // ===== 신경계 (G00-G99) — 치매·파킨슨 =====
    { id: 'dx-G20',   code: 'G20',   name: '파킨슨병', aliases: ['파킨슨'], category: '신경', source: 'KCD-8' },
    { id: 'dx-G30',   code: 'G30',   name: '알츠하이머병', aliases: ['알츠하이머', '치매 알츠하이머형'], category: '신경', source: 'KCD-8' },
    { id: 'dx-F00',   code: 'F00',   name: '알츠하이머병에서의 치매', aliases: [], category: '신경/정신', source: 'KCD-8' },
    { id: 'dx-F01',   code: 'F01',   name: '혈관성 치매', aliases: [], category: '신경/정신', source: 'KCD-8' },
    { id: 'dx-F03',   code: 'F03',   name: '상세불명의 치매', aliases: ['치매'], category: '신경/정신', source: 'KCD-8' },
    { id: 'dx-G40',   code: 'G40',   name: '뇌전증 (간질)', aliases: ['간질', '뇌전증'], category: '신경', source: 'KCD-8' },
    { id: 'dx-G45',   code: 'G45',   name: '일과성 뇌허혈발작 (TIA)', aliases: ['TIA', '일시 마비'], category: '신경', source: 'KCD-8' },
    { id: 'dx-G47',   code: 'G47',   name: '수면장애', aliases: ['불면증'], category: '신경', source: 'KCD-8' },

    // ===== 정신 (F00-F99) =====
    { id: 'dx-F32',   code: 'F32',   name: '우울 에피소드', aliases: ['우울증', '우울'], category: '정신', source: 'KCD-8' },
    { id: 'dx-F33',   code: 'F33',   name: '재발성 우울장애', aliases: ['반복성 우울'], category: '정신', source: 'KCD-8' },
    { id: 'dx-F41',   code: 'F41',   name: '기타 불안장애', aliases: ['불안', '공황'], category: '정신', source: 'KCD-8' },
    { id: 'dx-F51',   code: 'F51',   name: '비기질성 수면장애', aliases: ['불면증'], category: '정신', source: 'KCD-8' },

    // ===== 호흡기 (J00-J99) =====
    { id: 'dx-J18',   code: 'J18',   name: '폐렴 (병원체 미상)', aliases: ['폐렴'], category: '호흡기', source: 'KCD-8' },
    { id: 'dx-J44',   code: 'J44',   name: '만성 폐쇄성 폐질환 (COPD)', aliases: ['COPD', '만성폐쇄성폐질환'], category: '호흡기', source: 'KCD-8' },
    { id: 'dx-J45',   code: 'J45',   name: '천식', aliases: ['아스마'], category: '호흡기', source: 'KCD-8' },
    { id: 'dx-J47',   code: 'J47',   name: '기관지확장증', aliases: [], category: '호흡기', source: 'KCD-8' },

    // ===== 소화기 (K00-K99) =====
    { id: 'dx-K21',   code: 'K21',   name: '위식도 역류병 (GERD)', aliases: ['역류성 식도염', 'GERD'], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K25',   code: 'K25',   name: '위궤양', aliases: [], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K29',   code: 'K29',   name: '위염·십이지장염', aliases: ['위염'], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K58',   code: 'K58',   name: '과민성 장증후군 (IBS)', aliases: ['IBS'], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K59',   code: 'K59',   name: '변비', aliases: [], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K70',   code: 'K70',   name: '알코올성 간질환', aliases: ['알콜성간염'], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K74',   code: 'K74',   name: '간섬유증·간경변증', aliases: ['간경화'], category: '소화기', source: 'KCD-8' },
    { id: 'dx-K80',   code: 'K80',   name: '담석증', aliases: ['담석'], category: '소화기', source: 'KCD-8' },

    // ===== 근골격계 (M00-M99) =====
    { id: 'dx-M15',   code: 'M15',   name: '다발성 관절증', aliases: [], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M16',   code: 'M16',   name: '고관절 관절증', aliases: ['고관절염'], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M17',   code: 'M17',   name: '무릎 관절증 (퇴행성)', aliases: ['무릎 관절염', '관절염'], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M19',   code: 'M19',   name: '기타 관절증', aliases: [], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M25',   code: 'M25',   name: '관절통', aliases: [], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M47',   code: 'M47',   name: '척추증 (척추협착)', aliases: ['척추 협착증'], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M48',   code: 'M48',   name: '기타 척추병증', aliases: [], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M54',   code: 'M54',   name: '등통증·요통', aliases: ['요통', '허리 통증'], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M79',   code: 'M79',   name: '기타 연조직 통증', aliases: [], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M80',   code: 'M80',   name: '병적 골절을 동반한 골다공증', aliases: ['골다공증 골절'], category: '근골격', source: 'KCD-8' },
    { id: 'dx-M81',   code: 'M81',   name: '골다공증', aliases: [], category: '근골격', source: 'KCD-8' },

    // ===== 비뇨생식기 (N00-N99) =====
    { id: 'dx-N18',   code: 'N18',   name: '만성 신장병', aliases: ['만성신부전', 'CKD'], category: '비뇨', source: 'KCD-8' },
    { id: 'dx-N39',   code: 'N39',   name: '비뇨계의 기타 장애 (요로감염)', aliases: ['요로감염', 'UTI'], category: '비뇨', source: 'KCD-8' },
    { id: 'dx-N40',   code: 'N40',   name: '전립선 비대증 (BPH)', aliases: ['전립선비대', 'BPH'], category: '비뇨', source: 'KCD-8' },

    // ===== 눈·귀 (H00-H95) =====
    { id: 'dx-H25',   code: 'H25',   name: '노년성 백내장', aliases: ['백내장'], category: '눈', source: 'KCD-8' },
    { id: 'dx-H35',   code: 'H35',   name: '망막의 장애', aliases: ['황반변성'], category: '눈', source: 'KCD-8' },
    { id: 'dx-H40',   code: 'H40',   name: '녹내장', aliases: [], category: '눈', source: 'KCD-8' },
    { id: 'dx-H90',   code: 'H90',   name: '전음성·감각신경성 난청', aliases: ['난청', '청력저하'], category: '귀', source: 'KCD-8' },

    // ===== 종양 (C00-D48) — 자주 보는 것 =====
    { id: 'dx-C16',   code: 'C16',   name: '위 악성신생물', aliases: ['위암'], category: '종양', source: 'KCD-8' },
    { id: 'dx-C18',   code: 'C18',   name: '결장 악성신생물', aliases: ['대장암'], category: '종양', source: 'KCD-8' },
    { id: 'dx-C34',   code: 'C34',   name: '폐 악성신생물', aliases: ['폐암'], category: '종양', source: 'KCD-8' },
    { id: 'dx-C50',   code: 'C50',   name: '유방 악성신생물', aliases: ['유방암'], category: '종양', source: 'KCD-8' },
    { id: 'dx-C61',   code: 'C61',   name: '전립선 악성신생물', aliases: ['전립선암'], category: '종양', source: 'KCD-8' },
    { id: 'dx-D32',   code: 'D32',   name: '뇌수막 양성신생물', aliases: ['수막종'], category: '종양', source: 'KCD-8' },

    // ===== 혈액 (D50-D89) =====
    { id: 'dx-D50',   code: 'D50',   name: '철결핍빈혈', aliases: ['빈혈'], category: '혈액', source: 'KCD-8' },
    { id: 'dx-D64',   code: 'D64',   name: '기타 빈혈', aliases: [], category: '혈액', source: 'KCD-8' },

    // ===== 손상 (S00-T98) =====
    { id: 'dx-S72',   code: 'S72',   name: '대퇴골 골절', aliases: ['고관절 골절', '대퇴골절'], category: '손상', source: 'KCD-8' },
    { id: 'dx-S52',   code: 'S52',   name: '아래팔 골절', aliases: ['손목 골절'], category: '손상', source: 'KCD-8' },
    { id: 'dx-S22',   code: 'S22',   name: '늑골·흉골·흉추 골절', aliases: ['갈비뼈 골절'], category: '손상', source: 'KCD-8' },
    { id: 'dx-T14',   code: 'T14',   name: '신체부위 미상의 손상', aliases: ['외상'], category: '손상', source: 'KCD-8' },

    // ===== 알레르기·면역 =====
    { id: 'dx-T78',   code: 'T78',   name: '알레르기 (분류되지 않은)', aliases: ['알레르기'], category: '알레르기', source: 'KCD-8' },

    // ===== 피부 =====
    { id: 'dx-L40',   code: 'L40',   name: '건선', aliases: [], category: '피부', source: 'KCD-8' },
    { id: 'dx-L98',   code: 'L98',   name: '피부 궤양 (욕창 등)', aliases: ['욕창'], category: '피부', source: 'KCD-8' },
  ];

  function search(query, limit = 8) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const scored = [];
    for (const it of ITEMS) {
      const candidates = [it.name, it.code, ...(it.aliases || [])].map(s => String(s).toLowerCase());
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
