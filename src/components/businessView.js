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

/** Does a sub-process have content for the active vertical filter? */
function matchesVertical(item, vertical) {
  if (vertical === 'All') return true;
  // Show the item if it carries vertical-specific guidance for the selected sector.
  return !!(item.vertical && item.vertical[vertical]);
}

/** Render the business tab bar (modules), market bar, and vertical bar. */
export function renderBusinessChrome() {
  // ── Module tabs ──
  const tabBar = document.getElementById('business-tabbar');
  tabBar.innerHTML = '';
  BUSINESS_MODULES.forEach(mod => {
    const cfg = BUSINESS_CONFIG[mod];
    const btn = document.createElement('button');
    btn.className = 'biz-tab-btn' + (mod === state.businessTab ? ' active' : '');
    btn.dataset.btab = mod;
    btn.innerHTML = `<span class="tab-icon">${cfg.icon}</span>${cfg.label}`;
    btn.addEventListener('click', () => onSwitchBusinessTab(mod));
    tabBar.appendChild(btn);
  });

  // ── Market + vertical filter bar ──
  const bar = document.getElementById('business-filterbar');
  bar.innerHTML = '';

  const marketWrap = document.createElement('div');
  marketWrap.className = 'biz-market-wrap';
  marketWrap.innerHTML = '<span class="biz-filter-label">Market:</span>';
  MARKETS.forEach(m => {
    const b = document.createElement('button');
    b.className = 'biz-market-btn' + (m.key === state.market ? ' active' : '');
    b.dataset.market = m.key;
    b.textContent = m.label;
    b.addEventListener('click', () => { state.market = m.key; renderBusiness(); });
    marketWrap.appendChild(b);
  });
  bar.appendChild(marketWrap);

  const vertWrap = document.createElement('div');
  vertWrap.className = 'biz-vert-wrap';
  vertWrap.innerHTML = '<span class="biz-filter-label">Vertical:</span>';
  VERTICALS.forEach(v => {
    const b = document.createElement('button');
    b.className = 'biz-vert-btn vert-' + v.toLowerCase() + (v === state.vertical ? ' active' : '');
    b.dataset.vert = v;
    b.innerHTML = `<span class="vert-dot"></span>${v === 'All' ? 'All Verticals' : v}`;
    b.addEventListener('click', () => { state.vertical = v; renderBusiness(); });
    vertWrap.appendChild(b);
  });
  bar.appendChild(vertWrap);
}

/** Render the business taxonomy grid for the active business module. */
export function renderBusiness() {
  renderBusinessChrome();

  const cfg  = BUSINESS_CONFIG[state.businessTab] || {};
  const data = BUSINESS_DATA[state.businessTab] || [];

  // Banner — colour comes from the module config (covers the expanded areas too)
  const header     = document.getElementById('main-header');
  const headerText = document.getElementById('main-header-text');
  if (header) {
    header.className = 'main-header';
    header.style.background = cfg.color || '#2d4a0a';
  }
  if (headerText) headerText.textContent = `${cfg.label} · Business Process View`;

  const grid = document.getElementById('grid');
  grid.className = 'grid' + (state.editMode ? ' edit-active' : '');
  grid.innerHTML = '';

  const vertical = state.vertical;
  const edit = state.editMode;

  data.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'col';

    const colHeader = document.createElement('div');
    colHeader.className = 'col-header biz-col-header';
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
      // A process shows if any of its subs match the vertical filter.
      const matchingSubs = (proc.subs || []).filter(s => matchesVertical(s, vertical));
      // In edit mode show everything (so empty processes can be edited/filled).
      if (!edit && vertical !== 'All' && matchingSubs.length === 0) return;

      colBody.appendChild(makeBizCard(proc, 'process-box biz-card', true, col.id));
      visible++;

      (proc.subs || []).forEach(sub => {
        if (!edit && !matchesVertical(sub, vertical)) return;
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
  if (!isProcess && item.standards && item.standards.length) {
    const chip = document.createElement('span');
    chip.className = 'biz-std-count';
    chip.textContent = item.standards.length + ' std';
    chip.title = item.standards.join(' · ');
    el.appendChild(chip);
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
     <span class="badge badge-business">Business</span>`;

  const market   = item.market   && item.market[state.market];
  const vertical = item.vertical && (state.vertical !== 'All' ? item.vertical[state.vertical] : null);
  const marketLabel = (MARKETS.find(m => m.key === state.market) || {}).label || state.market;

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

  if (market) {
    html += `
    <div class="psec">
      <div class="psec-label">Market Variation — ${marketLabel}</div>
      <div class="biz-market-block">${market}</div>
    </div>`;
  }

  if (vertical) {
    html += `
    <div class="psec">
      <div class="psec-label">Vertical Detail — ${state.vertical}</div>
      <div class="biz-vert-block">${vertical}</div>
    </div>`;
  } else if (item.vertical && state.vertical === 'All') {
    // Show all verticals when no single one is selected
    const rows = Object.entries(item.vertical)
      .map(([k, v]) => `<div class="biz-vert-row"><span class="biz-vert-tag vert-${k.toLowerCase()}">${k}</span><span>${v}</span></div>`)
      .join('');
    html += `
    <div class="psec">
      <div class="psec-label">Vertical Detail — All Sectors</div>
      ${rows}
    </div>`;
  }

  if (item.standards && item.standards.length) {
    html += `
    <div class="psec">
      <div class="psec-label">Standards &amp; Frameworks</div>
      <div class="biz-std-grid">${item.standards.map(s => `<span class="biz-std-chip">${s}</span>`).join('')}</div>
    </div>`;
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
