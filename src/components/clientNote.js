/* ═══════════════════════════════════════════════════════════════════════════
   clientNote.js — shared "Client Note" panel section (read-only display)

   A per-item note surfaced after Core Activities in both the System and Value
   Streams detail panels. The note is stored on the item (item.clientNote), so
   it is captured in the version snapshot (per saved client version) and in the
   undo history. Editing happens in the edit modal (Edit Mode only); the panel
   shows it read-only.
   ═══════════════════════════════════════════════════════════════════════════ */

const esc = s => (s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Read-only Client Note section (place it right after Core Activities). */
export function clientNoteHTML(item) {
  const note = (item.clientNote || '').trim();
  return `
    <div class="psec">
      <div class="psec-label">Client Note</div>
      ${note
        ? `<div class="client-note-view">${esc(note).replace(/\n/g, '<br>')}</div>`
        : '<p class="psec-text" style="opacity:0.45;font-style:italic;font-size:0.74rem">No client note — add one in Edit Mode.</p>'}
    </div>`;
}
