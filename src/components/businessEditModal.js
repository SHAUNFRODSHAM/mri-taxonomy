/* ═══════════════════════════════════════════════════════════════════════════
   businessEditModal.js — edit a business-process item

   Business leaves carry different fields from system items: market{US,UK,EU},
   vertical{Retail,Industrial,Office,Residential}, and standards[]. This modal
   reuses the shared edit-modal shell (#edit-modal-overlay / #em-body) but builds
   a business-specific form. Saving snapshots (business-aware) then re-renders.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state, snapshot } from '../state.js';
import { findBusinessItem, MARKETS, VERTICALS } from '../data/business/index.js';
import { renderLinkEditor } from './linkEditor.js';

let onSaved = () => {};
export function initBusinessEditModal({ afterSave }) { onSaved = afterSave || (() => {}); }

const esc = s => (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const txt = s => (s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SECTORS = VERTICALS.filter(v => v !== 'All'); // Retail/Industrial/Office/Residential

export function openBusinessEditModal(id) {
  const found = findBusinessItem(id);
  if (!found) return;
  const item = found.item;
  state.editTargetId = id;

  document.getElementById('em-modal-title').textContent = 'Edit: ' + item.title;
  document.getElementById('em-modal-sub').textContent = found.breadcrumb;

  const market   = item.market   || {};
  const vertical = item.vertical || {};

  document.getElementById('em-body').innerHTML = `
    <label>Display Name</label>
    <input type="text" id="bem-name" value="${esc(item.title)}" />
    <label>Overview Description</label>
    <textarea id="bem-desc">${txt(item.desc)}</textarea>
    <label>Core Activities</label>
    <textarea id="bem-activities">${txt((item.activities || []).join('\n'))}</textarea>
    <p class="field-hint">One activity per line.</p>

    <label>Client Note</label>
    <textarea id="bem-client-note" placeholder="Client-specific note — saved with this version">${txt(item.clientNote)}</textarea>

    <div class="modal-sec-head">Market Variation</div>
    <p class="field-hint" style="margin-top:-6px">How this process differs by geography. Leave blank if not applicable.</p>
    ${MARKETS.map(m => `
      <label>${esc(m.label)}</label>
      <textarea class="bem-market" data-market="${m.key}">${txt(market[m.key])}</textarea>`).join('')}

    <div class="modal-sec-head">Vertical / Sector Detail</div>
    <p class="field-hint" style="margin-top:-6px">Sector-specific guidance. Leave blank if not applicable.</p>
    ${SECTORS.map(s => `
      <label>${esc(s)}</label>
      <textarea class="bem-vertical" data-vert="${s}">${txt(vertical[s])}</textarea>`).join('')}

    <div class="modal-sec-head">Standards &amp; Frameworks</div>
    <label>Standards</label>
    <input type="text" id="bem-standards" value="${esc((item.standards || []).join(', '))}" placeholder="e.g. IFRS 16, ASC 842, EPRA BPR" />
    <p class="field-hint">Comma-separated.</p>

    <div class="modal-sec-head">System Coverage</div>
    <label>Coverage tag</label>
    <select id="bem-coverage">
      <option value=""        ${!item.coverage ? 'selected' : ''}>— Untagged —</option>
      <option value="full"    ${item.coverage === 'full' ? 'selected' : ''}>Full — fully in the system</option>
      <option value="partial" ${item.coverage === 'partial' ? 'selected' : ''}>Partial — touches part of the system</option>
      <option value="outside" ${item.coverage === 'outside' ? 'selected' : ''}>Outside — managed outside the system</option>
    </select>
    <p class="field-hint">Full or Partial should be linked to at least one MRI PMX system process below.</p>
    <div class="modal-sec-head">Linked MRI PMX System Processes</div>
    <div id="bem-link-editor"></div>`;

  renderLinkEditor(document.getElementById('bem-link-editor'), id, 'business');

  document.getElementById('edit-modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('bem-name')?.focus(), 80);
}

export function saveBusinessEditModal() {
  if (!state.editTargetId) return;
  const found = findBusinessItem(state.editTargetId);
  if (!found) return;
  const nameEl = document.getElementById('bem-name');
  const name = nameEl.value.trim();
  if (!name) { nameEl.style.borderColor = 'var(--red)'; return; }

  snapshot();
  const item = found.item;
  item.title = name;
  item.desc  = document.getElementById('bem-desc').value.trim();
  item.activities = document.getElementById('bem-activities').value
    .split('\n').map(s => s.trim()).filter(Boolean);
  item.clientNote = document.getElementById('bem-client-note').value.trim();
  item.coverage = document.getElementById('bem-coverage').value || null;

  const market = {};
  document.querySelectorAll('.bem-market').forEach(t => {
    const v = t.value.trim();
    if (v) market[t.dataset.market] = v;
  });
  item.market = Object.keys(market).length ? market : null;

  const vertical = {};
  document.querySelectorAll('.bem-vertical').forEach(t => {
    const v = t.value.trim();
    if (v) vertical[t.dataset.vert] = v;
  });
  item.vertical = Object.keys(vertical).length ? vertical : null;

  item.standards = document.getElementById('bem-standards').value
    .split(',').map(s => s.trim()).filter(Boolean);

  document.getElementById('edit-modal-overlay').classList.remove('open');
  state.editTargetId = null;
  onSaved();
}

/** True while a business edit is the active edit-modal target. */
export function isBusinessEditOpen() {
  return state.viewMode === 'business' &&
    document.getElementById('edit-modal-overlay').classList.contains('open');
}
