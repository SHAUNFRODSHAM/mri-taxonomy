/* ═══════════════════════════════════════════════════════════════════════════
   diff.js — pure version-comparison engine (no DOM).

   Compares two version snapshots (as stored by versions.js, or the synthetic
   'original' / 'discovery' baselines built by main.js) and produces a flat
   list of change records: one per added/removed/modified column, process,
   sub-process or business↔system link. Flat, not a tree, so the compare UI
   can navigate "next/previous change" with a plain array index and doesn't
   need to reconstruct nesting to render a side-by-side diff.

   Granularity rules (deliberately not fully recursive, to avoid noise):
   - A column added/removed → ONE record summarising its process count.
   - A column present in both → title diff (if renamed) + recurse into its
     processes.
   - A process/sub added/removed → ONE record with its full field snapshot.
   - A process/sub present in both → field-level diff; processes also recurse
     into their subs.
   ═══════════════════════════════════════════════════════════════════════════ */

import { MODULE_CONFIG as LIVE_MODULE_CONFIG, ORIGINAL_DATA } from './index.js';
import { BUSINESS_CONFIG as LIVE_BUSINESS_CONFIG, BUSINESS_ORIGINAL } from './business/index.js';

const BUILTIN_MODULE_KEYS = new Set(Object.keys(ORIGINAL_DATA));

// ── Field extractors ─────────────────────────────────────────────────────────
// Each returns a comparable string; `isList` just affects rendering (line
// breaks vs inline), not the comparison itself (string equality either way).

const COLUMN_FIELDS = [
  { key: 'title', label: 'Column Title', get: c => c.title || '' },
];

const SYSTEM_ITEM_FIELDS = [
  { key: 'title', label: 'Title', get: it => it.title || '' },
  { key: 'desc', label: 'Description', get: it => it.desc || '' },
  { key: 'activities', label: 'Activities', get: it => (it.activities || []).join('\n'), isList: true },
  { key: 'mri_title', label: 'MRI Title', get: it => it.mri_title || '' },
  { key: 'mri_prereqs', label: 'MRI Prerequisites', get: it => (it.mri_prereqs || []).join('\n'), isList: true },
  { key: 'mri_assoc', label: 'Associated Screens', get: it => (it.mri_assoc || []).map(a => `${a.name} — ${a.desc}`).join('\n'), isList: true },
  { key: 'scope', label: 'Scope Tag', get: it => it.scope || 'Untagged' },
  { key: 'clientNote', label: 'Client Note', get: it => it.clientNote || '' },
];

