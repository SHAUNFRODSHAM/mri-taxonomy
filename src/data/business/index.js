/* ═══════════════════════════════════════════════════════════════════════════
   business/index.js — Business-process taxonomy (the "what/why" view)

   Seeded from the GL/AP/AR business-process prototype. Same column → process →
   sub shape as the system (MRI PMX) taxonomy, but leaves carry business
   dimensions instead of MRI screens:
     desc, activities[], market{US,UK,EU}, vertical{Retail,Industrial,Office,
     Residential}, standards[]

   IDs are assigned deterministically here so the business↔system link registry
   (../links.js) can reference stable identifiers. Pattern:
     column   →  b<mod>-<domainId>            e.g. bgl-setup
     process  →  b<mod>-<domainId>-p<n>        e.g. bgl-setup-p1
     sub      →  b<mod>-<domainId>-<rawId>     e.g. bgl-setup-es1
   ═══════════════════════════════════════════════════════════════════════════ */

import { MODULE_DATA } from './raw.js';
import { EXTENDED_AREAS, CATEGORIES, ENTITY_TYPES } from './extended.js';

export { ENTITY_TYPES };

// Prototype module key → our internal business-module key
const MOD_KEYS = { GL: 'bgl', AP: 'bap', AR: 'bar' };

function normalise() {
  const out = {};
  Object.entries(MODULE_DATA).forEach(([protoKey, domains]) => {
    const mod = MOD_KEYS[protoKey];
    out[mod] = (domains || []).map(domain => ({
      id: `${mod}-${domain.id}`,
      title: domain.title,
      processes: (domain.processes || []).map((proc, pi) => ({
        id: `${mod}-${domain.id}-p${pi + 1}`,
        title: proc.title,
        type: 'process',
        desc: proc.desc || '',
        activities: proc.activities || [],
        subs: (proc.subs || []).map((sub, si) => ({
          id: `${mod}-${domain.id}-${sub.id || 's' + (si + 1)}`,
          title: sub.title,
          desc: sub.desc || '',
          activities: sub.activities || [],
          market: sub.market || null,
          vertical: sub.vertical || null,
          standards: sub.standards || [],
        })),
      })),
    }));
  });
  return out;
}

export const BUSINESS_DATA = normalise();

export const BUSINESS_CONFIG = {
  bgl: { label: 'General Ledger',      icon: '📒', headerClass: 'bgl-header', color: '#2d4a0a', category: 'Core Financial', entities: { reit: 'core', pm: 'core', dev: 'core' } },
  bap: { label: 'Accounts Payable',    icon: '📤', headerClass: 'bap-header', color: '#1a3f6a', category: 'Core Financial', entities: { reit: 'core', pm: 'core', dev: 'core' } },
  bar: { label: 'Accounts Receivable — Tenant', icon: '📥', headerClass: 'bar-header', color: '#5a3a1a', category: 'Core Financial', entities: { reit: 'core', pm: 'core', dev: 'conditional' } },
};

// ── Merge the expanded CRE areas (from extended.js) ──────────────────────────
// Each area → a business module (tab) with one column whose processes are the
// doc bullets, flagged needsEnrichment until Market/Vertical/Standards are added.
EXTENDED_AREAS.forEach((area, ai) => {
  BUSINESS_DATA[area.id] = [{
    id: `${area.id}-main`,
    title: area.label,
    processes: area.bullets.map((b, i) => ({
      id: `${area.id}-p${i + 1}`,
      title: b,
      type: 'process',
      desc: '',
      activities: [],
      market: null,
      vertical: null,
      standards: [],
      needsEnrichment: true,
    })),
  }];
  BUSINESS_CONFIG[area.id] = {
    label: area.label,
    icon: area.icon,
    headerClass: `bx-header-${ai}`,           // dynamic per-area class (see injected styles)
    color: (CATEGORIES[area.category] || {}).color || '#444',
    category: area.category,
    entities: area.entities,
  };
});

// Deep-frozen factory baseline (mirrors ORIGINAL_DATA for the system view) — the
// source of truth for "Reset" and for the Original version of the business view.
// Taken AFTER the extended areas are merged so they reset/version correctly.
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
