/* ═══════════════════════════════════════════════════════════════════════════
   clientNote.js — shared "Client Note" panel section

   An inline-editable, per-item note surfaced after Core Activities in both the
   System and Value Streams detail panels. The note is stored on the item
   (item.clientNote), so it is captured in the version snapshot automatically —
   i.e. unique per saved client version. Editing dispatches "mri:contentDirty"
   so the app can mark the version dirty / show Save Changes.
   ═══════════════════════════════════════════════════════════════════════════ */

const esc = s => (s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** HTML for the Client Note section (place it right after Core Activities). */
export function clientNoteHTML(item) {
  return `
    <div class="psec">
      <div class="psec-label">Client Note</div>
      <textarea id="panel-client-note" class="client-note-input"
        placeholder="Add a client-specific note — saved with this version…">${esc(item.clientNote)}</textarea>
    </div>`;
}

/** Wire the textarea (call after the panel body HTML is in the DOM). */
export function wireClientNote(item) {
  const ta = document.getElementById('panel-client-note');
  if (!ta) return;
  ta.addEventListener('input', () => {
    item.clientNote = ta.value;
    document.dispatchEvent(new CustomEvent('mri:contentDirty'));
  });
}
