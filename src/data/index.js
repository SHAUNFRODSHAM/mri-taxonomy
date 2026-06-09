import { cm } from './cm.js';
import { gl } from './gl.js';
import { ap } from './ap.js';
import { rm } from './rm.js';
import { jc } from './jc.js';
import { car } from './car.js';

export const ALL_DATA = { cm, gl, ap, rm, jc, car };

// Deep-frozen snapshot taken at module-load time, BEFORE any user edits.
// This is the source of truth for "Reset to Original".
export const ORIGINAL_DATA = Object.freeze({
  cm: JSON.parse(JSON.stringify(cm)),
  gl: JSON.parse(JSON.stringify(gl)),
  ap: JSON.parse(JSON.stringify(ap)),
  rm: JSON.parse(JSON.stringify(rm)),
  jc: JSON.parse(JSON.stringify(jc)),
  car: JSON.parse(JSON.stringify(car)),
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
  // ⚠️ PLACEHOLDER MODULE — content requires review before client use
  jc: {
    label: 'Job Cost',
    headerClass: 'jc-header',
    headerText: 'Job Cost ⚠️ Placeholder Content',
    colHeaderClass: '',
    icon: '🏗️',
  },
  // ⚠️ PLACEHOLDER MODULE — content requires review before client use
  car: {
    label: 'Corporate Accounts Receivable',
    headerClass: 'car-header',
    headerText: 'Corporate Accounts Receivable ⚠️ Placeholder Content',
    colHeaderClass: 'car-header-col',
    icon: '📥',
  },
};
