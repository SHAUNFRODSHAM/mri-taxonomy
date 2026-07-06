import './styles/main.css';
import { state, ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA, snapshot, currentData, triggerRender, registerRender, isModuleVisible } from './state.js';
import { render, effectiveScope } from './components/grid.js';
import { showPanel, closePanel, setSystemLinkRenderer } from './components/panel.js';
import { openEditModal, closeEditModal, saveEditModal } from './components/editModal.js';
import { openAddModal, closeAddModal, confirmAdd, openAddTabModal, closeAddTabModal, confirmAddTab } from './components/addModal.js';
import { openGenModal, closeGenModal, buildDoc, downloadWord, downloadPDF } from './components/genModal.js';
import { renderVersionPanel } from './components/versionMenu.js';
import { renderBusiness, initBusinessView, setBusinessLinkRenderer, showBusinessPanel } from './components/businessView.js';
import { openBusinessEditModal, saveBusinessEditModal, initBusinessEditModal, isBusinessEditOpen } from './components/businessEditModal.js';
import { renderMapping, initMappingView, refreshMappingPanel } from './components/mappingView.js';
import { makeMultiSelect } from './components/multiSelect.js';
import { systemLinksFor, businessLinksFor, systemItemModule,
         initLinks, seedLinks, addLink, removeLink, setLinkCoverage,
         COVERAGE, COVERAGE_ORDER } from './data/links.js';
import { findBusinessItem, BUSINESS_DATA, BUSINESS_ORIGINAL, BUSINESS_CONFIG, BUSINESS_MODULES } from './data/business/index.js';
import { listVersions, saveNewVersion, renameVersion, deleteVersion, getVersion, updateVersionData } from './versions.js';

// ── CALLBACKS passed to grid renderer ─────────────────────────────────────────

const gridCallbacks = {
  onItemClick:   handleClick,
  onEditClick:   openEditModal,
  onRemoveItem:  removeItem,
  onAddModal:    openAddModal,
  onScopeChange: cycleScope,
  onBulkTag:     bulkTagColumn,
};

// Register render so components can call triggerRender()
registerRender(() => render(gridCallbacks));

// ── HELPERS ───────────────────────────────────────────────────────────────────

function handleClick(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) { showPanel(proc, col.title, true, effectiveScope(proc)); return; }
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) { showPanel(sub, `${col.title} › ${proc.title}`, false, effectiveScope(sub, proc)); return; }
      }
    }
  }
}

function removeItem(type, colId, procId, subId) {
  snapshot();
  const d = ALL_DATA[state.currentTab];
  if (type === 'col') {
    d.splice(d.findIndex(c => c.id === colId), 1);
  } else if (type === 'proc') {
    const col = d.find(c => c.id === colId);
    col.processes = col.processes.filter(p => p.id !== procId);
  } else {
    const proc = d.find(c => c.id === colId).processes.find(p => p.id === procId);
    proc.subs = proc.subs.filter(s => s.id !== subId);
  }
  render(gridCallbacks);
  updateVersionBadge();
}

// ── VIEW SWITCHING (System ⇄ Business) ────────────────────────────────────────

const VIEW_HINTS = {
  system:   'How the system supports the work · click any item for MRI detail',
  business: 'What the business does & how it varies by market and sector',
  mapping:  'Where business processes tie into the system · click a cell for the linked pairs',
};