const BUSINESS_ITEM_FIELDS = [
  { key: 'title', label: 'Title', get: it => it.title || '' },
  { key: 'desc', label: 'Description', get: it => it.desc || '' },
  { key: 'activities', label: 'Activities', get: it => (it.activities || []).join('\n'), isList: true },
  { key: 'market', label: 'Market Variation', get: it => it.market ? Object.entries(it.market).map(([k, v]) => `${k}: ${v}`).join('\n') : '', isList: true },
  { key: 'vertical', label: 'Vertical Detail', get: it => it.vertical ? Object.entries(it.vertical).map(([k, v]) => `${k}: ${v}`).join('\n') : '', isList: true },
  { key: 'standards', label: 'Standards & Frameworks', get: it => (it.standards || []).join(', ') },
  { key: 'coverage', label: 'Coverage Tag', get: it => it.coverage || 'Untagged' },
  { key: 'clientNote', label: 'Client Note', get: it => it.clientNote || '' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function byId(arr) {
  const m = new Map();
  (arr || []).forEach(it => m.set(it.id, it));
  return m;
}

/** Full field snapshot for an added/removed item (every field, whichever side exists). */
function snapshotFields(item, fieldDefs) {
  return fieldDefs.map(f => ({ key: f.key, label: f.label, isList: f.isList, value: f.get(item) }));
}

/** Fields that differ between two existing-on-both-sides items. */
function diffFields(itemA, itemB, fieldDefs) {
  const out = [];
  fieldDefs.forEach(f => {
    const a = f.get(itemA);
    const b = f.get(itemB);
    if (a !== b) out.push({ key: f.key, label: f.label, isList: f.isList, a, b });
  });
  return out;
}

function moduleLabelFor(version, moduleKey) {
  if (BUILTIN_MODULE_KEYS.has(moduleKey)) return LIVE_MODULE_CONFIG[moduleKey]?.label || moduleKey;
  const custom = (version.customModules || []).find(m => m.id === moduleKey);
  return custom?.config?.label || moduleKey;
}

function businessLabelFor(vsKey) {
  return LIVE_BUSINESS_CONFIG[vsKey]?.label || vsKey;
}

let recordSeq = 0;
function nextRecordId() { return 'chg' + (recordSeq++); }

// ── Core recursive diff (columns → processes → subs) ─────────────────────────

function diffColumns(colsA, colsB, itemFields, scope, moduleKey, moduleLabel, out) {
  const mapA = byId(colsA);
  const mapB = byId(colsB);
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);

  ids.forEach(id => {
    const a = mapA.get(id);
    const b = mapB.get(id);

    if (a && !b) {
      out.push({
        id: nextRecordId(), scope, level: 'column', status: 'removed',
        moduleKey, moduleLabel, breadcrumb: moduleLabel, title: a.title,
        fields: [{ key: 'summary', label: 'Contents', a: `${(a.processes || []).length} process(es)`, b: '' }],
      });
      return;
    }
    if (!a && b) {
      out.push({
        id: nextRecordId(), scope, level: 'column', status: 'added',
        moduleKey, moduleLabel, breadcrumb: moduleLabel, title: b.title,
        fields: [{ key: 'summary', label: 'Contents', a: '', b: `${(b.processes || []).length} process(es)` }],
      });
      return;
    }

    // Present in both — title diff, then recurse into processes.
    const fieldDiffs = diffFields(a, b, COLUMN_FIELDS);
    if (fieldDiffs.length) {
      out.push({
        id: nextRecordId(), scope, level: 'column', status: 'modified',
        moduleKey, moduleLabel, breadcrumb: moduleLabel, title: b.title, fields: fieldDiffs,
      });
    }
    diffProcesses(a.processes || [], b.processes || [], itemFields, scope, moduleKey, moduleLabel, b.title, out);
  });
}

function diffProcesses(procsA, procsB, itemFields, scope, moduleKey, moduleLabel, colTitle, out) {
  const mapA = byId(procsA);
  const mapB = byId(procsB);
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);

  ids.forEach(id => {
    const a = mapA.get(id);
    const b = mapB.get(id);
    const breadcrumb = colTitle;

    if (a && !b) {
      out.push({
        id: nextRecordId(), scope, level: 'process', status: 'removed',
        moduleKey, moduleLabel, breadcrumb, title: a.title, fields: snapshotFields(a, itemFields),
      });
      return;
    }
    if (!a && b) {
      out.push({
        id: nextRecordId(), scope, level: 'process', status: 'added',
        moduleKey, moduleLabel, breadcrumb, title: b.title, fields: snapshotFields(b, itemFields),
      });
      return;
    }

    const fieldDiffs = diffFields(a, b, itemFields);
    if (fieldDiffs.length) {
      out.push({
        id: nextRecordId(), scope, level: 'process', status: 'modified',
        moduleKey, moduleLabel, breadcrumb, title: b.title, fields: fieldDiffs,
      });
    }
    diffSubs(a.subs || [], b.subs || [], itemFields, scope, moduleKey, moduleLabel, `${colTitle} › ${b.title}`, out);
  });
}

