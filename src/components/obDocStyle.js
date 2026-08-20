/* ═══════════════════════════════════════════════════════════════════════════
   obDocStyle.js — the Open Box official document house style.

   Every value here was extracted from the Open Box "Functional Specification"
   Word template (styles.xml / numbering.xml / headerN.xml), so this module is
   the single source of truth for branded output. Do not invent values — if
   something is missing, read it out of the template rather than guessing.

   ── ONE SPEC, THREE OUTPUTS ────────────────────────────────────────────────
   SPEC below is canonical and expressed in POINTS. Everything else is derived
   from it, so the Word document, the on-screen preview and the PDF cannot drift
   apart:

     SPEC ──┬─→ documentStyles / numberingConfig ──→ .docx  (docxExport.js)
            └─→ houseStyleCSS()                  ──→ preview + PDF (genModal.js)

   If you change a value, change it HERE ONLY. Adding a new element? Add it to
   SPEC and render it in both documentStyles and houseStyleCSS(), or the three
   outputs will disagree.

   UNITS (docx-js is inconsistent, hence the helpers):
     TextRun.size        → half-points          hp(9)  = 9pt
     Paragraph spacing   → twips (1/20 pt)      tw(6)  = 6pt
     Indents / margins   → twips (1440 = 1in)
     Border size         → eighths of a point   sz 4   = 0.5pt
     Images              → PIXELS (docx-js multiplies by 9525 internally)

   ── HOUSE STYLE REFERENCE ──────────────────────────────────────────────────
   Page      A4 (11900 × 16820 tw), 1in margins, header 510 tw, footer 220 tw,
             different first page (titlePg).
   Body      Verdana 9pt, #000, spacing after 6pt, line 278 (≈1.158).
   H1        Verdana 12pt bold ALL CAPS, slate #6E7878, after 12pt, numbered "1."
   H2        Verdana 10pt bold ALL CAPS, black, before 14pt / after 5pt, "1.1"
   H3/H4     Verdana 10pt bold, black, before 12pt / after 5pt, "1.1.1"
   Headings  all keepNext, all share ONE multilevel numbering list.
   Cover     Document title 26pt slate with a 1.5pt green bottom rule, then
             date, client name (14pt slate), project name (14pt slate).
   Tables    100% width, all borders 0.5pt slate #6E7878, cells vertically
             centred, 1.4pt top/bottom cell padding. Header row filled Open Box
             green #BCD727 with WHITE, NON-BOLD 9pt text. No zebra banding.
   Captions  "Table N: …" / "Figure N: …", italic grey #999999, ABOVE the table.
   Bullets   Symbol "•" at indent 907 tw hanging 340 tw; nested "o" then "▪".
   Footer    slate #6E7878, "Page X of Y" plus document metadata.
   Header    page 1 = full-bleed cover frame; later pages = logo top-right.
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  AlignmentType, BorderStyle, LevelFormat, ShadingType, TabStopType,
} from 'docx';

// ── Brand palette ─────────────────────────────────────────────────────────────
export const OB = {
  green:    'BCD727',  // Open Box green — header rows, accent rules
  slate:    '6E7878',  // themeColor text2 — H1, footers, table borders
  black:    '000000',  // H2-H5 and body copy
  caption:  '999999',  // caption text
  muted:    '595959',  // subtitle-level muted text
  white:    'FFFFFF',
};

export const FONT = 'Verdana';

// ── Unit helpers ──────────────────────────────────────────────────────────────
export const hp = n => Math.round(n * 2);     // pt  → half-points (font size)
export const tw = n => Math.round(n * 20);    // pt  → twips      (spacing)
export const inch = n => Math.round(n * 1440);// in  → twips      (indent/margin)
/* Images: docx-js `transformation` takes PIXELS and converts to EMU internally
   (×9525). Passing EMU here silently produces a ~9525× oversized extent, which
   Word refuses to open. */
export const px = n => Math.round(n * 96);    // in  → px         (images)