function switchView(mode) {
  if (!['system', 'business', 'mapping'].includes(mode)) return;
  state.viewMode = mode;
  closePanel();

  document.body.classList.toggle('mode-business', mode === 'business');
  document.body.classList.toggle('mode-mapping', mode === 'mapping');
  document.querySelectorAll('.view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === mode));
  const hint = document.getElementById('view-switcher-hint');
  if (hint) hint.textContent = VIEW_HINTS[mode];

  // Leaving the system view drops edit mode so chrome stays clean
  if (mode !== 'system' && state.editMode) toggleEdit();

  if (mode === 'business')      renderBusiness();
  else if (mode === 'mapping')  renderMapping();
  else                        { renderScopeFilter(); render(gridCallbacks); }
}

function switchBusinessTab(mod) {
  state.businessTab = mod;
  closePanel();
  renderBusiness();
}

// ── BUSINESS CONTENT EDITING ──────────────────────────────────────────────────

let bizIdSeq = 0;
function newBizId(prefix) { bizIdSeq += 1; return `${prefix}-new${Date.now().toString(36)}${bizIdSeq}`; }

/** Add a business column / process / sub, then open it for editing. */
function businessAdd(kind, colId, procId) {
  const data = BUSINESS_DATA[state.businessTab];
  snapshot();
  let newId;
  if (kind === 'col') {
    newId = newBizId(`${state.businessTab}-dom`);
    data.push({ id: newId, title: 'New Domain', processes: [] });
    renderBusiness();
    return; // columns have no editable fields of their own
  } else if (kind === 'process') {
    const col = data.find(c => c.id === colId);
    newId = newBizId(`${state.businessTab}-p`);
    col.processes.push({ id: newId, title: 'New Process', type: 'process', desc: '', activities: [], subs: [] });
  } else {
    const proc = data.find(c => c.id === colId).processes.find(p => p.id === procId);
    newId = newBizId(`${state.businessTab}-s`);
    (proc.subs = proc.subs || []).push({ id: newId, title: 'New Sub-Process', desc: '', activities: [], market: null, vertical: null, standards: [] });
  }
  renderBusiness();
  openBusinessEditModal(newId);
  updateVersionBadge();
}

/** Remove a business column / process / sub. */
function businessRemove(kind, colId, procId, subId) {
  const data = BUSINESS_DATA[state.businessTab];
  snapshot();
  if (kind === 'col') {
    const i = data.findIndex(c => c.id === colId);
    if (i !== -1) data.splice(i, 1);
  } else if (kind === 'process') {
    const col = data.find(c => c.id === colId);
    col.processes = col.processes.filter(p => p.id !== procId);
  } else {
    const proc = data.find(c => c.id === colId).processes.find(p => p.id === procId);
    proc.subs = (proc.subs || []).filter(s => s.id !== subId);
  }
  renderBusiness();
  updateUndoBtn();
  updateVersionBadge();
}

// ── CROSS-VIEW LINKAGE (Phase 2) ──────────────────────────────────────────────

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Build the cross-reference section for a detail panel.
 * side === 'business' → show the MRI PMX system processes that deliver it.
 * side === 'system'   → show the business processes it supports.
 */
function covBadge(coverage, b, s) {
  const c = COVERAGE[coverage] || COVERAGE.full;
  const editable = state.linkEditMode;
  return `<span class="cov-badge${editable ? ' cov-editable' : ''}" style="--cov:${c.color}"
    data-cov-b="${esc(b)}" data-cov-s="${esc(s)}"
    title="${editable ? 'Click to cycle coverage · ' : ''}${esc(c.label)}">${esc(c.short)}</span>`;
}

function renderLinkSection(id, side) {
  const links = side === 'business' ? systemLinksFor(id) : businessLinksFor(id);
  const label = side === 'business' ? 'Delivered in MRI PMX by' : 'Supports Business Processes';

  // In link-edit mode, always show the section (with an Add control) even when empty.
  if (!links.length && !state.linkEditMode) return '';

  const rows = links.map(l => {
    // coverage badge needs the link's two endpoint ids (business id + system id)
    const bId = side === 'business' ? id : l.id;
    const sId = side === 'business' ? l.id : id;
    return `
    <div class="xlink-row">
      <button class="xlink" data-xview="${l.view}" data-xid="${esc(l.id)}">
        <span class="xlink-mod">${esc(l.moduleLabel)}</span>
        <span class="xlink-arrow">→</span>
        <span class="xlink-body">
          <span class="xlink-title">${esc(l.title)}</span>
          <span class="xlink-bc">${esc(l.breadcrumb)}</span>
        </span>
      </button>
      ${covBadge(l.coverage, bId, sId)}
      ${state.linkEditMode ? `<button class="xlink-del" data-del-b="${esc(bId)}" data-del-s="${esc(sId)}" title="Remove link">×</button>` : ''}
    </div>`;
  }).join('');

  const addBtn = state.linkEditMode
    ? `<button class="xlink-add" data-add-side="${side}" data-add-id="${esc(id)}">+ Link a ${side === 'business' ? 'system' : 'business'} process</button>`
    : '';

  return `
    <div class="psec xlink-sec">
      <div class="psec-label">${label} <span class="xlink-count">${links.length}</span></div>
      <div class="xlink-list">${rows || '<p class="psec-text" style="opacity:0.5;font-style:italic;font-size:0.74rem">No links yet.</p>'}</div>
      ${addBtn}
    </div>`;
}

/** Navigate to a linked item in the opposite view and open its detail panel. */
function navigateToLinked(view, id) {
  if (view === 'system') {
    const mod = systemItemModule(id);
    if (state.viewMode !== 'system') switchView('system');
    if (mod && mod !== state.currentTab) switchTab(mod);
    handleClick(id);
  } else {
    const f = findBusinessItem(id);
    if (state.viewMode !== 'business') switchView('business');
    if (f && f.module !== state.businessTab) switchBusinessTab(f.module);
    showBusinessPanel(id);
  }
}

// ── LINK EDITING (Phase 4) ────────────────────────────────────────────────────

function markLinksDirty() {
  state.isDirty = true;
  updateVersionBadge();
  updateSaveChangesBtn();
}

/** Re-open whichever detail panel is currently showing, to reflect link edits. */
function refreshOpenPanel() {
  const id = state.openPanelId;
  if (!id) return;
  if (state.viewMode === 'business') showBusinessPanel(id);
  else if (state.viewMode === 'system') handleClick(id);
}

/** After a link edit, refresh whichever panel is open (incl. the mapping cell). */
function refreshAfterLinkEdit() {
  if (state.viewMode === 'mapping') { renderMapping(); refreshMappingPanel(); }
  else if (state.viewMode === 'system') { render(gridCallbacks); refreshOpenPanel(); } // auto-OOS may change
  else refreshOpenPanel();
}

function toggleLinkEdit() {
  state.linkEditMode = !state.linkEditMode;
  const btn = document.getElementById('link-edit-btn');
  if (btn) {
    btn.classList.toggle('active', state.linkEditMode);
    btn.textContent = state.linkEditMode ? '✓ Done Editing Links' : '✎ Edit Links';
  }
  if (state.viewMode === 'mapping') renderMapping();
  refreshOpenPanel();
}

/** Delegated handler for coverage-cycle / remove / add controls in a panel. */
function handleLinkControlClick(e) {
  const cov = e.target.closest('.cov-badge.cov-editable');
  if (cov) {
    e.stopPropagation();
    const b = cov.dataset.covB, s = cov.dataset.covS;
    const links = state.links;
    const link = links.find(l => l.b === b && l.s === s);
    if (link) {
      const i = COVERAGE_ORDER.indexOf(link.coverage);
      link.coverage = COVERAGE_ORDER[(i + 1) % COVERAGE_ORDER.length];
      markLinksDirty();
      refreshAfterLinkEdit();
    }
    return true;
  }
  const del = e.target.closest('.xlink-del');
  if (del) {
    e.stopPropagation();
    removeLink(del.dataset.delB, del.dataset.delS);
    markLinksDirty();
      refreshAfterLinkEdit();
    return true;
  }
  const add = e.target.closest('.xlink-add');
  if (add) {
    e.stopPropagation();
    openLinkPicker(add.dataset.addSide, add.dataset.addId);
    return true;
  }
  return false;
}

// ── Link picker (add a link from a detail panel) ──────────────────────────────

function systemCandidates() {
  const out = [];
  Object.keys(ALL_DATA).forEach(mod => ALL_DATA[mod].forEach(col => col.processes.forEach(p => {
    out.push({ id: p.id, label: `${MODULE_CONFIG[mod]?.label || mod} › ${col.title}`, title: p.title });
    (p.subs || []).forEach(s => out.push({ id: s.id, label: `${MODULE_CONFIG[mod]?.label || mod} › ${col.title} › ${p.title}`, title: s.title }));
  })));
  return out;
}
function businessCandidates() {
  const out = [];
  BUSINESS_MODULES.forEach(mod => BUSINESS_DATA[mod].forEach(col => col.processes.forEach(p => {
    out.push({ id: p.id, label: `${BUSINESS_CONFIG[mod]?.label || mod} › ${col.title}`, title: p.title });
    (p.subs || []).forEach(s => out.push({ id: s.id, label: `${BUSINESS_CONFIG[mod]?.label || mod} › ${col.title} › ${p.title}`, title: s.title }));
  })));
  return out;
}

/** Open a searchable picker to add a link from the current item to the other view. */
function openLinkPicker(side, anchorId) {
  // side === 'business' → anchor is a business item, pick a SYSTEM target.
  const pickSystem  = side === 'business';
  const candidates  = pickSystem ? systemCandidates() : businessCandidates();
  const heading     = pickSystem ? 'Link to an MRI PMX system process' : 'Link to a business process';

  const ov = document.createElement('div');
  ov.className = 'linkpick-overlay';
  ov.innerHTML = `
    <div class="linkpick">
      <div class="linkpick-hdr">
        <h3>${heading}</h3>
        <button class="modal-x" id="linkpick-close">✕</button>
      </div>
      <input type="text" class="linkpick-search" id="linkpick-search" placeholder="Search processes…" autocomplete="off">
      <div class="linkpick-list" id="linkpick-list"></div>
    </div>`;
  document.body.appendChild(ov);

  const listEl   = ov.querySelector('#linkpick-list');
  const searchEl = ov.querySelector('#linkpick-search');

  const draw = (q) => {
    const term = q.trim().toLowerCase();
    const rows = candidates
      .filter(c => !term || c.title.toLowerCase().includes(term) || c.label.toLowerCase().includes(term))
      .slice(0, 60);
    listEl.innerHTML = rows.length
      ? rows.map(c => `<button class="linkpick-row" data-pick="${esc(c.id)}">
          <span class="linkpick-title">${esc(c.title)}</span>
          <span class="linkpick-bc">${esc(c.label)}</span></button>`).join('')
      : '<div class="linkpick-empty">No matches</div>';
  };
  draw('');

  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#linkpick-close').addEventListener('click', close);
  searchEl.addEventListener('input', () => draw(searchEl.value));
  listEl.addEventListener('click', e => {
    const row = e.target.closest('.linkpick-row');
    if (!row) return;
    const picked = row.dataset.pick;
    const b = pickSystem ? anchorId : picked;
    const s = pickSystem ? picked : anchorId;
    if (addLink(b, s, 'full')) { markLinksDirty(); refreshAfterLinkEdit(); }
    close();
  });
  setTimeout(() => searchEl.focus(), 50);
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────

function switchTab(tabId) {
  if (!ALL_DATA[tabId]) return;
  state.currentTab = tabId;
  state.scopeFilters = ['core', 'custom', 'out-of-scope', 'untagged']; // reset filter on tab switch

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  closePanel();
  renderScopeFilter();   // rebuild so the dropdown reflects the reset selection
  render(gridCallbacks);
}

/**
 * Rebuild the tab bar to match the current ALL_DATA / MODULE_CONFIG.
 * Keeps cm/gl/ap static buttons; removes stale custom tabs and re-adds live ones.
 */
function syncTabBar() {
  const tabBar = document.getElementById('tab-bar');
  const addBtn = document.getElementById('tab-add-btn');
  const builtIn = new Set(Object.keys(ORIGINAL_DATA));

  // Remove existing custom-tab buttons
  tabBar.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    if (!builtIn.has(btn.dataset.tab)) btn.remove();
  });

  // Re-add custom tabs present in ALL_DATA
  Object.keys(ALL_DATA).forEach(tabId => {
    if (builtIn.has(tabId)) return; // built-ins keep their static HTML buttons
    const cfg = MODULE_CONFIG[tabId];
    if (!cfg) return;

    // Inject dynamic colour style if not already present
    if (cfg.color && !document.getElementById(`style-${tabId}`)) {
      const s = document.createElement('style');
      s.id = `style-${tabId}`;
      s.textContent = `.${cfg.headerClass} { background: ${cfg.color}; }`;
      document.head.appendChild(s);
    }

    const btn = document.createElement('button');
    btn.className   = 'tab-btn';
    btn.dataset.tab = tabId;
    btn.innerHTML   = `<span class="tab-icon">${cfg.icon || '📋'}</span>${cfg.label}`;
    btn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('mri:switchTab', { detail: tabId }));
    });
    tabBar.insertBefore(btn, addBtn);
  });

  // Sync active state
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.currentTab);
  });

  applyModuleVisibility();
}

