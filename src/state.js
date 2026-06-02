import { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA } from './data/index.js';

export { ALL_DATA, MODULE_CONFIG, ORIGINAL_DATA };

export const state = {
  currentTab: 'cm',
  editMode: false,
  addTarget: null,
  openPanelId: null,
  editTargetId: null,
  history: [],
  // Version tracking
  activeVersionId:   'original',
  activeVersionName: 'Original',
  isDirty:           false,
};

export const MAX_HIST = 20;

// Renderer registration — main.js sets this so components can trigger re-renders
let _renderFn = null;
export function registerRender(fn) { _renderFn = fn; }
export function triggerRender() { if (_renderFn) _renderFn(); }

export function currentData() {
  return ALL_DATA[state.currentTab];
}

export function snapshot() {
  state.history.push({
    tab: state.currentTab,
    data: JSON.parse(JSON.stringify(ALL_DATA[state.currentTab])),
  });
  if (state.history.length > MAX_HIST) state.history.shift();
  state.isDirty = true;
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
