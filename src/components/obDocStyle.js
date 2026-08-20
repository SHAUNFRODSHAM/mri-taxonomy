/* ═══════════════════════════════════════════════════════════════════════════
   obDocStyle.js — the Open Box official document house style.

   Every value here was extracted from the Open Box "Functional Specification"
   Word template (styles.xml / numbering.xml / headerN.xml), so this module is
   the single source of truth for branded .docx output. Do not invent values —
   if something is missing, read it out of the template rather than guessing.

   UNITS (docx-js is inconsistent, hence the helpers):
     TextRun.size        → half-points          hp(9)  = 9pt
     Paragraph spacing   → twips (1/20 pt)      tw(6)  = 6pt
     Indents / margins   → twips (1440 = 1in)
     Border size         → eighths of a point   sz 4   = 0.5pt
     Image dimensions    → EMU (914400 = 1in)

   ── HOUSE STYLE REFERENCE ──────────────────────────────────────────────────
   Page      A4 (11900 × 16820 tw), 1in margins, header 510 tw, footer 220 tw,
             different first page (titlePg).
   Body      Verdana 9pt, #000, spacing after 6pt, line 1.15.
   H1        Verdana 12pt bold ALL CAPS, slate #6E7878, after 12pt, numbered "1."
   H2        Verdana 10pt bold ALL CAPS, black, before 14pt / after 5pt, "1.1"
   H3/H4     Verdana 10pt bold, black, before 12pt / after 5pt, "1.1.1"
   Headings  all keepNext, all share ONE multilevel numbering list.
   Cover     DocumentTitle 26pt slate with a 1.5pt green bottom rule, then
             Date, ClientName (14pt slate), ProjectName (14pt slate).
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

// ── Page geometry (A4, 1in margins) ───────────────────────────────────────────
export const PAGE = {
  width:  11900,
  height: 16820,
  margin: inch(1),
  header: 510,
  footer: 220,
};

/** Usable text width — every table must fit inside this. */
export const BODY_W = PAGE.width - PAGE.margin * 2;   // 8420 tw

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
        style: { paragraph: { indent: { left: 907,  hanging: 340 } },
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

// ── Document styles ───────────────────────────────────────────────────────────
/* Heading run/paragraph properties mirror the template exactly. Headings are
   given outlineLevel implicitly by using HeadingLevel.*, which is what makes
   them appear in the table of contents. */
export const documentStyles = {
  default: {
    document: {
      run:       { font: FONT, size: hp(9), color: OB.black },
      paragraph: { spacing: { after: tw(6), line: 278, lineRule: 'auto' } },
    },
    heading1: {
      run:       { font: FONT, size: hp(12), bold: true, allCaps: true, color: OB.slate },
      paragraph: { spacing: { after: tw(12) }, keepNext: true },
    },
    heading2: {
      run:       { font: FONT, size: hp(10), bold: true, allCaps: true, color: OB.black },
      paragraph: { spacing: { before: tw(14), after: tw(5) }, keepNext: true },
    },
    heading3: {
      run:       { font: FONT, size: hp(10), bold: true, color: OB.black },
      paragraph: { spacing: { before: tw(12), after: tw(5) }, keepNext: true },
    },
    heading4: {
      run:       { font: FONT, size: hp(10), bold: true, color: OB.black },
      paragraph: { spacing: { before: tw(12), after: tw(5) }, keepNext: true },
    },
    heading5: {
      run:       { font: FONT, size: hp(10), bold: true, color: OB.black },
      paragraph: { spacing: { before: tw(12), after: tw(5) }, keepNext: true },
    },
  },
  paragraphStyles: [
    {
      id: 'OBDocumentTitle',
      name: 'OB Document Title',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: FONT, size: hp(26), color: OB.slate },
      paragraph: {
        spacing: { after: tw(4), line: 240, lineRule: 'auto' },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, space: 1, color: OB.green } },
      },
    },
    {
      id: 'OBClientName',
      name: 'OB Client Name',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: FONT, size: hp(14), color: OB.slate },
      paragraph: { spacing: { after: tw(5) } },
    },
    {
      id: 'OBProjectName',
      name: 'OB Project Name',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: FONT, size: hp(14), color: OB.slate },
      paragraph: { spacing: { after: tw(5) } },
    },
    {
      id: 'OBDate',
      name: 'OB Date',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: FONT, size: hp(9), color: OB.slate },
      paragraph: { spacing: { before: tw(12), after: tw(6) } },
    },
    {
      id: 'OBCaption',
      name: 'OB Caption',
      basedOn: 'Normal',
      next: 'Normal',
      run: { font: FONT, size: hp(9), italics: true, color: OB.caption },
      paragraph: { spacing: { before: tw(3), after: tw(2) }, keepNext: true },
    },
  ],
};

// ── Table building blocks ─────────────────────────────────────────────────────

/** All-round 0.5pt slate borders, per the OBTable style. */
export const tableBorders = (() => {
  const e = { style: BorderStyle.SINGLE, size: 4, color: OB.slate };
  return { top: e, bottom: e, left: e, right: e, insideHorizontal: e, insideVertical: e };
})();

/** Cell padding: 1.4pt top/bottom (template) with breathing room left/right. */
export const cellMargins = { top: 28, bottom: 28, left: tw(5), right: tw(5) };

/** Header-row cell shading — Open Box green. */
export const headerShading = { type: ShadingType.CLEAR, color: 'auto', fill: OB.green };

/** Header-row text: WHITE, 9pt, deliberately NOT bold (the template sets b=0). */
export const headerRunProps = { font: FONT, size: hp(9), bold: false, color: OB.white };

/** Body-cell text. */
export const bodyRunProps = { font: FONT, size: hp(9), color: OB.black };

/** In-cell paragraph spacing from the OBTable style. */
export const cellParaSpacing = { before: tw(3), after: tw(3), line: 240, lineRule: 'auto' };

// ── Footer tab stop (page number left, metadata right) ────────────────────────
export const footerTabs = [{ type: TabStopType.RIGHT, position: BODY_W }];
