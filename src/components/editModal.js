import { state, findItem, findBreadcrumb, snapshot, triggerRender } from '../state.js';

export function openEditModal(id) {
  const item = findItem(id);
  if (!item) return;

  state.editTargetId = id;
  document.getElementById('em-modal-title').textContent = 'Edit: ' + item.title;
  document.getElementById('em-modal-sub').textContent = findBreadcrumb(id);

  const prereqs = item.mri_prereqs || [];
  const assoc   = item.mri_assoc   || [];

  document.getElementById('em-body').innerHTML = `
    <label>Display Name</label>
    <input type="text" id="em-name" value="${esc(item.title)}" />
    <label>Overview Description</label>
    <textarea id="em-desc">${item.desc || ''}</textarea>
    <label>Core Activities</label>
    <textarea id="em-activities">${(item.activities || []).join('\n')}</textarea>
    <p class="field-hint">One activity per line.</p>
    <label>Client Note</label>
    <textarea id="em-client-note" placeholder="Client-specific note — saved with this version">${(item.clientNote || '')}</textarea>
    <div class="modal-sec-head">MRI Sub-Process Title</div>
    <label>MRI Module Reference Title</label>
    <input type="text" id="em-mri-title" value="${esc(item.mri_title || '')}" placeholder="e.g. Unit Maintenance — MRI Property Manager" />
    <p class="field-hint">Primary MRI reference shown in the detail panel.</p>
    <div class="modal-sec-head">MRI Setup Prerequisites</div>
    <p class="field-hint" style="margin-top:-6px">Each item describes something that must be configured in MRI before this process can function.</p>
    <div class="dyn-list" id="prereq-list">
      ${prereqs.map((p, i) => `
        <div class="dyn-row">
          <input type="text" class="prereq-input" value="${esc(p)}" placeholder="Prerequisite ${i + 1}" />
          <button class="dyn-del" data-action="remove-dyn">×</button>
        </div>`).join('')}
    </div>
    <button class="btn-dyn-add" data-action="add-prereq">+ Add Prerequisite</button>
    <div class="modal-sec-head">MRI Associated Processes</div>
    <p class="field-hint" style="margin-top:-6px">Link this process to other MRI modules with a description of how they interact.</p>
    <div class="dyn-list" id="assoc-list">
      ${assoc.map(a => `
        <div class="dyn-row">
          <div class="dyn-row-pair">
            <input type="text" class="assoc-name-input" value="${esc(a.name)}" placeholder="Module name" />
            <input type="text" class="assoc-desc-input" value="${esc(a.desc)}" placeholder="Describe how they interact…" />
          </div>
          <button class="dyn-del" data-action="remove-dyn">×</button>
        </div>`).join('')}
    </div>
    <button class="btn-dyn-add" data-action="add-assoc">+ Add Associated Process</button>`;

  // Single delegated listener for the modal body
  const body = document.getElementById('em-body');
  const handler = (e) => {
    const action = e.target.dataset.action;
    if (action === 'remove-dyn') {
      e.target.closest('.dyn-row').remove();
    } else if (action === 'add-prereq') {
      addDynPrereq();
    } else if (action === 'add-assoc') {
      addDynAssoc();
    }
  };
  // Replace old listener by cloning (clean way for innerHTML-rebuilt content)
  body.addEventListener('click', handler, { once: false });

  document.getElementById('edit-modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('em-name')?.focus(), 80);
}

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function addDynPrereq() {
  const list = document.getElementById('prereq-list');
  const idx  = list.querySelectorAll('.dyn-row').length;
  const row  = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `<input type="text" class="prereq-input" placeholder="Prerequisite ${idx + 1}" /><button class="dyn-del" data-action="remove-dyn">×</button>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

function addDynAssoc() {
  const list = document.getElementById('assoc-list');
  const row  = document.createElement('div');
  row.className = 'dyn-row';
  row.innerHTML = `
    <div class="dyn-row-pair">
      <input type="text" class="assoc-name-input" placeholder="Module name" />
      <input type="text" class="assoc-desc-input" placeholder="Describe how they interact…" />
    </div>
    <button class="dyn-del" data-action="remove-dyn">×</button>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

export function closeEditModal() {
  document.getElementById('edit-modal-overlay').classList.remove('open');
  state.editTargetId = null;
}

export function saveEditModal() {
  if (!state.editTargetId) return;
  const nameEl = document.getElementById('em-name');
  const name   = nameEl.value.trim();
  if (!name) { nameEl.style.borderColor = 'var(--red)'; return; }

  snapshot();
  const item = findItem(state.editTargetId);
  item.title      = name;
  item.desc       = document.getElementById('em-desc').value.trim();
  item.activities = document.getElementById('em-activities').value
    .split('\n').map(s => s.trim()).filter(Boolean);
  item.clientNote = document.getElementById('em-client-note').value.trim();
  item.mri_title  = document.getElementById('em-mri-title').value.trim();
  item.mri_prereqs = [...document.getElementById('prereq-list')
    .querySelectorAll('.prereq-input')]
    .map(i => i.value.trim()).filter(Boolean);
  item.mri_assoc = [...document.getElementById('assoc-list')
    .querySelectorAll('.dyn-row')]
    .map(row => ({
      name: (row.querySelector('.assoc-name-input')?.value || '').trim(),
      desc: (row.querySelector('.assoc-desc-input')?.value || '').trim(),
    })).filter(a => a.name);

  closeEditModal();
  triggerRender();
}