// ═══ CANONICAL SPEC — all sizes in points, all colours bare hex ═══════════════
export const SPEC = {
  font: FONT,
  /* `line` is the template's raw Word line-spacing value in twentieths of a
     line, where 240 = single. 278 ≈ 1.158 — do NOT round it to 1.15, which
     would emit 276 and no longer match the template. CSS line-height is
     derived as line/240. */
  body:    { size: 9,  color: OB.black,   after: 6,  line: 278 },
  h1:      { size: 12, color: OB.slate,   bold: true, caps: true,  after: 12 },
  h2:      { size: 10, color: OB.black,   bold: true, caps: true,  before: 14, after: 5 },
  h3:      { size: 10, color: OB.black,   bold: true, caps: false, before: 12, after: 5 },
  h4:      { size: 10, color: OB.black,   bold: true, caps: false, before: 12, after: 5 },
  h5:      { size: 10, color: OB.black,   bold: true, caps: false, before: 12, after: 5 },
  title:   { size: 26, color: OB.slate,   ruleColor: OB.green, ruleWidth: 1.5, after: 4 },
  client:  { size: 14, color: OB.slate,   after: 5 },
  project: { size: 14, color: OB.slate,   after: 5 },
  date:    { size: 9,  color: OB.slate,   before: 12, after: 6 },
  caption: { size: 9,  color: OB.caption, italic: true, before: 3, after: 2 },
  label:   { size: 9,  color: OB.slate,   bold: true, before: 7, after: 3 },
  bullet:  { size: 9,  color: OB.black,   after: 5, indent: 907, hanging: 340 },
  table: {
    size: 9,
    headerFill:  OB.green,
    headerColor: OB.white,
    headerBold:  false,          // the template explicitly sets w:b val=0
    borderColor: OB.slate,
    borderPt:    0.5,
    cellPadV:    1.4,
    cellPadH:    5,
    banding:     false,          // no zebra striping
  },
  footer: { size: 9, color: OB.slate },
};

// ── Page geometry (A4, 1in margins) ───────────────────────────────────────────
export const PAGE = {
  width:  11900,
  height: 16820,
  margin: inch(1),
  header: 510,
  footer: 220,
};

/** Usable text width — every table must fit inside this. */
export const BODY_W = PAGE.width - PAGE.margin * 2;   // 9020 tw

// ── Numbering reference names ─────────────────────────────────────────────────
export const NUM = {
  headings: 'ob-headings',   // multilevel 1. / 1.1 / 1.1.1 / 1.1.1.1
  bullets:  'ob-bullets',    // • / o / ▪
};

/** Multilevel heading numbering + the Open Box bullet ladder. */
export const numberingConfig = [
  {
    reference: NUM.headings,
    levels: [0, 1, 2, 3, 4].map(i => ({
      level: i,
      format: LevelFormat.DECIMAL,
      // lvl0 is "1." with a trailing dot; deeper levels omit it, per the template
      text: i === 0 ? '%1.' : Array.from({ length: i + 1 }, (_, k) => `%${k + 1}`).join('.'),
      alignment: AlignmentType.LEFT,
      style: {
        paragraph: {
          // Template indents: 567 for lvl0-1, 794 for lvl2, 992 for lvl3+
          indent: (() => {
            const v = i <= 1 ? 567 : i === 2 ? 794 : 992;
            return { left: v, hanging: v };
          })(),
        },
      },
    })),
  },
  {
    reference: NUM.bullets,
    levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: SPEC.bullet.indent, hanging: SPEC.bullet.hanging } },
                 run: { font: 'Symbol' } } },
      { level: 1, format: LevelFormat.BULLET, text: 'o', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1247, hanging: 340 } },
                 run: { font: 'Courier New' } } },
      { level: 2, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1587, hanging: 340 } },
                 run: { font: 'Wingdings' } } },
    ],
  },
];

// ── Derived: docx document styles ─────────────────────────────────────────────

const headingStyle = s => ({
  run: {
    font: SPEC.font, size: hp(s.size), bold: s.bold, allCaps: s.caps, color: s.color,
  },
  paragraph: {
    spacing: { ...(s.before ? { before: tw(s.before) } : {}), after: tw(s.after) },
    keepNext: true,
  },
});