// ── MODULE VISIBILITY ───────────────────────────────────────────────────────

/**
 * Show/hide each module tab button per state.moduleVisibility.
 * If the active tab has been hidden, switch to the first visible module.
 */
function applyModuleVisibility() {
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.classList.toggle('tab-hidden', !isModuleVisible(btn.dataset.tab));
  });

  // If current tab got hidden, move to the first visible module.
  if (!isModuleVisible(state.currentTab)) {
    const firstVisible = Object.keys(ALL_DATA).find(isModuleVisible);
    if (firstVisible) switchTab(firstVisible);
  }
}

/** Toggle a module's visibility, mark dirty, and re-sync the UI. */
function toggleModuleVisible(tab) {
  const nowVisible = !isModuleVisible(tab);
  state.moduleVisibility[tab] = nowVisible;
  state.isDirty = true;
  applyModuleVisibility();
  updateVersionBadge();
  renderVersionPanel();
  // Keep the edit-mode dropdown in sync if it's open
  if (document.getElementById('mod-vis-menu').classList.contains('open')) {
    buildModuleVisMenu();
  }
}

// ── EDIT-MODE MODULE VISIBILITY DROPDOWN ──────────────────────────────────────

/** Populate the topbar Modules dropdown with a checkbox per module. */
function buildModuleVisMenu() {
  const menu = document.getElementById('mod-vis-menu');
  const tabIds = Object.keys(ALL_DATA);
  const visibleCount = tabIds.filter(isModuleVisible).length;

  let html = '<div class="mod-vis-menu-title">Visible Modules</div>';
  tabIds.forEach(tab => {
    const cfg = MODULE_CONFIG[tab] || {};
    const visible = isModuleVisible(tab);
    const lastVisible = visible && visibleCount === 1;
    html += `<label class="mod-vis-row${visible ? '' : ' off'}">
      <input type="checkbox" data-mod="${tab}" ${visible ? 'checked' : ''} ${lastVisible ? 'disabled' : ''}
        ${lastVisible ? 'title="At least one module must stay visible"' : ''}>
      <span class="mod-vis-icon">${cfg.icon || '📋'}</span>
      <span class="mod-vis-name">${cfg.label || tab}</span>
    </label>`;
  });
  html += '<div class="mod-vis-hint">Use Save Changes (or Save As) to commit this selection to the version.</div>';
  menu.innerHTML = html;

  menu.querySelectorAll('input[data-mod]').forEach(cb => {
    cb.addEventListener('change', () => toggleModuleVisible(cb.dataset.mod));
  });
}

