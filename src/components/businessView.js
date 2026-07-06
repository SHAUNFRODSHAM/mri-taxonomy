/* ═══════════════════════════════════════════════════════════════════════════
   businessView.js — Business-process view renderer (the "what/why" perspective)

   Self-contained: reuses the shared #grid / #panel / #main-header containers but
   reads from BUSINESS_DATA and renders the business dimensions (market, vertical,
   standards). The system (MRI PMX) view is untouched. Read-only in this phase.

   Linkage to the system view (cross-references + jump-through) is layered on in
   Phase 2 via setLinkRenderer().
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';
import {
  BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES, MARKETS, VERTICALS, findBusinessItem,
} from '../data/business/index.js';

// Per-vertical colour coding (used by the filter swatch and the detail panel)
const VERTICAL_COLOURS = {
  All: 'var(--green)', Retail: '#c0440e', Industrial: '#1a5fa8',
  Office: '#5b4acb', Residential: '#1a8a4a',
};

const SECTORS = VERTICALS.filter(v => v !== 'All'); // Retail/Industrial/Office/Residential

/** Ensure the active business tab is valid (value-stream ids). */
function ensureBusinessTab() {
  if (!BUSINESS_DATA[state.businessTab]) state.businessTab = BUSINESS_MODULES[0];
}

/** Does an item match the selected verticals? Vertical-agnostic items always show. */
function matchesVerticals(item) {
  if (!item.vertical) return true;                    // no sector data → always relevant
  const sel = state.verticals;
  if (!sel || !sel.length) return true;               // nothing selected → don't hide
  if (sel.length === SECTORS.length) return true;      // all selected → show all
  return sel.some(v => item.vertical[v]);
}

// Phase-2 hook: main.js injects a function that returns link-section HTML for an
// item id (and wires click handlers). Null = no link UI yet.
let linkRenderer = null;
export function setBusinessLinkRenderer(fn) { linkRenderer = fn; }

let onSwitchBusinessTab = () => {};
let onEditItem = () => {};
let onRemoveItem = () => {};
let onAddItem = () => {};
export function initBusinessView({ onTabSwitch, onEdit, onRemove, onAdd }) {
  onSwitchBusinessTab = onTabSwitch || (() => {});
  onEditItem   = onEdit   || (() => {});
  onRemoveItem = onRemove || (() => {});
  onAddItem    = onAdd    || (() => {});
}

/** Render the value-stream tab bar (one tab per value stream, with its tag). */
function renderBusinessTabs() {
  ensureBusinessTab();
  const tabBar = document.getElementById('business-tabbar');
  tabBar.innerHTML = '';
  BUSINESS_MODULES.forEach(mod => {
    const cfg = BUSINESS_CONFIG[mod];
    const btn = document.createElement('button');
    btn.className = 'biz-tab-btn' + (mod === state.businessTab ? ' active' : '')
      + (cfg.supporting ? ' biz-tab-conditional' : '');
    btn.dataset.btab = mod;
    btn.title = cfg.note || '';
    btn.innerHTML = `<span class="tab-icon">${cfg.icon}</span>${cfg.label}`;
    btn.addEventListener('click', () => onSwitchBusinessTab(mod));
    tabBar.appendChild(btn);
  });
}

/**
 * A compact multi-select dropdown: a summary button that opens a checkbox
 * popover. Toggling updates `state[stateKey]` and refreshes the view without
 * rebuilding the filter bar (so the popover stays open). `swatch` optionally
 * colours a chip per option.
 */
function makeMultiSelect(label, options, stateKey, opts = {}) {
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
      refreshBusinessAfterFilter();
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

/** Render the Market / Vertical / Entity multi-select filter bar. */
function renderBusinessFilters() {
  const bar = document.getElementById('business-filterbar');
  bar.innerHTML = '';

  bar.appendChild(makeMultiSelect('Market',
    MARKETS.map(m => ({ value: m.key, label: m.label, short: m.key })),
    'markets'));

  bar.appendChild(makeMultiSelect('Vertical',
    SECTORS.map(v => ({ value: v, label: v, short: v })),
    'verticals',
    { swatch: v => VERTICAL_COLOURS[v] || 'var(--border2)' }));
}

/** Refresh tabs + grid + any open panel after a filter change (popover stays). */
function refreshBusinessAfterFilter() {
  renderBusinessTabs();
  renderBusinessGrid();
  if (state.openPanelId) showBusinessPanel(state.openPanelId);
}

// Close any open filter popover on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.biz-ms')) {
    document.querySelectorAll('.biz-ms-menu.open').forEach(m => m.classList.remove('open'));
  }
});

