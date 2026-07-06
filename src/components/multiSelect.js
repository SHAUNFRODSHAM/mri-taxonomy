/* ═══════════════════════════════════════════════════════════════════════════
   multiSelect.js — shared compact multi-select dropdown

   A summary button that opens a checkbox popover. Toggling updates the array at
   state[stateKey] and calls opts.onChange() — the caller decides what to
   re-render (the popover stays open because the component isn't rebuilt on
   toggle). Used by both the Value Streams filters (Market / Vertical) and the
   System-view Scope filter so the UX is identical.

   makeMultiSelect(label, options, stateKey, { swatch, onChange })
     options: [{ value, label, short? }]
     swatch:  optional value → CSS colour (chip shown when exactly one selected)
     onChange: called after each toggle
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';

export function makeMultiSelect(label, options, stateKey, opts = {}) {
  const { swatch, onChange } = opts;
  const wrap = document.createElement('div');
  wrap.className = 'biz-filter-group biz-ms';

  const lab = document.createElement('span');
  lab.className = 'biz-filter-label';
  lab.textContent = label + ':';
  wrap.appendChild(lab);

  const btn = document.createElement('button');
  btn.className = 'biz-ms-btn';
  wrap.appendChild(btn);

  const menu = document.createElement('div');
  menu.className = 'biz-ms-menu';
  wrap.appendChild(menu);

  const selected = () => state[stateKey];
  const summarise = () => {
    const sel = selected();
    if (!sel.length) return 'None';
    if (sel.length === options.length) return `All (${options.length})`;
    if (sel.length <= 2) return sel.map(v => (options.find(o => o.value === v) || {}).short || v).join(', ');
    return `${sel.length} selected`;
  };
  const paintBtn = () => {
    const sel = selected();
    let chip = '';
    if (swatch && sel.length === 1) chip = `<span class="biz-filter-swatch" style="background:${swatch(sel[0])}"></span>`;
    btn.innerHTML = `${chip}<span class="biz-ms-summary">${summarise()}</span><span class="biz-ms-caret">▾</span>`;
  };
  paintBtn();

  options.forEach(o => {
    const row = document.createElement('label');
    row.className = 'biz-ms-row';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = selected().includes(o.value);
    cb.addEventListener('change', () => {
      const sel = selected();
      if (cb.checked) { if (!sel.includes(o.value)) sel.push(o.value); }
      else { const i = sel.indexOf(o.value); if (i !== -1) sel.splice(i, 1); }
      paintBtn();
      if (onChange) onChange();
    });
    row.appendChild(cb);
    if (swatch) {
      const sw = document.createElement('span');
      sw.className = 'biz-ms-swatch'; sw.style.background = swatch(o.value);
      row.appendChild(sw);
    }
    const txt = document.createElement('span');
    txt.textContent = o.label;
    row.appendChild(txt);
    menu.appendChild(row);
  });

  btn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.biz-ms-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
    menu.classList.toggle('open');
  });

  return wrap;
}

// Close any open multi-select popover on outside click (registered once).
document.addEventListener('click', e => {
  if (!e.target.closest('.biz-ms')) {
    document.querySelectorAll('.biz-ms-menu.open').forEach(m => m.classList.remove('open'));
  }
});