function openModuleVisMenu() {
  buildModuleVisMenu();
  document.getElementById('mod-vis-menu').classList.add('open');
  document.getElementById('mod-vis-btn').classList.add('active');
}

function closeModuleVisMenu() {
  document.getElementById('mod-vis-menu').classList.remove('open');
  document.getElementById('mod-vis-btn').classList.remove('active');
}

function toggleModuleVisMenu() {
  const open = document.getElementById('mod-vis-menu').classList.contains('open');
  if (open) closeModuleVisMenu(); else openModuleVisMenu();
}

// ── EDIT MODE ─────────────────────────────────────────────────────────────────

function toggleEdit() {
  state.editMode = !state.editMode;
  const btn = document.getElementById('edit-btn');
  btn.textContent = state.editMode ? '✕ Exit Edit' : '✎ Edit Mode';
  btn.classList.toggle('active', state.editMode);
  document.getElementById('add-col-btn').style.display     = state.editMode ? 'inline-flex' : 'none';
  document.getElementById('reset-btn').style.display       = state.editMode ? 'inline-flex' : 'none';
  document.getElementById('mod-vis-wrap').style.display    = state.editMode ? 'inline-block' : 'none';
  if (!state.editMode) closeModuleVisMenu();
  document.getElementById('tab-bar').classList.toggle('edit-active-tabs', state.editMode);
  updateSaveChangesBtn();
  if (state.editMode) closePanel();
  if (state.viewMode === 'business') renderBusiness();
  else if (state.viewMode === 'mapping') renderMapping();
  else render(gridCallbacks);
}

