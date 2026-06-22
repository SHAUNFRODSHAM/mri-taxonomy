/* ═══════════════════════════════════════════════════════════════════════════
   business/index.js — Business-process taxonomy (the "what/why" view)

   The Business view is now organised as CRE Powered Value Streams (see
   valueStreams.js):
     Level 1 = value stream  → business tab    (e.g. vs-l2c "Lease to Cash")
     Level 2 = process group → column          (e.g. "Recoveries / CAM")
     Level 3 = process       → card            (e.g. "CAM reconciliation")

   L3 cards start lightweight (title only, needsEnrichment) so they can be
   enriched with Market / Vertical / Standards detail and linked to system
   (MRI PMX) processes during discovery.

   The earlier functional taxonomy (raw.js GL/AP/AR + extended.js CRE areas) is
   retained in the repo for reference but no longer loaded.

   IDs (stable, for the link registry in ../links.js):
     column   →  <vsId>-g<n>            e.g. vs-l2c-g4
     card     →  <vsId>-g<n>-p<m>       e.g. vs-l2c-g4-p3
   ═══════════════════════════════════════════════════════════════════════════ */

import { VALUE_STREAMS, STREAM_TAGS } from './valueStreams.js';

export { STREAM_TAGS };

export const BUSINESS_DATA = {};
export const BUSINESS_CONFIG = {};

VALUE_STREAMS.forEach(vs => {
  BUSINESS_DATA[vs.id] = vs.groups.map((g, gi) => ({
    id: `${vs.id}-g${gi + 1}`,
    title: g.title,
    processes: g.items.map((item, ii) => ({
      id: `${vs.id}-g${gi + 1}-p${ii + 1}`,
      title: item,
      type: 'process',
      desc: '',
      activities: [],
      market: null,
      vertical: null,
      standards: [],
      needsEnrichment: true,
    })),
  }));
  BUSINESS_CONFIG[vs.id] = {
    label: vs.label,
    icon: vs.icon,
    color: vs.color,
    tag: vs.tag,            // 'official' | 'overlay'
    note: vs.note,
    supporting: !!vs.supporting,
  };
});

// Deep-frozen factory baseline — source of truth for Reset and the Original
// version of the business view.
export const BUSINESS_ORIGINAL = Object.freeze(JSON.parse(JSON.stringify(BUSINESS_DATA)));

export const BUSINESS_MODULES = Object.keys(BUSINESS_DATA);

// Market + vertical dimension definitions for the business-view filters.
export const MARKETS   = [
  { key: 'UK', label: '🇬🇧 United Kingdom' },
  { key: 'US', label: '🇺🇸 United States' },
  { key: 'EU', label: '🇪🇺 Pan-European' },
];
export const VERTICALS = ['All', 'Retail', 'Industrial', 'Office', 'Residential'];

/** Find a business item (process or sub) by id, plus its breadcrumb. */
export function findBusinessItem(id) {
  for (const mod of BUSINESS_MODULES) {
    for (const col of BUSINESS_DATA[mod]) {
      for (const proc of col.processes) {
        if (proc.id === id) return { item: proc, module: mod, breadcrumb: col.title, isProcess: true };
        for (const sub of (proc.subs || [])) {
          if (sub.id === id) return { item: sub, module: mod, breadcrumb: `${col.title} › ${proc.title}`, isProcess: false };
        }
      }
    }
  }
  return null;
}