function diffSubs(subsA, subsB, itemFields, scope, moduleKey, moduleLabel, breadcrumb, out) {
  const mapA = byId(subsA);
  const mapB = byId(subsB);
  const ids = new Set([...mapA.keys(), ...mapB.keys()]);

  ids.forEach(id => {
    const a = mapA.get(id);
    const b = mapB.get(id);

    if (a && !b) {
      out.push({
        id: nextRecordId(), scope, level: 'sub', status: 'removed',
        moduleKey, moduleLabel, breadcrumb, title: a.title, fields: snapshotFields(a, itemFields),
      });
      return;
    }
    if (!a && b) {
      out.push({
        id: nextRecordId(), scope, level: 'sub', status: 'added',
        moduleKey, moduleLabel, breadcrumb, title: b.title, fields: snapshotFields(b, itemFields),
      });
      return;
    }

    const fieldDiffs = diffFields(a, b, itemFields);
    if (fieldDiffs.length) {
      out.push({
        id: nextRecordId(), scope, level: 'sub', status: 'modified',
        moduleKey, moduleLabel, breadcrumb, title: b.title, fields: fieldDiffs,
      });
    }
  });
}

// ── Item index (for resolving link endpoint titles) ──────────────────────────

function indexTree(dataShape, labelFor) {
  const idx = new Map();
  Object.keys(dataShape || {}).forEach(modKey => {
    const label = labelFor(modKey);
    (dataShape[modKey] || []).forEach(col => {
      (col.processes || []).forEach(proc => {
        idx.set(proc.id, { title: proc.title, breadcrumb: col.title, moduleLabel: label });
        (proc.subs || []).forEach(sub => {
          idx.set(sub.id, { title: sub.title, breadcrumb: `${col.title} › ${proc.title}`, moduleLabel: label });
        });
      });
    });
  });
  return idx;
}

// ── Link diff ─────────────────────────────────────────────────────────────────

function diffLinks(versionA, versionB, out) {
  const linksA = versionA.links || [];
  const linksB = versionB.links || [];

  const bIndexA = indexTree(versionA.businessData || {}, businessLabelFor);
  const bIndexB = indexTree(versionB.businessData || {}, businessLabelFor);
  const sIndexA = indexTree(versionA.data || {}, k => moduleLabelFor(versionA, k));
  const sIndexB = indexTree(versionB.data || {}, k => moduleLabelFor(versionB, k));

  const keyOf = l => `${l.b}||${l.s}`;
  const mapA = new Map(linksA.map(l => [keyOf(l), l]));
  const mapB = new Map(linksB.map(l => [keyOf(l), l]));
  const keys = new Set([...mapA.keys(), ...mapB.keys()]);

  function resolve(id, idxB, idxA) {
    return idxB.get(id) || idxA.get(id) || { title: id, breadcrumb: '', moduleLabel: '' };
  }

  keys.forEach(key => {
    const a = mapA.get(key);
    const b = mapB.get(key);
    if (!a && !b) return;
    const ref = b || a;
    const bizInfo = resolve(ref.b, bIndexB, bIndexA);
    const sysInfo = resolve(ref.s, sIndexB, sIndexA);
    const title = `${bizInfo.title} ⇄ ${sysInfo.title}`;
    const breadcrumb = `${bizInfo.moduleLabel} › ${sysInfo.moduleLabel}`;

    if (a && !b) {
      out.push({
        id: nextRecordId(), scope: 'link', level: 'link', status: 'removed',
        moduleKey: 'links', moduleLabel: 'Business ⇄ System Links', breadcrumb, title,
        fields: [{ key: 'coverage', label: 'Coverage', a: a.coverage || 'full', b: '' },
                 { key: 'note', label: 'Note', a: a.note || '', b: '' }],
      });
      return;
    }
    if (!a && b) {
      out.push({
        id: nextRecordId(), scope: 'link', level: 'link', status: 'added',
        moduleKey: 'links', moduleLabel: 'Business ⇄ System Links', breadcrumb, title,
        fields: [{ key: 'coverage', label: 'Coverage', a: '', b: b.coverage || 'full' },
                 { key: 'note', label: 'Note', a: '', b: b.note || '' }],
      });
      return;
    }
    const fieldDiffs = [];
    if ((a.coverage || 'full') !== (b.coverage || 'full')) {
      fieldDiffs.push({ key: 'coverage', label: 'Coverage', a: a.coverage || 'full', b: b.coverage || 'full' });
    }
    if ((a.note || '') !== (b.note || '')) {
      fieldDiffs.push({ key: 'note', label: 'Note', a: a.note || '', b: b.note || '' });
    }
    if (fieldDiffs.length) {
      out.push({
        id: nextRecordId(), scope: 'link', level: 'link', status: 'modified',
        moduleKey: 'links', moduleLabel: 'Business ⇄ System Links', breadcrumb, title, fields: fieldDiffs,
      });
    }
  });
}

