import { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA } from './data/index.js';
import { BUSINESS_DATA } from './data/business/index.js';

export { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA };

export const state = {
  // View mode — 'business' (business-process taxonomy, the default starting
  // point of the methodology) | 'system' (MRI PMX) | 'mapping' (matrix).
  viewMode: 'business',
  // Business-view state (independent of the system view)
  businessTab: 'vs-l2c',
  // Business-view filters are multi-select sets; the selection drives what the
  // detail panel shows (markets/verticals) and which areas are in scope (entity).
  markets:   ['UK', 'US', 'EU'],                              // subset of MARKETS
  verticals: ['Retail', 'Industrial', 'Office', 'Residential'], // subset of sectors
  entities:  ['reit', 'pm', 'dev'],                           // subset of ENTITY_TYPES
  // Coverage filter (Value Streams) — multi-select of item coverage tags
  coverageFilters: ['full', 'partial', 'outside', 'untagged'],
  currentTab: 'gl',
  editMode: false,
  addTarget: null,
  openPanelId: null,
  editTargetId: null,
  history: [],
  // Version tracking
  activeVersionId:   'original',
  activeVersionName: 'Original',
  isDirty:           false,
  // Scope filter (System view) — multi-select set of the scope keys to show.
  // All four selected = show everything. Resets on every tab switch.
  scopeFilters: ['core', 'custom', 'out-of-scope', 'untagged'],
  // Per-module visibility. Map of tabId -> boolean. A tab is visible unless
  // explicitly set to false. Persisted as part of each saved version so a
  // client version can show only the modules in that client's scope.
  moduleVisibility: {},
  // Business ⇄ system links: [{ b, s, coverage, note }]. Seeded from
  // SEED_LINKS at boot, editable during discovery, persisted per version.
  links: [],
  // Discovery Baseline flag — when true, the System view shows every untagged
  // item as Untagged (suppresses the auto out-of-scope derivation). Set only
  // while the built-in "Discovery Baseline" version is loaded.
  suppressAutoScope: false,
  // Which processes are expanded to reveal their sub-processes (id -> true).
  // Collapsed by default; a scope filter force-expands so matches stay visible.
  expandedProcs: {},
};

/** A module is visible unless explicitly hidden. */
export function isModuleVisible(tab) {
  return state.moduleVisibility[tab] !== false;
}

export const MAX_HIST = 20;

// Renderer registration — main.js sets this so components can trigger re-renders
let _renderFn = null;
export function registerRender(fn) { _renderFn = fn; }
export function triggerRender() { if (_renderFn) _renderFn(); }

export function currentData() {
  return ALL_DATA[state.currentTab];
}

const deep = o => JSON.parse(JSON.stringify(o));

/* History-change subscriber — main.js registers updateUndoBtn here so that EVERY
   snapshot refreshes the undo affordance. Previously each mutation site had to
   remember to call it, and several (cycleScope, bulkTagColumn) did not, leaving
   the button's label and enabled state stale in the System view. */
let _onHistoryChange = null;
export function registerHistoryChange(fn) { _onHistoryChange = fn; }
function historyChanged() { if (_onHistoryChange) _onHistoryChange(); }

function pushHistory(entry) {
  state.history.push(entry);
  if (state.history.length > MAX_HIST) state.history.shift();
  state.isDirty = true;
  historyChanged();
}

/* Replace a live registry's contents in place. ALL_DATA / BUSINESS_DATA /
   MODULE_CONFIG are imported bindings that other modules hold references to, so
   they must be mutated rather than reassigned. */
function replaceInPlace(target, source) {
  Object.keys(target).forEach(k => { if (!(k in source)) delete target[k]; });
  Object.keys(source).forEach(k => { target[k] = deep(source[k]); });
}

/* Every snapshot carries the link set. Links are shared by both views and the
   System view derives its scope from them (effectiveScope → isConnected), so
   restoring module data without its links would leave scope tags inconsistent
   with the mapping that produced them. */

export function snapshot() {
  // View-aware: capture the active business module when in the Business view,
  // otherwise the active system module. Undo restores to the right view.
  if (state.viewMode === 'business') {
    pushHistory({
      view:  'business',
      tab:   state.businessTab,
      data:  deep(BUSINESS_DATA[state.businessTab]),
      links: deep(state.links || []),
    });
  } else {
    pushHistory({
      view:  'system',
      tab:   state.currentTab,
      data:  deep(ALL_DATA[state.currentTab]),
      links: deep(state.links || []),
    });
  }
}

/** Snapshot for link-only edits (Mapping view, link editor). Restores the link
 *  set without forcing a view switch, since links belong to neither view alone. */
export function snapshotLinks() {
  pushHistory({ view: 'links', links: deep(state.links || []) });
}

/** Single-entry snapshot of the WHOLE dataset — both views, links, module
 *  config and visibility. Used for bulk operations (reset all, version load) so
 *  that one user action costs exactly one undo step rather than one per module. */
export function snapshotAll() {
  pushHistory({
    view:             'all',
    data:             deep(ALL_DATA),
    businessData:     deep(BUSINESS_DATA),
    links:            deep(state.links || []),
    moduleConfig:     deep(MODULE_CONFIG),
    moduleVisibility: { ...state.moduleVisibility },
  });
}

/** Apply a history entry. Deep-copies on the way out so the restored data is not
 *  aliased by anything still holding the entry. */
export function restoreSnapshot(entry) {
  if (entry.links) state.links = deep(entry.links);

  if (entry.view === 'all') {
    replaceInPlace(ALL_DATA,      entry.data);
    replaceInPlace(BUSINESS_DATA, entry.businessData);
    replaceInPlace(MODULE_CONFIG, entry.moduleConfig);
    state.moduleVisibility = { ...entry.moduleVisibility };
  } else if (entry.view === 'business') {
    BUSINESS_DATA[entry.tab] = deep(entry.data);
  } else if (entry.view === 'system') {
    ALL_DATA[entry.tab] = deep(entry.data);
  }
  // 'links' entries carry no module data — the link restore above is the whole job.
}

export function findItem(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) return proc;
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) return sub;
      }
    }
  }
  return null;
}

export function findBreadcrumb(id) {
  for (const col of currentData()) {
    for (const proc of col.processes) {
      if (proc.id === id) return col.title;
      for (const sub of (proc.subs || [])) {
        if (sub.id === id) return `${col.title} › ${proc.title}`;
      }
    }
  }
  return '';
}
