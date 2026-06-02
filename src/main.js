import './styles/main.css';
import { state, ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA, snapshot, currentData, triggerRender, registerRender } from './state.js';
import { render }         from './components/grid.js';
import { showPanel, closePanel } from './components/panel.js';
import { openEditModal, closeEditModal, saveEditModal } from './components/editModal.js';
import { openAddModal, closeAddModal, confirmAdd, openAddTabModal, closeAddTabModal, confirmAddTab } from './components/addModal.js';
import { openGenModal, closeGenModal, buildDoc, downloadWord, downloadPDF } from './components/genModal.js';
import { renderVersionPanel } from './components/versionMenu.js';
import { listVersions, saveNewVersion, renameVersion, deleteVersion, getVersion, updateVersionData } from './versions.js';

// ── CALLBACKS passed to grid renderer ─────────────────────────────────────────

const gridCallbacks = {
  onItemClick:  handleClick,
  onEditClick:  openEditModal,
  onRemoveItem: removeItem,
  onAddModal:   openAddModal,
};

// Register render so components can call triggerRender()
registerRender(() => render(gridCallbacks));

// ── HELPERS ───────────────────────────────────────────────────────────────────

function handleClick(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) { showPanel(proc, col.title, true); return; }
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) { showPanel(sub, `${col.title} › ${proc.title}`, false); return; }
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

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────

function switchTab(tabId) {
  if (!ALL_DATA[tabId]) return;
  state.currentTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  closePanel();
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
}

// ── EDIT MODE ─────────────────────────────────────────────────────────────────

function toggleEdit() {
  state.editMode = !state.editMode;
  const btn = document.getElementById('edit-btn');
  btn.textContent = state.editMode ? '✕ Exit Edit' : '✎ Edit Mode';
  btn.classList.toggle('active', state.editMode);
  document.getElementById('add-col-btn').style.display     = state.editMode ? 'inline-flex' : 'none';
  document.getElementById('reset-btn').style.display       = state.editMode ? 'inline-flex' : 'none';
  document.getElementById('tab-bar').classList.toggle('edit-active-tabs', state.editMode);
  updateSaveChangesBtn();
  if (state.editMode) closePanel();
  render(gridCallbacks);
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
  updateVersionData(state.activeVersionId, dataSnapshot, customModules);
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
  ALL_DATA[prev.tab] = prev.data;
  if (prev.tab !== state.currentTab) switchTab(prev.tab);
  else render(gridCallbacks);
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

  const id = saveNewVersion(name, dataSnapshot, customModules);

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
    if (!ALL_DATA[state.currentTab]) state.currentTab = Object.keys(ALL_DATA)[0] || 'cm';
  }

  // Re-sync the tab bar, then re-render
  syncTabBar();
  closeVersionPanel();
  closePanel();
  render(gridCallbacks);
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

// ── EVENT WIRING ──────────────────────────────────────────────────────────────

// Topbar buttons
document.getElementById('edit-btn').addEventListener('click', toggleEdit);
document.getElementById('undo-btn').addEventListener('click', undo);
document.getElementById('add-col-btn').addEventListener('click', () => openAddModal('col', null));
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
document.getElementById('edit-modal-save').addEventListener('click', saveEditModal);

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

// Static tab buttons
document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Cross-component events
document.addEventListener('mri:switchTab',     e => switchTab(e.detail));
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
  }
  if (e.key === 'Enter') {
    if (document.getElementById('add-modal-overlay').classList.contains('open'))  confirmAdd();
    if (document.getElementById('add-tab-overlay').classList.contains('open'))    confirmAddTab();
    if (document.getElementById('save-as-overlay').classList.contains('open'))    confirmSaveAs();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (document.getElementById('edit-modal-overlay').classList.contains('open')) saveEditModal();
  }
});

// ── BOOT ──────────────────────────────────────────────────────────────────────
updateUndoBtn();
updateVersionBadge();
render(gridCallbacks);
