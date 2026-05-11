// data/checklist.js — CareSafe v0.2 생활안전 체크리스트
//
// 보호자가 부모님 집 환경을 주기적으로 점검하도록 돕는 항목.
// 사업계획서 ‘생활안전 체크리스트’ 항목의 실제 구현.
//
// 체크 상태는 localStorage에 주(week) 단위로 저장.
// (Firebase 동기화는 v0.3로 미룸 — 보호자 본인만 보는 정보라 우선순위 낮음)

window.CareSafeChecklist = {
  storageKey: "caresafe:checklist:v1",
  sections: [
    {
      title: "낙상 예방",
      items: [
        { key: "bath_mat", text: "욕실 미끄럼방지 매트 점검", tip: "물기·곰팡이로 마모 빠름" },
        { key: "night_light", text: "야간 동선 조명 점등 확인", tip: "화장실·복도 자동 센서등 권장" },
        { key: "bed_alarm", text: "침대 옆 비상 호출 버튼 위치 확인", tip: "손 닿는 거리, 막힌 곳 없게" },
        { key: "loose_rug", text: "거실·복도 깔개 미끄럼 점검", tip: "양면테이프 또는 제거" },
      ],
    },
    {
      title: "복약 관리",
      items: [
        { key: "med_organizer", text: "1주일 약통 정리 (요일·시간별)", tip: "보호자 직접 분류 권장" },
        { key: "med_alarm", text: "복용 알람 시각 점검", tip: "주치의 처방 변경 시 갱신" },
      ],
    },
    {
      title: "응급 대응",
      items: [
        { key: "qr_print", text: "응급카드 인쇄본 냉장고·현관 부착", tip: "응급실·119가 즉시 확인" },
        { key: "contact_share", text: "응급 연락처 가족 전체 공유", tip: "1·2순위 + 주치의" },
      ],
    },
    {
      title: "일상",
      items: [
        { key: "outing_check", text: "외출 시 위치·귀가 시간 공유", tip: "혼자 외출 30분 이상 시 알림 권장" },
        { key: "weekly_call", text: "주 2회 이상 영상통화", tip: "표정·말투로 컨디션 파악" },
      ],
    },
  ],
};
