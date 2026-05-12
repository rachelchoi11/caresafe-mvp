// data/meds-runtime.js — CareSafe v0.2
//
// 복약 스케줄 + 체크 로그 + 누락 감지 공유 헬퍼.
// 시뮬레이터(시니어가 '먹었어요' 체크) + 보호자(현황·누락 알림) 양쪽에서 사용.
//
// Codex P1 #3 수정: localStorage + Firebase 듀얼 sync.
// - markTaken: localStorage 즉시 쓰기 + (firebase 모드) writePath 동시
// - 페이지 로드 시 Firebase /med_logs/{uid} subscribe → localStorage 머지
// - 다기기 sync 가능 (시니어 시뮬 ↔ 보호자 guardian)
// 경로: /med_logs/{uid}/{YYYYMMDD}/{slotKey}: taken_ts

window.CareSafeMeds = (function () {
  const STORAGE_KEY = 'caresafe:medlog:v1';
  const MISSED_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2시간

  function ymd(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  function _load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }
  function _save(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

  // 요일 매칭
  function _dayMatch(daysSpec, date) {
    if (!daysSpec || daysSpec === 'every') return true;
    const dow = date.getDay(); // 0=Sun
    const map = { sun:0, mon:1, tue:2, wed:3, thu:4, fri:5, sat:6 };
    if (daysSpec === 'weekdays') return dow >= 1 && dow <= 5;
    if (daysSpec === 'weekend') return dow === 0 || dow === 6;
    return daysSpec.split(/[,;\s]+/).some(d => map[d.trim().toLowerCase()] === dow);
  }

  // 시니어의 오늘 복약 슬롯 [{medId, medName, time, scheduledAt, taken_at}]
  function todaySlots(senior, date = new Date()) {
    if (!senior || !senior.meds) return [];
    const dayKey = ymd(date);
    const log = _load();
    const slots = [];
    for (const m of senior.meds) {
      if (!m.schedule || !m.schedule.times) continue;
      if (!_dayMatch(m.schedule.days, date)) continue;
      // 기간 체크
      if (m.schedule.startDate && dayKey < m.schedule.startDate.replace(/-/g, '')) continue;
      if (m.schedule.endDate && dayKey > m.schedule.endDate.replace(/-/g, '')) continue;
      for (const t of m.schedule.times) {
        const [hh, mm] = t.split(':').map(Number);
        const scheduledDate = new Date(date);
        scheduledDate.setHours(hh, mm, 0, 0);
        const slotKey = `${m.id}_${t.replace(':','')}`;
        const fullKey = `${senior.id}:${dayKey}:${slotKey}`;
        slots.push({
          medId: m.id,
          medName: m.name,
          medDose: m.dose,
          medFor: m.for,
          time: t,
          scheduledAt: scheduledDate.getTime(),
          slotKey,
          fullKey,
          taken_at: log[fullKey] || null,
        });
      }
    }
    return slots.sort((a, b) => a.scheduledAt - b.scheduledAt);
  }

  function markTaken(senior, slot) {
    const log = _load();
    const ts = Date.now();
    log[slot.fullKey] = ts;
    _save(log);
    // Firebase 동기화 (firebase 모드에서만)
    try {
      const isFb = new URLSearchParams(location.search).get("mode") === "firebase";
      if (isFb && window.CareSafeFB) {
        const path = `/med_logs/${senior.id}/${ymd()}/${slot.slotKey}`;
        window.CareSafeFB.writePath(path, ts).catch(e =>
          console.warn("[Meds] Firebase sync 실패:", e));
      }
    } catch (e) { /* ignore */ }
    return ts;
  }

  // 페이지 로드 시 Firebase /med_logs/{uid} 구독 → localStorage 머지.
  // 시뮬레이터(시니어)·guardian(보호자) 양쪽 페이지에서 호출.
  function subscribeFirebaseSync(seniorId) {
    const isFb = new URLSearchParams(location.search).get("mode") === "firebase";
    if (!isFb || !window.CareSafeFB || !seniorId) return null;
    const today = ymd();
    const path = `/med_logs/${seniorId}/${today}`;
    return window.CareSafeFB.watchPath(path, (data) => {
      if (!data) return;
      const log = _load();
      let changed = false;
      for (const [slotKey, ts] of Object.entries(data)) {
        const fullKey = `${seniorId}:${today}:${slotKey}`;
        if (log[fullKey] !== ts) { log[fullKey] = ts; changed = true; }
      }
      if (changed) {
        _save(log);
        window.dispatchEvent(new CustomEvent("caresafe-medlog-sync", { detail: { seniorId } }));
      }
    });
  }

  // 알림 발사 시점에 가까운 슬롯 (지금~10분 전 사이)
  function pendingSlots(senior, now = Date.now()) {
    const slots = todaySlots(senior, new Date(now));
    return slots.filter(s => {
      const diff = now - s.scheduledAt;
      // 시간 도달했고 아직 안 먹은 것 (10분 윈도 = 알림 후 10분간 활성)
      return diff >= 0 && diff < 10 * 60 * 1000 && !s.taken_at;
    });
  }

  // 2시간+ 미체크된 슬롯 (보호자에게 누락 알림용)
  function missedSlots(senior, now = Date.now()) {
    const slots = todaySlots(senior, new Date(now));
    return slots.filter(s => {
      const diff = now - s.scheduledAt;
      return diff >= MISSED_THRESHOLD_MS && !s.taken_at;
    });
  }

  return {
    ymd,
    todaySlots,
    pendingSlots,
    missedSlots,
    markTaken,
    subscribeFirebaseSync,
    MISSED_THRESHOLD_MS,
  };
})();
