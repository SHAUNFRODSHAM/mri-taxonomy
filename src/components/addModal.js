import { state, ALL_DATA, MODULE_CONFIG, snapshot, triggerRender } from '../state.js';

// ── ADD ITEM MODAL ─────────────────────────────────────────────────────────────

export function openAddModal(type, colId, procId) {
  state.addTarget = { type, colId, procId };
  document.getElementById('add-modal-title').textContent =
    type === 'col' ? 'Add New Column' :
    type === 'process' ? 'Add Process' : 'Add Sub-Process';

  document.getElementById('add-modal-fields').innerHTML = type === 'col'
    ? `<label>Column Title</label><input id="af-title" placeholder="e.g. Reporting" />`
    : `<label>${type === 'process' ? 'Process' : 'Sub-Process'} Name</label>
       <input id="af-title" placeholder="Name" />
       <label>Style</label>
       <select id="af-type">
         <option value="${type === 'process' ? 'process' : 'sub'}">${type === 'process' ? 'Process (orange)' : 'Sub-Process (white)'}</option>
         <option value="${type === 'process' ? 'sub' : 'process'}">${type === 'process' ? 'Sub-Process (white)' : 'Process (orange)'}</option>
       </select>`;

  document.getElementById('add-modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('af-title')?.focus(), 100);
}

export function closeAddModal() {
  document.getElementById('add-modal-overlay').classList.remove('open');
  state.addTarget = null;
}

export function confirmAdd() {
  const titleEl = document.getElementById('af-title');
  const value   = titleEl ? titleEl.value.trim() : '';
  if (!value) { if (titleEl) titleEl.style.borderColor = 'var(--red)'; return; }

  const typeVal = (document.getElementById('af-type') || {}).value || 'sub';
  const uid     = 'custom_' + Date.now();
  const d       = ALL_DATA[state.currentTab];

  snapshot();

  if (state.addTarget.type === 'col') {
    d.push({ id: uid, title: value, processes: [] });
  } else if (state.addTarget.type === 'process') {
    d.find(c => c.id === state.addTarget.colId)
     .processes.push({ id: uid, title: value, type: typeVal, desc: '', activities: [], mri_title: '', mri_prereqs: [], mri_assoc: [], subs: [] });
  } else {
    d.find(c => c.id === state.addTarget.colId)
     .processes.find(p => p.id === state.addTarget.procId)
     .subs.push({ id: uid, title: value, type: typeVal, desc: '', activities: [], mri_title: '', mri_prereqs: [], mri_assoc: [] });
  }

  closeAddModal();
  triggerRender();
}

// ── ADD TAB MODAL ──────────────────────────────────────────────────────────────

export function openAddTabModal() {
  document.getElementById('add-tab-overlay').classList.add('open');
  setTimeout(() => document.getElementById('new-tab-name').focus(), 80);
}

export function closeAddTabModal() {
  document.getElementById('add-tab-overlay').classList.remove('open');
}

export function confirmAddTab() {
  const nameEl = document.getElementById('new-tab-name');
  const name   = nameEl.value.trim();
  const icon   = document.getElementById('new-tab-icon').value.trim() || '📋';
  const color  = document.getElementById('new-tab-color').value;

  if (!name) { nameEl.style.borderColor = 'var(--red)'; return; }

  const uid = 'tab_' + Date.now();
  ALL_DATA[uid] = [];
  MODULE_CONFIG[uid] = { label: name, headerClass: 'custom-header-' + uid, headerText: name, colHeaderClass: '', icon, color };

  // Inject dynamic header colour style
  const style = document.createElement('style');
  style.textContent = `.custom-header-${uid} { background: ${color}; }`;
  document.head.appendChild(style);

  // Build and inject tab button
  const tabBar = document.getElementById('tab-bar');
  const addBtn = document.getElementById('tab-add-btn');
  const btn    = document.createElement('button');
  btn.className       = 'tab-btn';
  btn.dataset.tab     = uid;
  btn.innerHTML       = `<span class="tab-icon">${icon}</span>${name}`;
  btn.addEventListener('click', () => {
    // switchTab lives in main.js; use a custom event to avoid circular import
    document.dispatchEvent(new CustomEvent('mri:switchTab', { detail: uid }));
  });
  tabBar.insertBefore(btn, addBtn);

  closeAddTabModal();
  nameEl.value = '';
  document.getElementById('new-tab-icon').value = '';

  // Switch to new tab
  document.dispatchEvent(new CustomEvent('mri:switchTab', { detail: uid }));
}