export const documentStyles = {
  default: {
    document: {
      run:       { font: SPEC.font, size: hp(SPEC.body.size), color: SPEC.body.color },
      paragraph: {
        spacing: {
          after: tw(SPEC.body.after),
          line: SPEC.body.line,
          lineRule: 'auto',
        },
      },
    },
    heading1: headingStyle(SPEC.h1),
    heading2: headingStyle(SPEC.h2),
    heading3: headingStyle(SPEC.h3),
    heading4: headingStyle(SPEC.h4),
    heading5: headingStyle(SPEC.h5),
  },
  paragraphStyles: [
    {
      id: 'OBDocumentTitle',
      name: 'OB Document Title',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: SPEC.font, size: hp(SPEC.title.size), color: SPEC.title.color },
      paragraph: {
        spacing: { after: tw(SPEC.title.after), line: 240, lineRule: 'auto' },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: Math.round(SPEC.title.ruleWidth * 8),   // pt → eighths
            space: 1,
            color: SPEC.title.ruleColor,
          },
        },
      },
    },
    {
      id: 'OBClientName',
      name: 'OB Client Name',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: SPEC.font, size: hp(SPEC.client.size), color: SPEC.client.color },
      paragraph: { spacing: { after: tw(SPEC.client.after) } },
    },
    {
      id: 'OBProjectName',
      name: 'OB Project Name',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: SPEC.font, size: hp(SPEC.project.size), color: SPEC.project.color },
      paragraph: { spacing: { after: tw(SPEC.project.after) } },
    },
    {
      id: 'OBDate',
      name: 'OB Date',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: SPEC.font, size: hp(SPEC.date.size), color: SPEC.date.color },
      paragraph: { spacing: { before: tw(SPEC.date.before), after: tw(SPEC.date.after) } },
    },
    {
      id: 'OBCaption',
      name: 'OB Caption',
      basedOn: 'Normal',
      next: 'Normal',
      run: {
        font: SPEC.font, size: hp(SPEC.caption.size),
        italics: SPEC.caption.italic, color: SPEC.caption.color,
      },
      paragraph: {
        spacing: { before: tw(SPEC.caption.before), after: tw(SPEC.caption.after) },
        keepNext: true,
      },
    },
  ],
};

// ── Derived: docx table building blocks ───────────────────────────────────────

/** All-round 0.5pt slate borders, per the OBTable style. */
export const tableBorders = (() => {
  const e = {
    style: BorderStyle.SINGLE,
    size: Math.round(SPEC.table.borderPt * 8),
    color: SPEC.table.borderColor,
  };
  return { top: e, bottom: e, left: e, right: e, insideHorizontal: e, insideVertical: e };
})();

export const cellMargins = {
  top:    tw(SPEC.table.cellPadV),
  bottom: tw(SPEC.table.cellPadV),
  left:   tw(SPEC.table.cellPadH),
  right:  tw(SPEC.table.cellPadH),
};

export const headerShading = {
  type: ShadingType.CLEAR, color: 'auto', fill: SPEC.table.headerFill,
};

export const headerRunProps = {
  font: SPEC.font, size: hp(SPEC.table.size),
  bold: SPEC.table.headerBold, color: SPEC.table.headerColor,
};

export const bodyRunProps = {
  font: SPEC.font, size: hp(SPEC.table.size), color: SPEC.body.color,
};

export const cellParaSpacing = {
  before: tw(3), after: tw(3), line: 240, lineRule: 'auto',
};

export const footerTabs = [{ type: TabStopType.RIGHT, position: BODY_W }];

// ── Derived: CSS for the preview and the PDF ──────────────────────────────────

const c = hex => `#${hex}`;
/* Word stores line spacing in twentieths of a line (240 = single); CSS wants a
   plain multiplier. Derive it so both come from the one SPEC value. */
const lineHeight = () => (SPEC.body.line / 240).toFixed(3);

/**
 * Emit the house style as CSS, derived from the same SPEC that drives the .docx.
 * Used by both the Generate Preview pane and the PDF export so all three
 * outputs render identically.
 *
 * Heading numbers are reproduced with CSS counters to match the Word document's
 * automatic 1. / 1.1 / 1.1.1 numbering.
 *
 * @param scope  CSS selector to scope the rules to (e.g. '.doc-out')
 * @param opts.print  include page-break and colour-exact rules for the PDF
 */