/** Show Save Changes only when in edit mode on a non-original saved version. */
function updateSaveChangesBtn() {
  const visible = state.editMode && state.activeVersionId !== 'original';
  document.getElementById('save-changes-btn').style.display = visible ? 'inline-flex' : 'none';
}

/** Overwrite the active saved version with the current ALL_DATA. */
function saveChangesToVersion() {
  if (state.activeVersionId === 'original') return;
  const dataSnapshot = {};
  Object.keys(ALL_DATA).forEach(tab => {
    dataSnapshot[tab] = JSON.parse(JSON.stringify(ALL_DATA[tab]));
  });
  const builtIn = new Set(Object.keys(ORIGINAL_DATA));
  const customModules = Object.keys(MODULE_CONFIG)
    .filter(k => !builtIn.has(k))
    .map(k => ({ id: k, config: MODULE_CONFIG[k] }));
  updateVersionData(state.activeVersionId, dataSnapshot, customModules, { ...state.moduleVisibility }, JSON.parse(JSON.stringify(state.links)), JSON.parse(JSON.stringify(BUSINESS_DATA)));
  state.isDirty = false;
  updateVersionBadge();
  updateSaveChangesBtn();
  const nameEl = document.getElementById('ver-badge-name');
  if (nameEl) {
    nameEl.style.color = '#8fb83a';
    setTimeout(() => { nameEl.style.color = ''; }, 1200);
  }
}

// ── RESET TO ORIGINAL ─────────────────────────────────────────────────────────

function openResetModal() {
  const cfg = MODULE_CONFIG[state.currentTab];
  document.getElementById('reset-tab-label').textContent = `Reset "${cfg?.label || state.currentTab}" only`;
  document.getElementById('reset-modal-overlay').classList.add('open');
}

function closeResetModal() {
  document.getElementById('reset-modal-overlay').classList.remove('open');
}

function resetTab() {
  // Business view → restore the active business module from its factory baseline
  if (state.viewMode === 'business') {
    const bt = state.businessTab;
    if (!BUSINESS_ORIGINAL[bt]) { closeResetModal(); return; }
    snapshot();
    BUSINESS_DATA[bt] = JSON.parse(JSON.stringify(BUSINESS_ORIGINAL[bt]));
    closeResetModal();
    closePanel();
    renderBusiness();
    updateUndoBtn();
    updateVersionBadge();
    return;
  }
  const tab = state.currentTab;
  if (!ORIGINAL_DATA[tab]) {
    closeResetModal();
    alert(`"${MODULE_CONFIG[tab]?.label || tab}" is a custom tab with no original content to restore.`);
    return;
  }
  snapshot();
  ALL_DATA[tab] = JSON.parse(JSON.stringify(ORIGINAL_DATA[tab]));
  closeResetModal();
  closePanel();
  render(gridCallbacks);
  updateUndoBtn();
  updateVersionBadge();
}

function resetAll() {
  const builtIn = Object.keys(ORIGINAL_DATA);
  builtIn.forEach(tab => {
    state.history.push({ tab, data: JSON.parse(JSON.stringify(ALL_DATA[tab])) });
  });
  while (state.history.length > 20) state.history.shift();
  state.isDirty = true;

  builtIn.forEach(tab => {
    ALL_DATA[tab] = JSON.parse(JSON.stringify(ORIGINAL_DATA[tab]));
  });

  closeResetModal();
  closePanel();
  render(gridCallbacks);
  updateUndoBtn();
  updateVersionBadge();
}

// ── UNDO ──────────────────────────────────────────────────────────────────────

function undo() {
  if (!state.history.length) return;
  const prev = state.history.pop();
  if (prev.view === 'business') {
    BUSINESS_DATA[prev.tab] = prev.data;
    if (state.viewMode !== 'business') switchView('business');
    if (state.businessTab !== prev.tab) state.businessTab = prev.tab;
    renderBusiness();
  } else {
    ALL_DATA[prev.tab] = prev.data;
    if (state.viewMode !== 'system') switchView('system');
    if (prev.tab !== state.currentTab) switchTab(prev.tab);
    else render(gridCallbacks);
  }
  updateUndoBtn();
  updateVersionBadge();
}

function updateUndoBtn() {
  const btn = document.getElementById('undo-btn');
  const n   = state.history.length;
  btn.disabled = !n;
  btn.style.opacity = n ? '1' : '0.38';
  btn.title = n ? `Undo (${n} step${n > 1 ? 's' : ''} available)` : 'Nothing to undo';
}

// ── VERSION PANEL ─────────────────────────────────────────────────────────────