// ── Module visibility diff ────────────────────────────────────────────────────

function diffModuleVisibility(versionA, versionB, out) {
  const visA = versionA.moduleVisibility || {};
  const visB = versionB.moduleVisibility || {};
  const allSystemKeys = new Set([
    ...Object.keys(versionA.data || {}), ...Object.keys(versionB.data || {}),
  ]);
  allSystemKeys.forEach(key => {
    const a = visA[key] !== false; // visible unless explicitly false
    const b = visB[key] !== false;
    if (a !== b) {
      out.push({
        id: nextRecordId(), scope: 'system', level: 'module-visibility', status: 'modified',
        moduleKey: key, moduleLabel: moduleLabelFor(versionB, key), breadcrumb: 'Module Visibility',
        title: moduleLabelFor(versionB, key),
        fields: [{ key: 'visible', label: 'Visible', a: a ? 'Shown' : 'Hidden', b: b ? 'Shown' : 'Hidden' }],
      });
    }
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compare two version-shaped objects: { data, businessData, links,
 * moduleVisibility, customModules }. Both 'original' and 'discovery'
 * baselines can be passed in this shape too (see resolveComparable() in
 * compareView.js) alongside real saved versions from versions.js.
 *
 * @returns {Array} flat list of change records, most-relevant-first
 *   (added/removed before modified, then grouped by module).
 */
export function diffVersions(versionA, versionB) {
  recordSeq = 0;
  const out = [];

  const sysKeys = new Set([...Object.keys(versionA.data || {}), ...Object.keys(versionB.data || {})]);
  sysKeys.forEach(modKey => {
    const label = moduleLabelFor(versionB.data?.[modKey] ? versionB : versionA, modKey);
    diffColumns(versionA.data?.[modKey] || [], versionB.data?.[modKey] || [], SYSTEM_ITEM_FIELDS, 'system', modKey, label, out);
  });

  const bizKeys = new Set([...Object.keys(versionA.businessData || {}), ...Object.keys(versionB.businessData || {})]);
  bizKeys.forEach(vsKey => {
    const label = businessLabelFor(vsKey);
    diffColumns(versionA.businessData?.[vsKey] || [], versionB.businessData?.[vsKey] || [], BUSINESS_ITEM_FIELDS, 'business', vsKey, label, out);
  });

  diffLinks(versionA, versionB, out);
  diffModuleVisibility(versionA, versionB, out);

  const statusOrder = { added: 0, removed: 0, modified: 1 };
  out.sort((r1, r2) => {
    const s = (statusOrder[r1.status] ?? 2) - (statusOrder[r2.status] ?? 2);
    if (s !== 0) return s;
    return (r1.moduleLabel || '').localeCompare(r2.moduleLabel || '');
  });

  return out;
}

/** Quick summary counts for a diff result, used in headers/badges. */
export function summarizeDiff(records) {
  return records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { added: 0, removed: 0, modified: 0, total: 0 });
}
