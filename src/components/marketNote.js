/* ═══════════════════════════════════════════════════════════════════════════
   marketNote.js — the market fields, in one place

     marketNoteHTML(item)    read-only panel section (System + Value Streams)
     marketFieldsHTML(item)  the edit-modal form fragment (applicability + notes)
     readMarketFields(item)  write the form back onto the item

   Both edit modals use the form pair so applicability and notes are captured
   identically in either view. Values are stored on the item (item.marketScope,
   item.market), so they are captured in the version snapshot and the undo
   history.

   marketNoteHTML returns '' when the item has no note for the current market
   selection, so it can be dropped into a panel unconditionally.
   ═══════════════════════════════════════════════════════════════════════════ */

import { MARKETS, MARKET_KEYS, marketLabel, selectedMarketNotes } from '../data/markets.js';

const esc = s => (s || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Read-only Market Notes section (place it after Core Activities). */
export function marketNoteHTML(item) {
  const keys = selectedMarketNotes(item);
  if (!keys.length) return '';

  const blocks = keys.map(k => `
      <div class="market-note">
        <div class="market-note-label">${esc(marketLabel(k))}</div>
        <div class="biz-market-block">${esc(item.market[k]).replace(/\n/g, '<br>')}</div>
      </div>`).join('');

  return `
    <div class="psec">
      <div class="psec-label">Market Notes</div>
      ${blocks}
    </div>`;
}

const attrEsc = s => (s || '')
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  .replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Edit-modal fragment: market applicability checkboxes + one note per market.
 *  Pair with readMarketFields() on save. */
export function marketFieldsHTML(item) {
  const scope = item.marketScope || [];
  const notes = item.market      || {};
  // No tag = applies everywhere, so an untagged item shows every box ticked.
  const ticked = k => (scope.length ? scope.includes(k) : true);

  return `
    <div class="modal-sec-head">Market</div>
    <label>Applies to</label>
    <div class="market-scope-row">
      ${MARKETS.map(m => `
        <label class="market-scope-opt">
          <input type="checkbox" class="mkt-scope" data-market="${m.key}" ${ticked(m.key) ? 'checked' : ''} />
          <span>${attrEsc(m.label)}</span>
        </label>`).join('')}
    </div>
    <p class="field-hint">Untick a market to hide this process when that market alone is
       selected. All ticked (the default) means it applies everywhere.</p>
    ${MARKETS.map(m => `
      <label>${attrEsc(m.label)} — note</label>
      <textarea class="mkt-note" data-market="${m.key}"
        placeholder="Terminology or regulatory difference in this market">${esc(notes[m.key])}</textarea>`).join('')}
    <p class="field-hint">Shown in the detail panel for the selected markets only. Leave
       blank where there is no difference worth calling out.</p>`;
}

/** Read the market fragment back onto the item. All markets ticked stores no
 *  tag at all, keeping "universal" as the absence of data rather than a value. */
export function readMarketFields(item) {
  const scope = [...document.querySelectorAll('.mkt-scope')]
    .filter(cb => cb.checked).map(cb => cb.dataset.market);
  item.marketScope = (scope.length && scope.length < MARKET_KEYS.length) ? scope : null;

  const notes = {};
  document.querySelectorAll('.mkt-note').forEach(t => {
    const v = t.value.trim();
    if (v) notes[t.dataset.market] = v;
  });
  item.market = Object.keys(notes).length ? notes : null;
}
