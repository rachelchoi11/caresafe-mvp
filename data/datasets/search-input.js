// data/datasets/search-input.js — CareSafe v0.2
//
// 검색+직접입력 입력 컴포넌트 — 알레르기·약물·진단·병원·이식기기·보조기기 공통 패턴.
// 사용법: CareSafeSearchInput.attach(inputEl, options)
//   options.search(query) -> [{ id, name, category?, source?, ... }]
//   options.onSelect(item, isCustom) -> void  // isCustom=true 는 직접 입력
//   options.placeholder, options.customTag
//
// 동작:
//   - 입력 시 자동완성 드롭다운 (위→아래)
//   - 키보드 ↑↓ Enter 지원
//   - '직접 입력' 옵션 항상 마지막에 표시
//   - 선택 시 onSelect 콜백 + dataset 정보를 input.dataset에 기록 (id·source 등)
//   - 직접 입력 선택 시 isCustom=true

window.CareSafeSearchInput = (function () {
  let _activeDropdown = null;

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function _close() {
    if (_activeDropdown) {
      _activeDropdown.remove();
      _activeDropdown = null;
    }
  }

  document.addEventListener('click', (ev) => {
    if (_activeDropdown && !ev.target.closest('.cs-search-dropdown') && !ev.target.classList.contains('cs-search-input')) {
      _close();
    }
  });

  function attach(input, options = {}) {
    if (!input || input.dataset.csSearchAttached === '1') return;
    input.dataset.csSearchAttached = '1';
    input.classList.add('cs-search-input');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');

    const search = options.search || (() => []);
    const onSelect = options.onSelect || (() => {});
    const customTag = options.customTag || '직접 입력';

    let highlighted = -1;
    let currentItems = [];

    function _render() {
      _close();
      const query = input.value.trim();
      if (query.length === 0) return;
      currentItems = search(query) || [];

      const rect = input.getBoundingClientRect();
      const dd = document.createElement('div');
      dd.className = 'cs-search-dropdown';
      dd.style.cssText = `
        position:absolute; top:${rect.bottom + window.scrollY + 2}px;
        left:${rect.left + window.scrollX}px; width:${rect.width}px;
        background:white; border:1px solid #E2E8F0; border-radius:8px;
        max-height:240px; overflow-y:auto; z-index:9500;
        box-shadow:0 8px 24px rgba(15,23,42,0.12);
        font-size:13px;
      `;

      let html = '';
      currentItems.forEach((it, i) => {
        const sourceLabel = it.source ? `<span style="color:#94A3B8;font-size:11px;margin-left:6px">${_esc(it.source)}</span>` : '';
        const catLabel = it.category ? `<span style="background:#F1F5F9;color:#475569;padding:1px 6px;border-radius:4px;font-size:10px;margin-right:6px">${_esc(it.category)}</span>` : '';
        html += `
          <div class="cs-search-item ${i === highlighted ? 'highlighted' : ''}" data-idx="${i}"
               style="padding:10px 12px; cursor:pointer; border-bottom:1px solid #F1F5F9;
                      ${i === highlighted ? 'background:#F0FDFA;' : ''}">
            <div>${catLabel}<strong>${_esc(it.name)}</strong>${sourceLabel}</div>
            ${(it.aliases && it.aliases.length) ? `<div style="color:#94A3B8;font-size:11px;margin-top:2px">↳ ${_esc(it.aliases.join(' · '))}</div>` : ''}
          </div>`;
      });
      // 직접 입력 옵션 (항상 마지막)
      const customIdx = currentItems.length;
      html += `
        <div class="cs-search-item cs-search-custom ${customIdx === highlighted ? 'highlighted' : ''}" data-idx="${customIdx}"
             style="padding:10px 12px; cursor:pointer; background:${customIdx === highlighted ? '#FEF3C7' : '#FFFBEB'};
                    color:#92400E; font-weight:600;">
          ✏️ "${_esc(query)}" — ${_esc(customTag)} (검토 후 데이터셋 등록)
        </div>`;

      dd.innerHTML = html;
      document.body.appendChild(dd);
      _activeDropdown = dd;

      dd.querySelectorAll('.cs-search-item').forEach(el => {
        el.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const idx = parseInt(el.dataset.idx, 10);
          _select(idx);
        });
      });
    }

    function _select(idx) {
      if (idx < currentItems.length) {
        const item = currentItems[idx];
        input.value = item.name;
        input.dataset.csId = item.id;
        input.dataset.csCategory = item.category || '';
        input.dataset.csSource = item.source || '';
        input.dataset.csCustom = '0';
        onSelect(item, false);
      } else {
        // 직접 입력
        const customName = input.value.trim();
        input.dataset.csId = '';
        input.dataset.csCategory = 'custom';
        input.dataset.csSource = 'user-entry';
        input.dataset.csCustom = '1';
        onSelect({ name: customName }, true);
      }
      _close();
      highlighted = -1;
    }

    input.addEventListener('input', () => {
      highlighted = -1;
      input.dataset.csCustom = '';
      input.dataset.csId = '';
      _render();
    });
    input.addEventListener('focus', () => {
      if (input.value.trim()) _render();
    });
    input.addEventListener('keydown', (ev) => {
      if (!_activeDropdown) return;
      const total = currentItems.length + 1; // +1 for 직접 입력
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        highlighted = (highlighted + 1) % total;
        _render();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        highlighted = (highlighted - 1 + total) % total;
        _render();
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (highlighted >= 0) _select(highlighted);
      } else if (ev.key === 'Escape') {
        _close();
      }
    });
  }

  return { attach, _close };
})();
