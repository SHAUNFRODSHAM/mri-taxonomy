/* ═══════════════════════════════════════════════════════════════════════════
   discoveryPage.js — Client As-Is discovery full-page overlay

   Opens from the system panel (MRI view) or the business panel.
   Shows the As-Is discovery fields for the process that was opened.
   Data is saved on every field blur via setDiscovery().
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';
import { getDiscovery, setDiscovery, emptyEntry } from '../discoveryData.js';
import { BUILTIN_VERSIONS } from '../state.js';

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Injected by main.js: returns [{ id, title, breadcrumb }] for items linked to a given id
let _linkedFor = null;
export function setLinkedItemsFor(fn) { _linkedFor = fn; }

// Injected by main.js: navigate back to a process in the correct view and open its panel
let _openPanel = null;
export function setDiscoveryPanelOpener(fn) { _openPanel = fn; }

// Injected by main.js: resolve { title, breadcrumb } for a given process id and side
let _resolveMeta = null;
export function setDiscoveryMetaResolver(fn) { _resolveMeta = fn; }

// ── Overlay element (created once) ─────────────────────────────────────────

let overlay = null;

function getOrCreateOverlay() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'discovery-overlay';
  overlay.className = 'disc-overlay';
  document.body.appendChild(overlay);

  // Close on overlay backdrop click (not on the page itself)
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeDiscoveryPage();
  });
  return overlay;
}

// ── Current context ─────────────────────────────────────────────────────────

let _ctx = null;  // { businessId, systemId, activeTab, fromView }

export function openDiscoveryPage(itemId, fromView) {
  _ctx = {
    itemId,
    fromView,
  };

  renderPage();

  const ov = getOrCreateOverlay();
  ov.classList.add('open');
}

export function closeDiscoveryPage() {
  if (overlay) overlay.classList.remove('open');
  _ctx = null;
}

// ── Render ──────────────────────────────────────────────────────────────────

function renderPage() {
  if (!_ctx) return;
  const ov = getOrCreateOverlay();

  const isReadOnly = BUILTIN_VERSIONS.has(state.activeVersionId);
  const versionName = state.activeVersionName || 'Unsaved';

  const { itemId, fromView } = _ctx;
  const side = fromView === 'business' ? 'business' : 'system';

  const meta = itemId ? resolveItemMeta(itemId, side) : null;
  const disc = itemId ? getDiscovery(itemId) : emptyEntry();

  const criticality = disc.criticality    || '';
  const discStatus  = disc.discoveryStatus || '';
  const critLabel   = { low: 'Low criticality', medium: 'Medium criticality', high: 'High criticality' };
  const statusLabel = { 'not-started': 'Discovery: Not started', 'in-progress': 'Discovery: In progress', complete: 'Discovery: Complete' };

  const viewLabel = side === 'business' ? 'Business process' : 'MRI System process';

  ov.innerHTML = `
    <div class="disc-page">
      <div class="disc-hdr">
        <button class="disc-back btn btn-ghost" id="disc-back-btn">← Back to process</button>
        <div class="disc-hdr-center">
          <span class="disc-hdr-label">${esc(viewLabel)} · As-Is Discovery</span>
        </div>
        <div class="disc-hdr-version">${esc(versionName)}${isReadOnly ? ' <span class="disc-readonly-tag">read-only</span>' : ''}</div>
      </div>

      <div class="disc-body" id="disc-body">
        ${renderContent(itemId, meta, side, isReadOnly, criticality, discStatus, critLabel, statusLabel, disc)}
      </div>
    </div>`;

  ov.querySelector('#disc-back-btn').addEventListener('click', () => {
    closeDiscoveryPage();
    if (_openPanel && itemId) _openPanel(itemId, side);
  });

  wireFields(ov, itemId, isReadOnly);
}

function renderContent(processId, meta, tab, isReadOnly, criticality, discStatus, critLabel, statusLabel, d) {
  d = d || (processId ? getDiscovery(processId) : emptyEntry());

  const bc = meta ? esc(meta.breadcrumb) : '';
  const title = meta ? esc(meta.title) : (tab === 'business' ? 'Business process not linked' : 'MRI process not linked');

  const critBadge = criticality
    ? `<span class="badge disc-badge-criticality disc-crit-${criticality}">${esc(critLabel[criticality] || criticality)}</span>`
    : '';
  const statusBadge = discStatus
    ? `<span class="badge disc-badge-status disc-status-${discStatus.replace('-', '')}">${esc(statusLabel[discStatus] || discStatus)}</span>`
    : '';
  const typeBadge = `<span class="badge ${tab === 'business' ? 'badge-business' : 'badge-mri'}">${tab === 'business' ? 'Business process' : 'MRI System process'}</span>`;

  const areaLabel = tab === 'business'
    ? 'AS-IS · HOW THE BUSINESS WORKS TODAY'
    : 'AS-IS · HOW THE CLIENT USES MRI TODAY';
  const areaHint = tab === 'business'
    ? 'Client process, regardless of system'
    : 'Current MRI configuration and usage — separate from the taxonomy reference';

  if (!processId) {
    return `<div class="disc-no-link">
      <p>No ${tab === 'business' ? 'business' : 'MRI system'} process is linked to this item yet.</p>
      <p class="disc-no-link-hint">Open the Mapping view to link processes, then return here to record ${tab === 'business' ? 'business' : 'MRI'} As-Is data.</p>
    </div>`;
  }

  const ro = isReadOnly ? ' readonly' : '';
  const rodis = isReadOnly ? ' disabled' : '';

  return `
    <div class="disc-item-hdr">
      ${bc ? `<div class="disc-bc">${bc}</div>` : ''}
      <h1 class="disc-title">${title}</h1>
      <div class="disc-badges" id="disc-badges">
        ${typeBadge}${critBadge}${statusBadge}
      </div>
      ${isReadOnly ? '<p class="disc-readonly-warn">Switch to a client version to edit discovery data.</p>' : ''}

      <div class="disc-meta-row">
        <label class="disc-meta-label">Criticality
          <select class="disc-select" id="disc-criticality"${rodis}>
            <option value="">— not set —</option>
            <option value="low"   ${criticality === 'low'    ? 'selected' : ''}>Low</option>
            <option value="medium"${criticality === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high"  ${criticality === 'high'   ? 'selected' : ''}>High</option>
          </select>
        </label>
        <label class="disc-meta-label">Discovery status
          <select class="disc-select" id="disc-status"${rodis}>
            <option value="">— not set —</option>
            <option value="not-started" ${discStatus === 'not-started' ? 'selected' : ''}>Not started</option>
            <option value="in-progress" ${discStatus === 'in-progress' ? 'selected' : ''}>In progress</option>
            <option value="complete"    ${discStatus === 'complete'    ? 'selected' : ''}>Complete</option>
          </select>
        </label>
      </div>
    </div>

    <div class="disc-section">
      <div class="disc-sec-hdr">
        <span class="disc-sec-num">1</span>
        <span class="disc-sec-title">${esc(areaLabel)}</span>
        <span class="disc-sec-hint">${esc(areaHint)}</span>
      </div>

      <div class="disc-field disc-field-full">
        <label class="disc-field-label">PROCESS NARRATIVE</label>
        <textarea class="disc-textarea" id="disc-narrative" rows="3"${ro}
          placeholder="How this process works today — who does what, what triggers it, what the outcome is.">${esc(d.narrative)}</textarea>
      </div>

      <div class="disc-field-grid">
        <div class="disc-field">
          <label class="disc-field-label">HOW IT WORKS / ROLES</label>
          <textarea class="disc-textarea" id="disc-roles" rows="3"${ro}
            placeholder="Who is involved, what each role does.">${esc(d.roles)}</textarea>
        </div>
        <div class="disc-field">
          <label class="disc-field-label">FREQUENCY / VOLUME</label>
          <textarea class="disc-textarea" id="disc-frequency" rows="3"${ro}
            placeholder="How often it runs, estimated transaction volumes.">${esc(d.frequency)}</textarea>
        </div>
      </div>

      <div class="disc-field-grid">
        <div class="disc-field">
          <label class="disc-field-label">TOOLS &amp; WORKAROUNDS</label>
          <textarea class="disc-textarea" id="disc-tools" rows="3"${ro}
            placeholder="Current systems, spreadsheets, manual steps, known workarounds.">${esc(d.tools)}</textarea>
        </div>
        <div class="disc-field">
          <label class="disc-field-label">CONTROL &amp; IMPACT</label>
          <textarea class="disc-textarea" id="disc-controls" rows="3"${ro}
            placeholder="Approvals, segregation of duties, risk if this process fails.">${esc(d.controls)}</textarea>
        </div>
      </div>

      <div class="disc-field-grid">
        <div class="disc-field">
          <label class="disc-field-label">EVIDENCE / CONFIDENCE</label>
          <div class="disc-evidence-block">
            <input class="disc-input" id="disc-ev-source"       type="text" placeholder="Source (workshop, interview, doc…)"${ro} value="${esc(d.evidenceSource)}">
            <input class="disc-input" id="disc-ev-date"         type="text" placeholder="Date (e.g. 6 July 2026)"${ro} value="${esc(d.evidenceDate)}">
            <input class="disc-input" id="disc-ev-participants" type="text" placeholder="Participants / owner"${ro} value="${esc(d.evidenceParticipants)}">
            <select class="disc-select disc-select-inline" id="disc-ev-confidence"${rodis}>
              <option value="">Confidence — not set</option>
              <option value="low"   ${d.evidenceConfidence === 'low'    ? 'selected' : ''}>Low confidence</option>
              <option value="medium"${d.evidenceConfidence === 'medium' ? 'selected' : ''}>Medium confidence</option>
              <option value="high"  ${d.evidenceConfidence === 'high'   ? 'selected' : ''}>High confidence</option>
            </select>
          </div>
          <p class="disc-field-hint">Capture source, date, participant / owner, and confidence so statements can be validated before sign-off.</p>
        </div>
        <div class="disc-field">
          <label class="disc-field-label">VARIATIONS</label>
          <textarea class="disc-textarea" id="disc-variations" rows="4"${ro}
            placeholder="Differences between entities, sites, or teams.">${esc(d.variations)}</textarea>
        </div>
      </div>
    </div>

    <div class="disc-section disc-section-target">
      <div class="disc-sec-hdr">
        <span class="disc-sec-num">2</span>
        <span class="disc-sec-title">CLIENT TARGET STATE</span>
        <span class="disc-sec-hint">Only record after client validation</span>
      </div>
      <div class="disc-field disc-field-full">
        <textarea class="disc-textarea disc-textarea-target" id="disc-target" rows="4"${ro}
          placeholder="Not yet agreed. Record the desired business outcome and decision owner here. Keep this separate from product capability and Open Box recommendations.">${esc(d.targetState)}</textarea>
      </div>
      <p class="disc-target-note">This section records the client's agreed target state — not Open Box recommendations (see the MRI System view for proposed scope).</p>
    </div>`;
}

// ── Field auto-save ─────────────────────────────────────────────────────────

function wireFields(ov, processId, isReadOnly) {
  if (!processId || isReadOnly) return;

  const save = () => {
    setDiscovery(processId, {
      narrative:            fieldVal('disc-narrative'),
      roles:                fieldVal('disc-roles'),
      frequency:            fieldVal('disc-frequency'),
      tools:                fieldVal('disc-tools'),
      controls:             fieldVal('disc-controls'),
      evidenceSource:       fieldVal('disc-ev-source'),
      evidenceDate:         fieldVal('disc-ev-date'),
      evidenceParticipants: fieldVal('disc-ev-participants'),
      evidenceConfidence:   fieldVal('disc-ev-confidence'),
      variations:           fieldVal('disc-variations'),
      targetState:          fieldVal('disc-target'),
      criticality:          fieldVal('disc-criticality'),
      discoveryStatus:      fieldVal('disc-status'),
    });
  };

  const saveAndRefreshBadges = () => {
    save();
    // Refresh the criticality/status badges in the header without a full re-render
    const disc = getDiscovery(processId);
    const critLabel = { low: 'Low criticality', medium: 'Medium criticality', high: 'High criticality' };
    const statusLabel = { 'not-started': 'Discovery: Not started', 'in-progress': 'Discovery: In progress', complete: 'Discovery: Complete' };
    const tab = _ctx ? (_ctx.fromView === 'business' ? 'business' : 'system') : 'business';
    const typeBadge = `<span class="badge ${tab === 'business' ? 'badge-business' : 'badge-mri'}">${tab === 'business' ? 'Business process' : 'MRI System process'}</span>`;
    const critBadge = disc.criticality
      ? `<span class="badge disc-badge-criticality disc-crit-${disc.criticality}">${esc(critLabel[disc.criticality])}</span>` : '';
    const statusBadge = disc.discoveryStatus
      ? `<span class="badge disc-badge-status disc-status-${disc.discoveryStatus.replace('-', '')}">${esc(statusLabel[disc.discoveryStatus])}</span>` : '';
    const badges = ov.querySelector('#disc-badges');
    if (badges) badges.innerHTML = typeBadge + critBadge + statusBadge;
  };

  // Textarea / input: save on blur
  ov.querySelectorAll('.disc-textarea, .disc-input').forEach(el => {
    el.addEventListener('blur', save);
  });
  // Select: save immediately on change
  ov.querySelectorAll('.disc-select').forEach(el => {
    el.addEventListener('change', saveAndRefreshBadges);
  });

  function fieldVal(id) {
    const el = ov.querySelector('#' + id);
    return el ? el.value : '';
  }
}

// ── Item metadata resolution ─────────────────────────────────────────────────

function resolveItemMeta(id, side) {
  if (_resolveMeta) return _resolveMeta(id, side);
  return null;
}
