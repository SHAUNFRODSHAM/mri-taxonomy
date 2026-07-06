/* ═══════════════════════════════════════════════════════════════════════════
   linkEditor.js — business ⇄ system link management (used inside edit dialogs)

   Renders a "linked processes" section (list + remove + add-via-picker) for an
   anchor item, so link editing is part of Edit Mode. Link changes mutate the
   store immediately and dispatch "mri:versionDirty".

   renderLinkEditor(container, anchorId, side)
     side 'business' → anchor is a value-stream item; manages its SYSTEM links
     side 'system'   → anchor is a system process; manages its BUSINESS links
   ═══════════════════════════════════════════════════════════════════════════ */

import { ALL_DATA, MODULE_CONFIG } from '../data/index.js';
import { BUSINESS_DATA, BUSINESS_CONFIG, BUSINESS_MODULES } from '../data/business/index.js';
import { addLink, removeLink, systemLinksFor, businessLinksFor } from '../data/links.js';

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const dirty = () => document.dispatchEvent(new CustomEvent('mri:versionDirty'));

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

/** Render (or re-render) the link editor into `container`. */
export function renderLinkEditor(container, anchorId, side) {
  const pickSystem = side === 'business';                 // adding a system target
  const links = pickSystem ? systemLinksFor(anchorId) : businessLinksFor(anchorId);
  const addLabel = pickSystem ? '+ Link a system process' : '+ Link a business process';

  container.innerHTML = `
    <div class="lke-list">
      ${links.length ? links.map(l => `
        <div class="lke-row">
          <span class="lke-title"><strong>${esc(l.moduleLabel)}</strong> › ${esc(l.title)}</span>
          <button type="button" class="lke-del" data-del="${esc(l.id)}" title="Remove link">×</button>
        </div>`).join('') : '<div class="lke-empty">No links yet.</div>'}
    </div>
    <button type="button" class="lke-add">${addLabel}</button>`;

  container.querySelectorAll('.lke-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const otherId = btn.dataset.del;
      if (pickSystem) removeLink(anchorId, otherId); else removeLink(otherId, anchorId);
      renderLinkEditor(container, anchorId, side);
      dirty();
    });
  });

  container.querySelector('.lke-add').addEventListener('click', () => {
    openLinkPicker(pickSystem, picked => {
      if (pickSystem) addLink(anchorId, picked); else addLink(picked, anchorId);
      renderLinkEditor(container, anchorId, side);
      dirty();
    });
  });
}

/** Searchable picker overlay; calls onPick(id) with the chosen process id. */
function openLinkPicker(pickSystem, onPick) {
  const candidates = pickSystem ? systemCandidates() : businessCandidates();
  const heading = pickSystem ? 'Link to an MRI PMX system process' : 'Link to a business process';

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

  const listEl = ov.querySelector('#linkpick-list');
  const searchEl = ov.querySelector('#linkpick-search');
  const draw = q => {
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
    onPick(row.dataset.pick);
    close();
  });
  setTimeout(() => searchEl.focus(), 50);
}
