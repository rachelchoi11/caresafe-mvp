// data/checklist.js — CareSafe v0.2 생활안전 체크리스트
//
// 보호자가 부모님 집 환경을 주기적으로 점검하도록 돕는 항목.
// 사업계획서 ‘생활안전 체크리스트’ 항목의 실제 구현.
//
// v0.2 Phase 2 #5 (2026-05-11):
//   10개 → 6개로 축소. 노인 보호자 compliance 가설:
//   "체크 항목이 적을수록 매주 완수 비율 ↑". 4개는 제거(낙상 예방 보강 2개,
//   복약 알람·외출 체크).
//
// 선정 기준: 가장 큰 사고 빈도(낙상·복약·응급) × 가장 큰 행동 변화 효과.
// 체크 상태는 localStorage에 주(week) 단위로 저장.

window.CareSafeChecklist = {
  storageKey: "caresafe:checklist:v1",
  sections: [
    {
      title: "낙상 예방",
      items: [
        { key: "bath_mat", text: "욕실 미끄럼방지 매트 점검", tip: "물기·곰팡이로 마모 빠름 — 분기 1회 교체" },
        { key: "night_light", text: "야간 동선 조명 점등 확인", tip: "화장실·복도 자동 센서등 권장" },
      ],
    },
    {
      title: "복약 관리",
      items: [
        { key: "med_organizer", text: "1주일 약통 정리 (요일·시간별)", tip: "보호자 직접 분류 권장 — 인지 저하 시 필수" },
      ],
    },
    {
      title: "응급 대응",
      items: [
        { key: "qr_print", text: "응급카드 인쇄본 냉장고·현관 부착", tip: "응급실·119가 즉시 확인할 수 있는 위치" },
        { key: "contact_share", text: "응급 연락처 가족 전체 공유", tip: "1·2순위 + 주치의 — 모든 가족이 알아야" },
      ],
    },
    {
      title: "정서·소통",
      items: [
        { key: "weekly_call", text: "주 2회 이상 영상통화", tip: "표정·말투로 컨디션 파악 — 인지·정서 조기 감지" },
      ],
    },
  ],
};