function openVersionPanel() {
  renderVersionPanel();
  document.getElementById('ver-panel').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.getElementById('burger-btn').classList.add('ver-open');
}

function closeVersionPanel() {
  document.getElementById('ver-panel').classList.remove('open');
  // Only remove the overlay if the detail panel is also closed
  if (!document.getElementById('panel').classList.contains('open')) {
    document.getElementById('overlay').classList.remove('open');
  }
  document.getElementById('burger-btn').classList.remove('ver-open');
}

// ── VERSION BADGE ─────────────────────────────────────────────────────────────

function updateVersionBadge() {
  const nameEl = document.getElementById('ver-badge-name');
  const dotEl  = document.getElementById('ver-badge-dot');
  const badgeEl = document.getElementById('ver-badge');
  if (!nameEl) return;

  nameEl.textContent = state.activeVersionName || 'Original';
  const dirty = state.isDirty;
  dotEl.classList.toggle('visible', dirty);
  badgeEl.classList.toggle('dirty', dirty);
  badgeEl.title = dirty
    ? `${state.activeVersionName} · Unsaved changes — click to manage versions`
    : `${state.activeVersionName} · Click to manage versions`;
}

// ── SAVE AS ───────────────────────────────────────────────────────────────────

function openSaveAsModal() {
  closeVersionPanel();
  const input = document.getElementById('save-as-name');
  input.value = '';
  input.style.borderColor = '';
  document.getElementById('save-as-overlay').classList.add('open');
  setTimeout(() => input.focus(), 80);
}

function closeSaveAsModal() {
  document.getElementById('save-as-overlay').classList.remove('open');
}

function confirmSaveAs() {
  const input = document.getElementById('save-as-name');
  const name  = input.value.trim();
  if (!name) { input.style.borderColor = 'var(--red)'; input.focus(); return; }

  // Deep-copy entire current ALL_DATA
  const dataSnapshot = {};
  Object.keys(ALL_DATA).forEach(tab => {
    dataSnapshot[tab] = JSON.parse(JSON.stringify(ALL_DATA[tab]));
  });

  // Capture custom module configs
  const builtIn = new Set(Object.keys(ORIGINAL_DATA));
  const customModules = Object.keys(MODULE_CONFIG)
    .filter(k => !builtIn.has(k))
    .map(k => ({ id: k, config: MODULE_CONFIG[k] }));

  const id = saveNewVersion(name, dataSnapshot, customModules, { ...state.moduleVisibility }, JSON.parse(JSON.stringify(state.links)), JSON.parse(JSON.stringify(BUSINESS_DATA)));

  // Set this as the active version, now clean
  state.activeVersionId   = id;
  state.activeVersionName = name;
  state.isDirty           = false;

  closeSaveAsModal();
  updateVersionBadge();

  // Brief visual confirmation
  const badge = document.getElementById('ver-badge-name');
  if (badge) {
    badge.style.color = 'var(--green)';
    setTimeout(() => { badge.style.color = ''; }, 1200);
  }
}

// ── LOAD VERSION ──────────────────────────────────────────────────────────────

function loadVersion(id) {
  const builtIn = new Set(Object.keys(ORIGINAL_DATA));

  if (id === 'original') {
    // Snapshot current state so load is undoable
    Object.keys(ALL_DATA).forEach(tab => {
      state.history.push({ tab, data: JSON.parse(JSON.stringify(ALL_DATA[tab])) });
    });
    while (state.history.length > 20) state.history.shift();

    // Restore built-in data
    Object.keys(ORIGINAL_DATA).forEach(tab => {
      ALL_DATA[tab] = JSON.parse(JSON.stringify(ORIGINAL_DATA[tab]));
    });

    // Remove custom tabs from ALL_DATA and MODULE_CONFIG
    Object.keys(ALL_DATA).forEach(tab => {
      if (!builtIn.has(tab)) {
        delete ALL_DATA[tab];
        delete MODULE_CONFIG[tab];
      }
    });

    state.activeVersionId   = 'original';
    state.activeVersionName = 'Original';
    state.isDirty           = false;
    state.moduleVisibility  = {}; // original shows all modules
    state.links             = seedLinks(); // original = the seed mapping
    Object.keys(BUSINESS_ORIGINAL).forEach(m => { BUSINESS_DATA[m] = JSON.parse(JSON.stringify(BUSINESS_ORIGINAL[m])); });
    if (!ALL_DATA[state.currentTab]) state.currentTab = 'cm';

  } else {
    const v = getVersion(id);
    if (!v) { alert('Version not found.'); return; }

    // Snapshot all tabs so load is undoable
    Object.keys(ALL_DATA).forEach(tab => {
      state.history.push({ tab, data: JSON.parse(JSON.stringify(ALL_DATA[tab])) });
    });
    while (state.history.length > 20) state.history.shift();

    // Remove all current custom tabs
    Object.keys(ALL_DATA).forEach(tab => {
      if (!builtIn.has(tab)) { delete ALL_DATA[tab]; delete MODULE_CONFIG[tab]; }
    });

    // Restore all tabs from the saved snapshot
    Object.keys(v.data).forEach(tab => {
      ALL_DATA[tab] = JSON.parse(JSON.stringify(v.data[tab]));
    });

    // Restore custom module configs
    (v.customModules || []).forEach(m => {
      MODULE_CONFIG[m.id] = m.config;
    });

    state.activeVersionId   = id;
    state.activeVersionName = v.name;
    state.isDirty           = false;
    state.moduleVisibility  = { ...(v.moduleVisibility || {}) };
    state.links             = (v.links && v.links.length) ? JSON.parse(JSON.stringify(v.links)) : seedLinks();
    if (v.businessData) {
      Object.keys(v.businessData).forEach(m => { BUSINESS_DATA[m] = JSON.parse(JSON.stringify(v.businessData[m])); });
    }
    if (!ALL_DATA[state.currentTab]) state.currentTab = Object.keys(ALL_DATA)[0] || 'cm';
  }

  // Re-sync the tab bar, then re-render the active view
  syncTabBar();
  closeVersionPanel();
  closePanel();
  if (state.viewMode === 'business')      renderBusiness();
  else if (state.viewMode === 'mapping')  renderMapping();
  else                                    render(gridCallbacks);
  updateUndoBtn();
  updateVersionBadge();
  updateSaveChangesBtn();
}