export function houseStyleCSS(scope = '.doc-out', { print = false } = {}) {
  const S = SPEC;
  const h = (sel, s, extra = '') => `
${scope} ${sel}{font-family:${S.font},sans-serif;font-size:${s.size}pt;
  font-weight:${s.bold ? 700 : 400};color:${c(s.color)};
  ${s.caps ? 'text-transform:uppercase;' : ''}
  margin:${s.before || 0}pt 0 ${s.after}pt;${extra}}`;

  return `
${scope}{font-family:${S.font},sans-serif;font-size:${S.body.size}pt;
  color:${c(S.body.color)};line-height:${lineHeight()};
  counter-reset:obh1 obh2 obh3 obh4;}

/* Body copy */
${scope} p{font-family:${S.font},sans-serif;font-size:${S.body.size}pt;
  color:${c(S.body.color)};margin:0 0 ${S.body.after}pt;line-height:${lineHeight()};}

/* Headings — numbered with counters to mirror Word's multilevel list */
${h('h1', S.h1, print ? 'page-break-before:always;page-break-after:avoid;' : '')}
${h('h2', S.h2, 'page-break-after:avoid;')}
${h('h3', S.h3, 'page-break-after:avoid;')}
${h('h4', S.h4, 'page-break-after:avoid;')}
${scope} h1:first-child{page-break-before:avoid;}
${scope} h1{counter-increment:obh1;counter-reset:obh2 obh3 obh4;}
${scope} h2{counter-increment:obh2;counter-reset:obh3 obh4;}
${scope} h3{counter-increment:obh3;counter-reset:obh4;}
${scope} h4{counter-increment:obh4;}
${scope} h1::before{content:counter(obh1) ".\\00a0\\00a0";}
${scope} h2::before{content:counter(obh1) "." counter(obh2) "\\00a0\\00a0";}
${scope} h3::before{content:counter(obh1) "." counter(obh2) "." counter(obh3) "\\00a0\\00a0";}
${scope} h4::before{content:counter(obh1) "." counter(obh2) "." counter(obh3) "." counter(obh4) "\\00a0\\00a0";}

/* Cover block */
${scope} .ob-title{font-family:${S.font},sans-serif;font-size:${S.title.size}pt;
  color:${c(S.title.color)};margin:0 0 ${S.title.after}pt;
  border-bottom:${S.title.ruleWidth}pt solid ${c(S.title.ruleColor)};padding-bottom:2pt;}
${scope} .ob-date{font-size:${S.date.size}pt;color:${c(S.date.color)};
  margin:${S.date.before}pt 0 ${S.date.after}pt;}
${scope} .ob-client{font-size:${S.client.size}pt;color:${c(S.client.color)};
  margin:0 0 ${S.client.after}pt;}
${scope} .ob-project{font-size:${S.project.size}pt;color:${c(S.project.color)};
  margin:0 0 ${S.project.after}pt;}

/* Labelled lead-in line, e.g. "MRI module: …" */
${scope} .ob-field{font-size:${S.body.size}pt;margin:0 0 ${S.label.after}pt;}
${scope} .ob-field b{color:${c(S.label.color)};font-weight:700;}

/* Run-in sub-label above a list */
${scope} .ob-label{font-size:${S.label.size}pt;font-weight:700;color:${c(S.label.color)};
  margin:${S.label.before}pt 0 ${S.label.after}pt;page-break-after:avoid;}

/* Bullets — Symbol bullet at the template's indent */
${scope} ul{list-style:none;margin:0 0 ${S.bullet.after}pt;padding:0;}
${scope} ul li{font-size:${S.bullet.size}pt;color:${c(S.bullet.color)};
  position:relative;padding-left:${S.bullet.hanging / 20}pt;
  margin:0 0 ${S.bullet.after}pt;line-height:${lineHeight()};}
${scope} ul li::before{content:'•';position:absolute;left:0;color:${c(S.body.color)};}

/* Captions — italic grey, sit ABOVE their table */
${scope} .ob-caption{font-size:${S.caption.size}pt;font-style:italic;
  color:${c(S.caption.color)};margin:${S.caption.before}pt 0 ${S.caption.after}pt;
  page-break-after:avoid;}

/* Tables — green header row, white non-bold text, slate borders, no banding */
${scope} table{border-collapse:collapse;width:100%;font-size:${S.table.size}pt;
  margin:0 0 8pt;}
${scope} table th{background:${c(S.table.headerFill)};color:${c(S.table.headerColor)};
  font-weight:${S.table.headerBold ? 700 : 400};text-align:left;
  border:${S.table.borderPt}pt solid ${c(S.table.borderColor)};
  padding:${S.table.cellPadV}pt ${S.table.cellPadH}pt;vertical-align:middle;}
${scope} table td{color:${c(S.body.color)};background:transparent;
  border:${S.table.borderPt}pt solid ${c(S.table.borderColor)};
  padding:${S.table.cellPadV}pt ${S.table.cellPadH}pt;vertical-align:middle;}
${scope} table tr.ob-total td{font-weight:700;}
${print ? `${scope} table{page-break-inside:avoid;}` : ''}
${print ? `
@media print{
  ${scope} h1,${scope} table th{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  @page{size:A4 portrait;margin:1in;}
}` : ''}
`.trim();
}