/** Render the full business view (tabs + filters + grid). */
export function renderBusiness() {
  renderBusinessTabs();
  renderBusinessFilters();
  renderBusinessGrid();
}

/** Render the taxonomy grid + banner for the active business module. */
function renderBusinessGrid() {
  const cfg  = BUSINESS_CONFIG[state.businessTab] || {};
  const data = BUSINESS_DATA[state.businessTab] || [];

  // Banner — colour comes from the module config (covers the expanded areas too)
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header) {
    header.className = 'main-header';
    header.style.background = cfg.color || '#2d4a0a';
  }
  if (headerText) headerText.textContent = cfg.label;

  const grid = document.getElementById('grid');
  grid.className = 'grid' + (state.editMode ? ' edit-active' : '');
  grid.innerHTML = '';

  const edit = state.editMode;

  data.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'col';

    const colHeader = document.createElement('div');
    colHeader.className = 'col-header biz-col-header';
    if (col.note) colHeader.title = col.note;   // L2 hover tooltip
    colHeader.innerHTML = `<span class="col-header-title">${col.title}</span>`;
    if (edit) {
      const del = document.createElement('span');
      del.className = 'col-del-btn';
      del.textContent = '×';
      del.title = 'Remove domain';
      del.addEventListener('click', e => { e.stopPropagation(); onRemoveItem('col', col.id); });
      colHeader.appendChild(del);
    }
    colEl.appendChild(colHeader);

    const colBody = document.createElement('div');
    colBody.className = 'col-body';
    let visible = 0;

    col.processes.forEach(proc => {
      // A process shows if it (or any of its subs) matches the vertical selection.
      const procMatches = matchesVerticals(proc);
      const matchingSubs = (proc.subs || []).filter(matchesVerticals);
      // In edit mode show everything (so empty processes can be edited/filled).
      if (!edit && !procMatches && matchingSubs.length === 0) return;

      colBody.appendChild(makeBizCard(proc, 'process-box biz-card', true, col.id));
      visible++;

      (proc.subs || []).forEach(sub => {
        if (!edit && !matchesVerticals(sub)) return;
        colBody.appendChild(makeBizCard(sub, 'sub-box biz-card', false, col.id, proc.id));
        visible++;
      });

      if (edit) {
        const addSub = document.createElement('button');
        addSub.className = 'add-row-btn';
        addSub.textContent = '+ Add Sub-Process';
        addSub.addEventListener('click', () => onAddItem('sub', col.id, proc.id));
        colBody.appendChild(addSub);
      }
    });

    if (visible === 0 && !edit) {
      const msg = document.createElement('div');
      msg.className = 'empty-filter-msg';
      msg.textContent = 'No items for this vertical';
      colBody.appendChild(msg);
    }

    if (edit) {
      const addProc = document.createElement('button');
      addProc.className = 'add-row-btn';
      addProc.textContent = '+ Add Process';
      addProc.addEventListener('click', () => onAddItem('process', col.id));
      colBody.appendChild(addProc);
    }

    colEl.appendChild(colBody);
    grid.appendChild(colEl);
  });

  if (edit) {
    const addColEl = document.createElement('div');
    addColEl.className = 'col col-add-domain';
    const btn = document.createElement('button');
    btn.className = 'add-row-btn add-domain-btn';
    btn.textContent = '+ Add Domain';
    btn.addEventListener('click', () => onAddItem('col'));
    addColEl.appendChild(btn);
    grid.appendChild(addColEl);
  }

  // Equalise column header heights (same as system grid)
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const headers = grid.querySelectorAll('.col-header');
    headers.forEach(h => { h.style.height = ''; });
    let maxH = 0;
    headers.forEach(h => { maxH = Math.max(maxH, h.offsetHeight); });
    if (maxH > 0) headers.forEach(h => { h.style.height = maxH + 'px'; });
  }));
}