// ── DELETE VERSION ────────────────────────────────────────────────────────────

function handleDeleteVersion(id) {
  deleteVersion(id);

  // If we just deleted the active version, revert indicator to original
  if (state.activeVersionId === id) {
    state.activeVersionId   = 'original';
    state.activeVersionName = 'Original';
    state.isDirty           = true;
    updateVersionBadge();
  }

  // Refresh the panel list
  renderVersionPanel();
}

// ── SCOPE TAGGING ─────────────────────────────────────────────────────────────

const SCOPE_CYCLE = [null, 'core', 'custom', 'out-of-scope'];

/** Cycle an item's scope to the next value and re-render. */
function cycleScope(item) {
  snapshot();
  const current = item.scope || null;
  const idx     = SCOPE_CYCLE.indexOf(current);
  item.scope    = SCOPE_CYCLE[(idx + 1) % SCOPE_CYCLE.length];
  render(gridCallbacks);
  updateVersionBadge();
}

/** Set all processes and sub-processes in a column to a given scope. */
function bulkTagColumn(colId, scope) {
  snapshot();
  const col = ALL_DATA[state.currentTab]?.find(c => c.id === colId);
  if (!col) return;
  col.processes.forEach(proc => {
    proc.scope = scope;
    (proc.subs || []).forEach(sub => { sub.scope = scope; });
  });
  render(gridCallbacks);
  updateVersionBadge();
}

// ── EVENT WIRING ──────────────────────────────────────────────────────────────

// Topbar buttons
document.getElementById('edit-btn').addEventListener('click', toggleEdit);
document.getElementById('undo-btn').addEventListener('click', undo);
document.getElementById('add-col-btn').addEventListener('click', () => openAddModal('col', null));
document.getElementById('mod-vis-btn').addEventListener('click', e => { e.stopPropagation(); toggleModuleVisMenu(); });
// Close the Modules dropdown on any outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#mod-vis-wrap')) closeModuleVisMenu();
});
document.getElementById('gen-btn').addEventListener('click', openGenModal);
document.getElementById('reset-btn').addEventListener('click', openResetModal);
document.getElementById('save-changes-btn').addEventListener('click', saveChangesToVersion);

// Burger + version badge
document.getElementById('burger-btn').addEventListener('click', openVersionPanel);
document.getElementById('ver-badge').addEventListener('click', openVersionPanel);

// Version panel
document.getElementById('ver-panel-close').addEventListener('click', closeVersionPanel);
document.getElementById('ver-save-as-btn').addEventListener('click', openSaveAsModal);

// Save As modal
document.getElementById('save-as-close').addEventListener('click', closeSaveAsModal);
document.getElementById('save-as-cancel').addEventListener('click', closeSaveAsModal);
document.getElementById('save-as-confirm').addEventListener('click', confirmSaveAs);

// Reset modal
document.getElementById('reset-modal-cancel').addEventListener('click', closeResetModal);
document.getElementById('reset-tab-btn').addEventListener('click', resetTab);
document.getElementById('reset-all-btn').addEventListener('click', resetAll);

// Panel
document.getElementById('overlay').addEventListener('click', () => {
  closePanel();
  closeVersionPanel();
});
document.getElementById('panel-close').addEventListener('click', closePanel);

// Edit modal
document.getElementById('edit-modal-close').addEventListener('click', closeEditModal);
document.getElementById('edit-modal-cancel').addEventListener('click', closeEditModal);
function saveActiveEditModal() {
  if (isBusinessEditOpen()) saveBusinessEditModal();
  else saveEditModal();
}
document.getElementById('edit-modal-save').addEventListener('click', saveActiveEditModal);

// Add modal
document.getElementById('add-modal-cancel').addEventListener('click', closeAddModal);
document.getElementById('add-modal-confirm').addEventListener('click', confirmAdd);

