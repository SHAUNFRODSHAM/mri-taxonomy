import { state } from '../state.js';
import { clientNoteHTML } from './clientNote.js';
import { marketNoteHTML } from './marketNote.js';
import { PROPOSED, isProposed, proposedVia, derivedTooltip } from '../data/links.js';

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Phase-2 hook: main.js injects a function returning link-section HTML for a
// system item id (cross-references to the business view). Null = no link UI.
let linkRenderer = null;
export function setSystemLinkRenderer(fn) { linkRenderer = fn; }

export function showPanel(item, bc, isPro, scopeInfo) {
  state.openPanelId = item.id;

  document.getElementById('panel-bc').textContent = bc;
  document.getElementById('panel-title').textContent = item.title;
  const scopeLabel = {
    'core':         '● CORE',
    'custom':       '● CUSTOM',
    'out-of-scope': '● OUT OF SCOPE',
  };
  // Effective scope (manual tag, or auto Out-of-Scope when not linked to a value stream)
  const eff = scopeInfo || { scope: item.scope || null, auto: false };
  const scopeBadge = eff.scope
    ? `<span class="badge badge-scope-${eff.scope}${eff.auto ? ' badge-scope-auto' : ''}"
         title="${eff.auto ? 'Auto — not yet linked to a value stream; review & link, or tag manually.' : ''}">${scopeLabel[eff.scope] || eff.scope}${eff.auto ? ' · auto' : ''}</span>`
    : `<span class="badge badge-scope-untagged">Untagged</span>`;

  const derivedVia = isProposed(item) ? null : proposedVia(item.id, 'system');
  const propBadge = isProposed(item)
    ? `<span class="badge badge-proposed" title="${PROPOSED.desc}">${PROPOSED.mark} ${PROPOSED.short}</span>`
    : (derivedVia
        ? `<span class="badge badge-proposed-derived" title="${esc(derivedTooltip(derivedVia, 'system'))}">○ ${PROPOSED.short} (linked)</span>`
        : '');

  document.getElementById('panel-badges').innerHTML = `
    <span class="badge ${isPro ? 'badge-process' : 'badge-sub'}">${isPro ? 'Process' : 'Sub-Process'}</span>
    <span class="badge badge-mri">MRI</span>
    ${scopeBadge}${propBadge}`;

  // Open Box proposal block — labelled as ours, with the current state spelled
  // out so it can never read as agreed client scope.
  const proposalSec = isProposed(item) ? `
      <div class="psec psec-proposed">
        <div class="psec-label">${PROPOSED.mark} Proposed Scope — Open Box recommendation</div>
        <p class="psec-text">${item.proposed_note
          ? esc(item.proposed_note)
          : '<em>No rationale captured yet. Add the value add identified in discovery via Edit Mode.</em>'}</p>
        <p class="psec-note">Current state: ${scopeLabel[eff.scope] || 'Untagged'}. This is an Open Box
          recommendation, not agreed scope.</p>
      </div>`
    : (derivedVia ? `
      <div class="psec psec-proposed psec-proposed-derived">
        <div class="psec-label">○ Proposed Scope (linked)</div>
        <p class="psec-text">This process is not itself proposed, but it is linked to
          ${derivedVia.length > 1 ? 'value-stream processes that are' : 'a value-stream process that is'}:</p>
        <ul class="act-list">${derivedVia.map(o =>
          `<li>${esc(o.moduleLabel)} › ${esc(o.title)}${o.note ? ` — ${esc(o.note)}` : ''}</li>`).join('')}</ul>
        <p class="psec-note">Shown as part of that proposal. Flag this process directly if it
          warrants a separate case.</p>
      </div>` : '');

  const prereqs = item.mri_prereqs || [];
  const assoc   = item.mri_assoc   || [];

  const clientNote = clientNoteHTML(item);
  const marketNote = marketNoteHTML(item);
  document.getElementById('panel-body').innerHTML = `
    <div class="panel-col">
      <div class="psec">
        <div class="psec-label">Overview</div>
        <p class="psec-text">${esc(item.desc || '')}</p>
      </div>
      <div class="psec">
        <div class="psec-label">Core Activities</div>
        <ul class="act-list">${(item.activities || []).map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      </div>
      ${marketNote}
      ${clientNote}
      ${proposalSec}
    </div>
    <div class="panel-col panel-col-right">
      <div class="psec">
        <div class="psec-label">MRI Module Reference</div>
        <div class="mri-title-block">
          <div class="mri-title-label">Navigation path</div>
          <div class="mri-title-name">${item.mri_title ? esc(item.mri_title) : '<em style="opacity:0.5;font-size:0.78rem;font-weight:400">Not configured</em>'}</div>
        </div>
      </div>
      <div class="psec">
        <div class="psec-label">Setup Prerequisites</div>
        ${prereqs.length
          ? `<ul class="prereq-list">${prereqs.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`
          : '<p class="psec-text" style="opacity:0.45;font-style:italic;font-size:0.74rem">None configured.</p>'}
      </div>
      <div class="psec">
        <div class="psec-label">Associated MRI Screens</div>
        ${assoc.length
          ? `<div class="assoc-grid">${assoc.map(a => `
              <div class="assoc-item">
                <span class="assoc-arrow">↗</span>
                <div>
                  <div class="assoc-name">${esc(a.name)}</div>
                  <div class="assoc-desc">${esc(a.desc)}</div>
                </div>
              </div>`).join('')}</div>`
          : '<p class="psec-text" style="opacity:0.45;font-style:italic;font-size:0.74rem">None configured.</p>'}
      </div>
    </div>`;

  // Cross-references to the business view (Phase 2)
  if (linkRenderer) {
    const linkHtml = linkRenderer(item.id, 'system');
    if (linkHtml) document.getElementById('panel-body').insertAdjacentHTML('beforeend', linkHtml);
  }

  document.getElementById('panel-overlay').classList.add('open');
}

export function closePanel() {
  state.openPanelId = null;
  document.getElementById('panel-overlay').classList.remove('open');
}
