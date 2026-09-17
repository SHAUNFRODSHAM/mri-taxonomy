/* ═══════════════════════════════════════════════════════════════════════════
   proposalField.js — the "Proposed Scope" block shared by both edit modals

   Proposed Scope is an Open Box recommendation layered ON TOP of an item's
   current-state tag (coverage in the Business view, scope in the System view).
   Both edit modals render the identical block so the semantics never drift
   between the two sides.

   The rationale is treated as effectively required: a proposal with no "why"
   is just a coloured badge, and it is the rationale that carries the value-add
   argument into the Proposals document.
   ═══════════════════════════════════════════════════════════════════════════ */

import { PROPOSED, isProposed } from '../data/links.js';

/** Markup for the Proposed Scope section. `currentLabel` describes the item's
 *  existing tag so the consultant can see what they are proposing a change to. */
export function proposalFieldHTML(item, currentLabel) {
  const on   = isProposed(item);
  const note = item.proposed_note || '';
  return `
    <div class="modal-sec-head">${PROPOSED.mark} Proposed Scope</div>
    <p class="field-hint" style="margin-top:-6px">${PROPOSED.desc}</p>
    <label class="prop-check-row">
      <input type="checkbox" id="em-proposed" ${on ? 'checked' : ''} />
      <span>Open Box proposes this as additional scope</span>
    </label>
    <p class="field-hint">Current state: <strong>${currentLabel || 'untagged'}</strong> — this is
      recorded separately, so the proposal does not overwrite it.</p>
    <label>Value-add rationale</label>
    <textarea id="em-proposed-note" placeholder="What value would this add? e.g. &quot;Recovery reconciliation is manual in Excel today; PMX CAM recovery would remove ~3 days per quarter and give a full audit trail.&quot;">${note}</textarea>
    <p class="field-hint" id="em-proposed-warn" style="display:none;color:var(--amber)">
      A proposal without a rationale carries no argument — add the value add identified in discovery.</p>`;
}

/** Wire the checkbox so the rationale field reveals its warning when empty. */
export function initProposalField() {
  const cb   = document.getElementById('em-proposed');
  const note = document.getElementById('em-proposed-note');
  const warn = document.getElementById('em-proposed-warn');
  if (!cb || !note || !warn) return;
  const sync = () => {
    warn.style.display = (cb.checked && !note.value.trim()) ? '' : 'none';
  };
  cb.addEventListener('change', sync);
  note.addEventListener('input', sync);
  sync();
}

/** Read the Proposed Scope fields back onto the item. Unticking clears both the
 *  flag and the note so a stale rationale cannot linger on a non-proposal. */
export function applyProposalField(item) {
  const cb   = document.getElementById('em-proposed');
  const note = document.getElementById('em-proposed-note');
  if (!cb) return;
  if (cb.checked) {
    item.proposed = true;
    const txt = (note?.value || '').trim();
    if (txt) item.proposed_note = txt;
    else delete item.proposed_note;
  } else {
    delete item.proposed;
    delete item.proposed_note;
  }
}
