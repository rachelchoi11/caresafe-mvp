// data/datasets/medications.js — CareSafe v0.2
//
// 의약품 데이터셋 (성분명 중심) — 시니어 임상에서 자주 처방되는 약물.
// 출처:
//   - 식품의약품안전처 의약품정보 (e약은마루)
//   - KIMS·KPIC 임상가이드
//   - 보건복지부 노인 다빈도 처방 통계
//
// 전체 4만 종 중 시니어 핵심 ~150종만 정적 수록. 직접 입력은 /custom_entries/medications 검토 큐.
// 응급 분류(criticalCategory): anticoagulant·antiplatelet·insulin·steroid — 응급실 처치 분기점.

window.CareSafeMedications = (function () {
  const ITEMS = [
    // ===== 항응고제·항혈소판제 (출혈 위험 — 응급 시 적색 강조) =====
    { id: 'med-warfarin',    name: '와파린', aliases: ['쿠마딘', 'warfarin'], category: '항응고제', criticalCategory: 'anticoagulant', source: '식약처-의약품' },
    { id: 'med-rivaroxaban', name: '리바록사반', aliases: ['자렐토', 'xarelto'], category: '항응고제', criticalCategory: 'anticoagulant', source: '식약처-의약품' },
    { id: 'med-apixaban',    name: '아픽사반', aliases: ['엘리퀴스', 'eliquis'], category: '항응고제', criticalCategory: 'anticoagulant', source: '식약처-의약품' },
    { id: 'med-dabigatran',  name: '다비가트란', aliases: ['프라닥사', 'pradaxa'], category: '항응고제', criticalCategory: 'anticoagulant', source: '식약처-의약품' },
    { id: 'med-edoxaban',    name: '에독사반', aliases: ['릭시아나', 'lixiana'], category: '항응고제', criticalCategory: 'anticoagulant', source: '식약처-의약품' },
    { id: 'med-aspirin-ld',  name: '아스피린 (저용량)', aliases: ['아스피린 100mg', 'ASA 100mg'], category: '항혈소판제', criticalCategory: 'antiplatelet', source: '식약처-의약품' },
    { id: 'med-clopidogrel', name: '클로피도그렐', aliases: ['플라빅스', 'plavix'], category: '항혈소판제', criticalCategory: 'antiplatelet', source: '식약처-의약품' },
    { id: 'med-ticagrelor',  name: '티카그렐러', aliases: ['브릴린타', 'brilinta'], category: '항혈소판제', criticalCategory: 'antiplatelet', source: '식약처-의약품' },
    { id: 'med-prasugrel',   name: '프라수그렐', aliases: ['에피언트', 'effient'], category: '항혈소판제', criticalCategory: 'antiplatelet', source: '식약처-의약품' },

    // ===== 당뇨 (인슐린·경구혈당강하제) =====
    { id: 'med-insulin-glargine', name: '인슐린 글라진', aliases: ['란투스', '투제오', 'lantus'], category: '인슐린', criticalCategory: 'insulin', source: '식약처-의약품' },
    { id: 'med-insulin-detemir',  name: '인슐린 데테미르', aliases: ['레버미어', 'levemir'], category: '인슐린', criticalCategory: 'insulin', source: '식약처-의약품' },
    { id: 'med-insulin-aspart',   name: '인슐린 아스파트', aliases: ['노보래피드', 'novorapid'], category: '인슐린', criticalCategory: 'insulin', source: '식약처-의약품' },
    { id: 'med-insulin-lispro',   name: '인슐린 리스프로', aliases: ['휴마로그', 'humalog'], category: '인슐린', criticalCategory: 'insulin', source: '식약처-의약품' },
    { id: 'med-metformin',   name: '메트포민', aliases: ['글루코파지', 'glucophage'], category: '경구혈당강하제', source: '식약처-의약품' },
    { id: 'med-glimepiride', name: '글리메피리드', aliases: ['아마릴', 'amaryl'], category: '경구혈당강하제', source: '식약처-의약품' },
    { id: 'med-gliclazide',  name: '글리클라지드', aliases: ['디아미크롱', 'diamicron'], category: '경구혈당강하제', source: '식약처-의약품' },
    { id: 'med-sitagliptin', name: '시타글립틴', aliases: ['자누비아', 'januvia'], category: 'DPP-4 억제제', source: '식약처-의약품' },
    { id: 'med-linagliptin', name: '리나글립틴', aliases: ['트라젠타', 'trajenta'], category: 'DPP-4 억제제', source: '식약처-의약품' },
    { id: 'med-empagliflozin', name: '엠파글리플로진', aliases: ['자디앙', 'jardiance'], category: 'SGLT-2 억제제', source: '식약처-의약품' },
    { id: 'med-dapagliflozin', name: '다파글리플로진', aliases: ['포시가', 'forxiga'], category: 'SGLT-2 억제제', source: '식약처-의약품' },

    // ===== 고혈압·심혈관 =====
    { id: 'med-amlodipine',  name: '암로디핀', aliases: ['노바스크', 'norvasc'], category: '칼슘차단제 (CCB)', source: '식약처-의약품' },
    { id: 'med-nifedipine',  name: '니페디핀', aliases: ['아달라트', 'adalat'], category: '칼슘차단제 (CCB)', source: '식약처-의약품' },
    { id: 'med-losartan',    name: '로사르탄', aliases: ['코자', 'cozaar'], category: 'ARB (안지오텐신 수용체 차단제)', source: '식약처-의약품' },
    { id: 'med-valsartan',   name: '발사르탄', aliases: ['디오반', 'diovan'], category: 'ARB', source: '식약처-의약품' },
    { id: 'med-telmisartan', name: '텔미사르탄', aliases: ['미카르디스', 'micardis'], category: 'ARB', source: '식약처-의약품' },
    { id: 'med-candesartan', name: '칸데사르탄', aliases: ['아타칸', 'atacand'], category: 'ARB', source: '식약처-의약품' },
    { id: 'med-perindopril', name: '페린도프릴', aliases: ['아서틸', 'coversyl'], category: 'ACE 억제제', source: '식약처-의약품' },
    { id: 'med-ramipril',    name: '라미프릴', aliases: ['트리테이스', 'tritace'], category: 'ACE 억제제', source: '식약처-의약품' },
    { id: 'med-bisoprolol',  name: '비소프롤롤', aliases: ['콩코르', 'concor'], category: '베타차단제', source: '식약처-의약품' },
    { id: 'med-carvedilol',  name: '카르베딜롤', aliases: ['딜라트렌', 'dilatrend'], category: '베타차단제', source: '식약처-의약품' },
    { id: 'med-atenolol',    name: '아테놀롤', aliases: ['테놀민', 'tenormin'], category: '베타차단제', source: '식약처-의약품' },
    { id: 'med-furosemide',  name: '푸로세미드', aliases: ['라식스', 'lasix'], category: '이뇨제 (Loop)', source: '식약처-의약품' },
    { id: 'med-htz',         name: '하이드로클로로티아지드', aliases: ['HCTZ', '디크로지드'], category: '이뇨제 (Thiazide)', source: '식약처-의약품' },
    { id: 'med-spironolactone', name: '스피로노락톤', aliases: ['알닥톤', 'aldactone'], category: '이뇨제 (K-sparing)', source: '식약처-의약품' },

    // ===== 지질강하제 (스타틴 등) =====
    { id: 'med-atorvastatin', name: '아토르바스타틴', aliases: ['리피토', 'lipitor'], category: '스타틴', source: '식약처-의약품' },
    { id: 'med-rosuvastatin', name: '로수바스타틴', aliases: ['크레스토', 'crestor'], category: '스타틴', source: '식약처-의약품' },
    { id: 'med-simvastatin',  name: '심바스타틴', aliases: ['조코', 'zocor'], category: '스타틴', source: '식약처-의약품' },
    { id: 'med-pitavastatin', name: '피타바스타틴', aliases: ['리바로', 'livalo'], category: '스타틴', source: '식약처-의약품' },
    { id: 'med-ezetimibe',    name: '에제티미브', aliases: ['이지트롤', 'ezetrol'], category: '콜레스테롤 흡수 억제제', source: '식약처-의약품' },

    // ===== 위장약 =====
    { id: 'med-omeprazole',   name: '오메프라졸', aliases: ['로섹', 'losec'], category: 'PPI (위산억제)', source: '식약처-의약품' },
    { id: 'med-esomeprazole', name: '에소메프라졸', aliases: ['넥시움', 'nexium'], category: 'PPI', source: '식약처-의약품' },
    { id: 'med-pantoprazole', name: '판토프라졸', aliases: ['판토록', 'pantoloc'], category: 'PPI', source: '식약처-의약품' },
    { id: 'med-rabeprazole',  name: '라베프라졸', aliases: ['파리에트', 'pariet'], category: 'PPI', source: '식약처-의약품' },
    { id: 'med-ranitidine',   name: '라니티딘', aliases: ['잔탁', 'zantac'], category: 'H2 차단제', source: '식약처-의약품' },
    { id: 'med-famotidine',   name: '파모티딘', aliases: ['가스터', 'gaster'], category: 'H2 차단제', source: '식약처-의약품' },
    { id: 'med-mosapride',    name: '모사프리드', aliases: ['가스모틴', 'gasmotin'], category: '소화관운동제', source: '식약처-의약품' },
    { id: 'med-domperidone',  name: '돔페리돈', aliases: ['모티리움', 'motilium'], category: '소화관운동제', source: '식약처-의약품' },

    // ===== 진통제·소염제 =====
    { id: 'med-acetaminophen', name: '아세트아미노펜', aliases: ['타이레놀', 'tylenol'], category: '해열진통제', source: '식약처-의약품' },
    { id: 'med-ibuprofen',    name: '이부프로펜', aliases: ['부루펜', 'brufen'], category: 'NSAIDs', source: '식약처-의약품' },
    { id: 'med-naproxen',     name: '나프록센', aliases: ['낙센', 'naprosyn'], category: 'NSAIDs', source: '식약처-의약품' },
    { id: 'med-diclofenac',   name: '디클로페낙', aliases: ['볼타렌', 'voltaren'], category: 'NSAIDs', source: '식약처-의약품' },
    { id: 'med-celecoxib',    name: '세레콕시브', aliases: ['쎄레브렉스', 'celebrex'], category: 'COX-2 억제제', source: '식약처-의약품' },
    { id: 'med-tramadol',     name: '트라마돌', aliases: ['울트라셋', 'ultracet'], category: '진통제', source: '식약처-의약품' },

    // ===== 항생제·항바이러스 =====
    { id: 'med-amoxicillin',     name: '아목시실린', aliases: ['아목실린'], category: '항생제 (페니실린)', source: '식약처-의약품' },
    { id: 'med-augmentin',       name: '아목시실린/클라불라네이트', aliases: ['오구멘틴', 'augmentin'], category: '항생제 (페니실린)', source: '식약처-의약품' },
    { id: 'med-cephalexin',      name: '세파렉신', aliases: ['케플렉스'], category: '항생제 (세팔로스포린)', source: '식약처-의약품' },
    { id: 'med-azithromycin',    name: '아지스로마이신', aliases: ['지스로맥스', 'zithromax'], category: '항생제 (마크로라이드)', source: '식약처-의약품' },
    { id: 'med-levofloxacin',    name: '레보플록사신', aliases: ['크라비트', 'cravit'], category: '항생제 (퀴놀론)', source: '식약처-의약품' },
    { id: 'med-ciprofloxacin',   name: '시프로플록사신', aliases: ['시프로바이', 'cipro'], category: '항생제 (퀴놀론)', source: '식약처-의약품' },

    // ===== 신경·정신 (수면·우울·불안·치매) =====
    { id: 'med-zolpidem',     name: '졸피뎀', aliases: ['스틸녹스', 'stilnox'], category: '수면제', source: '식약처-의약품' },
    { id: 'med-lorazepam',    name: '로라제팜', aliases: ['아티반', 'ativan'], category: '벤조다이아제핀 (불안)', source: '식약처-의약품' },
    { id: 'med-alprazolam',   name: '알프라졸람', aliases: ['자낙스', 'xanax'], category: '벤조다이아제핀', source: '식약처-의약품' },
    { id: 'med-escitalopram', name: '에스시탈로프람', aliases: ['렉사프로', 'lexapro'], category: 'SSRI (항우울제)', source: '식약처-의약품' },
    { id: 'med-sertraline',   name: '서트랄린', aliases: ['졸로프트', 'zoloft'], category: 'SSRI', source: '식약처-의약품' },
    { id: 'med-paroxetine',   name: '파록세틴', aliases: ['세로자트', 'seroxat'], category: 'SSRI', source: '식약처-의약품' },
    { id: 'med-donepezil',    name: '도네페질', aliases: ['아리셉트', 'aricept'], category: '치매 (콜린에스테라제 억제제)', source: '식약처-의약품' },
    { id: 'med-memantine',    name: '메만틴', aliases: ['에빅사', 'ebixa'], category: '치매 (NMDA 길항제)', source: '식약처-의약품' },
    { id: 'med-rivastigmine', name: '리바스티그민', aliases: ['엑셀론', 'exelon'], category: '치매', source: '식약처-의약품' },

    // ===== 갑상선·호르몬 =====
    { id: 'med-levothyroxine', name: '레보티록신', aliases: ['신지로이드', 'synthroid'], category: '갑상선 호르몬', source: '식약처-의약품' },
    { id: 'med-methimazole',   name: '메티마졸', aliases: ['메르카졸'], category: '항갑상선제', source: '식약처-의약품' },

    // ===== 부신피질호르몬 (스테로이드) — 응급 분류 =====
    { id: 'med-prednisolone', name: '프레드니솔론', aliases: ['프레드니솔'], category: '코르티코스테로이드', criticalCategory: 'steroid', source: '식약처-의약품' },
    { id: 'med-methylpred',   name: '메틸프레드니솔론', aliases: ['메드롤', 'medrol'], category: '코르티코스테로이드', criticalCategory: 'steroid', source: '식약처-의약품' },
    { id: 'med-dexamethasone', name: '덱사메타손', aliases: ['덱사', 'dexa'], category: '코르티코스테로이드', criticalCategory: 'steroid', source: '식약처-의약품' },

    // ===== 호흡기 =====
    { id: 'med-salbutamol',  name: '살부타몰', aliases: ['벤토린', 'ventolin'], category: '기관지 확장제', source: '식약처-의약품' },
    { id: 'med-tiotropium',  name: '티오트로피움', aliases: ['스피리바', 'spiriva'], category: 'COPD (장기 흡입)', source: '식약처-의약품' },
    { id: 'med-budesonide',  name: '부데소나이드', aliases: ['풀미코트', 'pulmicort'], category: '흡입 스테로이드', source: '식약처-의약품' },
    { id: 'med-montelukast', name: '몬테루카스트', aliases: ['싱귤레어', 'singulair'], category: '천식·알레르기', source: '식약처-의약품' },

    // ===== 골다공증 =====
    { id: 'med-alendronate',  name: '알렌드로네이트', aliases: ['포사맥스', 'fosamax'], category: '비스포스포네이트', source: '식약처-의약품' },
    { id: 'med-risedronate',  name: '리세드로네이트', aliases: ['악토넬', 'actonel'], category: '비스포스포네이트', source: '식약처-의약품' },
    { id: 'med-denosumab',    name: '데노수맙', aliases: ['프롤리아', 'prolia'], category: '골흡수 억제 항체', source: '식약처-의약품' },
    { id: 'med-calcium-vitd', name: '칼슘 + 비타민D', aliases: ['칼슘제', '본키친'], category: '영양보충', source: '식약처-의약품' },

    // ===== 비뇨 (전립선·요실금) =====
    { id: 'med-tamsulosin',   name: '탐스로신', aliases: ['하루날디', 'harnal'], category: '알파차단제 (BPH)', source: '식약처-의약품' },
    { id: 'med-finasteride',  name: '피나스테리드', aliases: ['프로스카', 'proscar'], category: '5알파환원효소억제제', source: '식약처-의약품' },
    { id: 'med-solifenacin',  name: '솔리페나신', aliases: ['베시케어', 'vesicare'], category: '항콜린 (과민성 방광)', source: '식약처-의약품' },
  ];

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
