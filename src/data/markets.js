/* ═══════════════════════════════════════════════════════════════════════════
   markets.js — the market dimension: applicability filter + note keys

   Two optional fields on any item (system or business) drive everything
   market-related. Both are sparse: an item that says nothing about markets
   behaves exactly as it did before either field existed.

     marketScope: ['UK','EU']              APPLICABILITY. Absent or empty means
                                           the item applies to every market.
                                           Drives the Market filter.

     market: { UK: '…', US: '…', EU: '…' } NOTES. Terminology and regulatory
                                           differences for this process. Shown
                                           for the selected markets only — see
                                           components/marketNote.js.

   Both live on the item, so version snapshots, undo and the document export
   pick them up with no extra plumbing.

   MRI navigation paths (mri_title, mri_assoc[].name) are NEVER localised —
   "CM > Recoveries > Service Charges" is the literal MRI menu label on a US
   install too. Market differences belong in notes ABOUT those screens.
   ═══════════════════════════════════════════════════════════════════════════ */

import { state } from '../state.js';

export const MARKETS = [
  { key: 'UK', label: '🇬🇧 United Kingdom' },
  { key: 'US', label: '🇺🇸 United States' },
  { key: 'EU', label: '🇪🇺 Pan-European' },
];

export const MARKET_KEYS = MARKETS.map(m => m.key);

/** Display label for a market key ('UK' → '🇬🇧 United Kingdom'). */
export function marketLabel(key) {
  return (MARKETS.find(m => m.key === key) || {}).label || key;
}

/** Does an item apply to any selected market? Mirrors matchesVerticals: an
 *  untagged item is universal, and an empty selection hides nothing.
 *
 *  Sub-processes INHERIT their parent's marketScope — the grids gate the parent
 *  first, so tagging a process is enough to take its whole subtree with it. A
 *  sub only needs its own tag when it is narrower than its parent. */
export function matchesMarkets(item) {
  const scope = item.marketScope;
  if (!scope || !scope.length) return true;      // universal — applies everywhere
  const sel = state.markets;
  if (!sel || !sel.length) return true;          // nothing selected → don't hide
  return scope.some(m => sel.includes(m));
}

/** True only when the market selection actually narrows the content. Used to
 *  decide whether an emptied column/grid is a filter result or genuinely empty. */
export function marketFilterActive() {
  const sel = state.markets;
  return !!(sel && sel.length && sel.length < MARKET_KEYS.length);
}

/** Market keys, in MARKETS order, that are both selected and carry a note. */
export function selectedMarketNotes(item) {
  const notes = item.market;
  if (!notes) return [];
  const sel = state.markets || [];
  return MARKET_KEYS.filter(k => sel.includes(k) && (notes[k] || '').trim());
}