function makeBizCard(item, baseClass, isProcess, colId, procId) {
  const el = document.createElement('div');
  el.className = baseClass;
  el.dataset.id = item.id;

  const title = document.createElement('span');
  title.className = 'card-title';
  title.textContent = item.title;
  el.appendChild(title);

  // Standards chips give an at-a-glance signal of the regulatory weight
  if (item.standards && item.standards.length) {
    const chip = document.createElement('span');
    chip.className = 'biz-std-count';
    chip.textContent = item.standards.length + ' std';
    chip.title = item.standards.join(' · ');
    el.appendChild(chip);
  }
  // Flag cards seeded from the reference guide that still need enrichment
  if (item.needsEnrichment) {
    const flag = document.createElement('span');
    flag.className = 'biz-enrich-flag';
    flag.textContent = 'enrich';
    flag.title = 'Seeded from the reference guide — Market / Vertical / Standards detail to be added';
    el.appendChild(flag);
  }

  if (state.editMode) {
    const del = document.createElement('span');
    del.className = 'del-btn';
    del.textContent = '×';
    del.addEventListener('click', e => {
      e.stopPropagation();
      onRemoveItem(isProcess ? 'process' : 'sub', colId, isProcess ? item.id : procId, isProcess ? null : item.id);
    });
    el.appendChild(del);
    el.addEventListener('click', () => onEditItem(item.id));
  } else {
    el.addEventListener('click', () => showBusinessPanel(item.id));
  }
  return el;
}

// ── Detail panel ────────────────────────────────────────────────────────────

export function showBusinessPanel(id) {
  const found = findBusinessItem(id);
  if (!found) return;
  const { item, breadcrumb, isProcess } = found;
  state.openPanelId = id;

  document.getElementById('panel-bc').textContent = breadcrumb;
  document.getElementById('panel-title').textContent = item.title;
  document.getElementById('panel-badges').innerHTML =
    `<span class="badge ${isProcess ? 'badge-process' : 'badge-sub'}">${isProcess ? 'Process' : 'Sub-Process'}</span>
     <span class="badge badge-business">Business</span>`
     + (item.needsEnrichment ? '<span class="badge badge-enrich">Needs enrichment</span>' : '');

  let html = `
    <div class="psec">
      <div class="psec-label">Overview</div>
      <p class="psec-text">${item.desc || ''}</p>
    </div>`;

  if (item.activities && item.activities.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Core Activities</div>
      <ul class="act-list">${item.activities.map(a => `<li>${a}</li>`).join('')}</ul>
    </div>`;
  }

  // Market Variation — one block per selected market that has content
  if (item.market) {
    (state.markets || []).forEach(k => {
      if (!item.market[k]) return;
      const label = (MARKETS.find(m => m.key === k) || {}).label || k;
      html += `
    <div class="psec">
      <div class="psec-label">Market Variation — ${label}</div>
      <div class="biz-market-block">${item.market[k]}</div>
    </div>`;
    });
  }

  // Vertical Detail — one colour-tagged row per selected sector that has content
  if (item.vertical) {
    const sel = (state.verticals && state.verticals.length) ? state.verticals : SECTORS;
    const rows = sel.filter(v => item.vertical[v]).map(v =>
      `<div class="biz-vert-row"><span class="biz-vert-tag vert-${v.toLowerCase()}">${v}</span><span>${item.vertical[v]}</span></div>`).join('');
    if (rows) {
      html += `
    <div class="psec">
      <div class="psec-label">Vertical Detail</div>
      ${rows}
    </div>`;
    }
  }

  if (item.standards && item.standards.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Standards &amp; Frameworks</div>
      <div class="biz-std-grid">${item.standards.map(s => `<span class="biz-std-chip">${s}</span>`).join('')}</div>
    </div>`;
  }

  // Value-stream context (name + note)
  const vsCfg = BUSINESS_CONFIG[found.module] || {};
  if (vsCfg.note || vsCfg.label) {
    html += `<div class="psec">
      <div class="psec-label">Value Stream</div>
      <div class="biz-stream-class">
        <span class="biz-stream-mark">${vsCfg.icon || ''}</span>
        <div>
          <div class="biz-stream-name">${vsCfg.label}${vsCfg.supporting ? ' <span class="biz-stream-supporting">supporting</span>' : ''}</div>
          ${vsCfg.note ? `<div class="biz-stream-note">${vsCfg.note}</div>` : ''}
        </div>
      </div>
    </div>`;
  }

  if (item.needsEnrichment) {
    html += `<div class="psec"><div class="biz-enrich-note">⚠ Powered L3 process — Market, Vertical and Standards detail to be added during discovery. Use Edit Mode to enrich, and the System view linkage to map it to MRI PMX.</div></div>`;
  }

  // Phase-2 linkage section (system cross-references)
  if (linkRenderer) {
    const linkHtml = linkRenderer(id, 'business');
    if (linkHtml) html += linkHtml;
  }

  document.getElementById('panel-body').innerHTML = html;
  document.getElementById('overlay').classList.add('open');
  document.getElementById('panel').classList.add('open');
}
