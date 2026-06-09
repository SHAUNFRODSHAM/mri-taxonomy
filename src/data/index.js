import { cm } from './cm.js';
import { gl } from './gl.js';
import { ap } from './ap.js';
import { rm } from './rm.js';
import { jc } from './jc.js';

export const ALL_DATA = { cm, gl, ap, rm, jc };

// Deep-frozen snapshot taken at module-load time, BEFORE any user edits.
// This is the source of truth for "Reset to Original".
export const ORIGINAL_DATA = Object.freeze({
  cm: JSON.parse(JSON.stringify(cm)),
  gl: JSON.parse(JSON.stringify(gl)),
  ap: JSON.parse(JSON.stringify(ap)),
  rm: JSON.parse(JSON.stringify(rm)),
  jc: JSON.parse(JSON.stringify(jc)),
});

export const MODULE_CONFIG = {
  cm: {
    label: 'Commercial Management',
    headerClass: 'cm-header',
    headerText: 'Commercial Management',
    colHeaderClass: '',
    icon: '🏢',
  },
  gl: {
    label: 'General Ledger',
    headerClass: 'gl-header',
    headerText: 'General Ledger',
    colHeaderClass: '',
    icon: '📒',
  },
  ap: {
    label: 'Accounts Payable',
    headerClass: 'ap-header',
    headerText: 'Accounts Payable',
    colHeaderClass: 'ap-header-col',
    icon: '📤',
  },
  rm: {
    label: 'Residential Management',
    headerClass: 'rm-header',
    headerText: 'Residential Management',
    colHeaderClass: '',
    icon: '🏠',
  },
  jc: {
    label: 'Job Cost',
    headerClass: 'jc-header',
    headerText: 'Job Cost',
    colHeaderClass: '',
    icon: '🏗️',
  },
};