// Add tab modal
document.getElementById('tab-add-btn').addEventListener('click', openAddTabModal);
document.getElementById('add-tab-cancel').addEventListener('click', closeAddTabModal);
document.getElementById('add-tab-confirm').addEventListener('click', confirmAddTab);

// Generate modal
document.getElementById('gen-modal-close').addEventListener('click', closeGenModal);
document.getElementById('gen-close-btn').addEventListener('click', closeGenModal);
document.getElementById('gen-preview-btn').addEventListener('click', buildDoc);
document.getElementById('gen-word-btn').addEventListener('click', downloadWord);
document.getElementById('gen-pdf-btn').addEventListener('click', downloadPDF);

// Scope filter — shared multi-select dropdown (same component as the business
// Market/Vertical filters). Rebuilt on full renders/tab switches; toggling a
// scope re-renders only the grid so the popover stays open.
const SCOPE_FILTER_OPTS = [
  { value: 'core',         label: '● CORE',          short: 'CORE' },
  { value: 'custom',       label: '● CUSTOM',        short: 'CUSTOM' },
  { value: 'out-of-scope', label: '● OUT OF SCOPE',  short: 'OOS' },
  { value: 'untagged',     label: 'Untagged',        short: 'Untagged' },
];
const SCOPE_FILTER_COLOURS = {
  core: 'var(--green)', custom: 'var(--amber)', 'out-of-scope': '#8a8a8a', untagged: 'var(--border2)',
};
function renderScopeFilter() {
  const mount = document.getElementById('scope-filter-mount');
  if (!mount) return;
  mount.innerHTML = '';
  mount.appendChild(makeMultiSelect('Scope', SCOPE_FILTER_OPTS, 'scopeFilters', {
    swatch: v => SCOPE_FILTER_COLOURS[v] || 'var(--border2)',
    onChange: () => render(gridCallbacks),
  }));
}

/** Expand or collapse every process (with subs) in the current system module. */
function toggleExpandAll() {
  const ids = [];
  currentData().forEach(col => col.processes.forEach(p => { if ((p.subs || []).length) ids.push(p.id); }));
  const allExpanded = ids.length > 0 && ids.every(id => state.expandedProcs[id]);
  ids.forEach(id => { if (allExpanded) delete state.expandedProcs[id]; else state.expandedProcs[id] = true; });
  render(gridCallbacks);
}

// Static tab buttons
document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// View switcher (System ⇄ Business)
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => switchView(btn.dataset.view));
});

// Expand / collapse all sub-processes (System view)
document.getElementById('expand-all-btn')?.addEventListener('click', toggleExpandAll);
initBusinessView({ onTabSwitch: switchBusinessTab, onEdit: openBusinessEditModal, onRemove: businessRemove, onAdd: businessAdd });
initBusinessEditModal({ afterSave: () => { renderBusiness(); updateUndoBtn(); updateVersionBadge(); } });
initMappingView({ navigate: navigateToLinked });

// Cross-view linkage: inject link-section renderers into both panels and wire
// click-through navigation (delegated, since panel bodies are re-rendered).
setSystemLinkRenderer(renderLinkSection);
setBusinessLinkRenderer(renderLinkSection);
document.getElementById('panel-body').addEventListener('click', e => {
  if (handleLinkControlClick(e)) return;   // coverage cycle / remove / add
  const x = e.target.closest('.xlink');
  if (!x) return;
  navigateToLinked(x.dataset.xview, x.dataset.xid);
});

// Link edit toggle (shown in Business + Mapping views)
const linkEditBtn = document.getElementById('link-edit-btn');
if (linkEditBtn) linkEditBtn.addEventListener('click', toggleLinkEdit);

// Cross-component events
document.addEventListener('mri:switchTab',     e => switchTab(e.detail));
document.addEventListener('mri:toggleModule',  e => toggleModuleVisible(e.detail));
document.addEventListener('mri:loadVersion',   e => loadVersion(e.detail));
document.addEventListener('mri:deleteVersion', e => handleDeleteVersion(e.detail));
document.addEventListener('mri:renameVersion', e => {
  renameVersion(e.detail.id, e.detail.name);
  // If the renamed version is active, update the badge
  if (state.activeVersionId === e.detail.id) {
    state.activeVersionName = e.detail.name;
    updateVersionBadge();
  }
  renderVersionPanel();
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeEditModal();
    closeAddModal();
    closePanel();
    closeGenModal();
    closeAddTabModal();
    closeResetModal();
    closeSaveAsModal();
    closeVersionPanel();
    closeModuleVisMenu();
  }
  if (e.key === 'Enter') {
    if (document.getElementById('add-modal-overlay').classList.contains('open'))  confirmAdd();
    if (document.getElementById('add-tab-overlay').classList.contains('open'))    confirmAddTab();
    if (document.getElementById('save-as-overlay').classList.contains('open'))    confirmSaveAs();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (document.getElementById('edit-modal-overlay').classList.contains('open')) saveActiveEditModal();
  }
});

// ── BOOT ──────────────────────────────────────────────────────────────────────
initLinks();
updateUndoBtn();
updateVersionBadge();
applyModuleVisibility();
// Boot into the default view (Business Process first, per the methodology)
switchView(state.viewMode);
