/* ═══════════════════════════════════════════════════════════════════════════
   docxExport.js — generates an Open Box branded .docx.

   All typography, colour and spacing decisions live in obDocStyle.js, which was
   derived from the official Open Box Word template. This file is concerned only
   with turning taxonomy data into document structure.

   Two entry points, one shared branded shell (cover / contents / frames /
   footer), so both views produce documents in the same house style:

     generateDocx          — MRI PMX System view
     generateBusinessDocx  — Value Streams view

   Document structure:
     Cover page      branded full-bleed frame + title / date / client / project
     Contents        auto table of contents (populated on open in Word)
     Summary         H1 + captioned table
     <Module>        H1  (page break before)
       <Column>      H2
         <Process>   H3  → overview, activities, prerequisites, screens table
           <Sub>     H4  → same sections
   ═══════════════════════════════════════════════════════════════════════════ */

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Table, TableRow, TableCell, WidthType, AlignmentType, VerticalAlign,
  Header, Footer, PageNumber, TableOfContents, PageBreak,
} from 'docx';

import {
  OB, FONT, hp, tw, px, PAGE, BODY_W, NUM,
  numberingConfig, documentStyles,
  tableBorders, cellMargins, headerShading, headerRunProps, bodyRunProps,
  cellParaSpacing, footerTabs,
} from './obDocStyle.js';

import coverFrameUrl from '../assets/ob-cover-frame.png';
import pageLogoUrl   from '../assets/ob-page-logo.png';

// ── Brand asset loading ───────────────────────────────────────────────────────

/* The frames are real PNGs shipped as Vite assets, so they resolve to URLs in
   both dev and build. Fetched once per session and cached. If a fetch fails the
   export still succeeds — it just loses the frame rather than throwing. */
const _assetCache = new Map();
async function loadAsset(url) {
  if (_assetCache.has(url)) return _assetCache.get(url);
  try {
    const buf = await (await fetch(url)).arrayBuffer();
    _assetCache.set(url, buf);
    return buf;
  } catch {
    _assetCache.set(url, null);
    return null;
  }
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();

function run(text, opts = {}) {
  return new TextRun({
    // `raw` preserves deliberate trailing spaces (e.g. a "Label: " lead-in),
    // which clean() would otherwise trim away and run the words together.
    text: opts.raw ? String(text ?? '') : clean(text),
    font: FONT,
    size: opts.size ?? hp(9),
    bold: opts.bold ?? false,
    italics: opts.italic ?? false,
    color: opts.color ?? OB.black,
  });
}

/** Body paragraph. */
function bodyPara(text, opts = {}) {
  return new Paragraph({
    children: [run(text, opts)],
    spacing: { after: tw(opts.after ?? 6) },
    ...(opts.indent ? { indent: { left: opts.indent } } : {}),
  });
}

/** Open Box bullet at the given nesting level. */
function bullet(text, level = 0) {
  return new Paragraph({
    children: [run(text)],
    numbering: { reference: NUM.bullets, level },
    spacing: { after: tw(5) },
  });
}

/** Numbered heading. Levels map to HeadingLevel so the TOC picks them up. */
const HEADING_LEVEL = [
  HeadingLevel.HEADING_1, HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5,
];

function heading(text, level, opts = {}) {
  return new Paragraph({
    heading: HEADING_LEVEL[level],
    children: [run(text, {
      size:  level === 0 ? hp(12) : hp(10),
      bold:  true,
      color: level === 0 ? OB.slate : OB.black,
    })],
    numbering: { reference: NUM.headings, level },
    ...(opts.pageBreakBefore ? { pageBreakBefore: true } : {}),
  });
}

/** "Table N: …" caption. Sits ABOVE its table, per the template. */
function caption(text) {
  return new Paragraph({
    style: 'OBCaption',
    children: [run(text, { italic: true, color: OB.caption })],
    keepNext: true,
  });
}

/** A labelled lead-in line, e.g. "MRI module: Lease Setup (…)". */
function fieldLine(label, value) {
  return new Paragraph({
    children: [
      run(label + ': ', { bold: true, color: OB.slate, raw: true }),
      run(value),
    ],
    spacing: { after: tw(5) },
  });
}

/** Small run-in sub-label above a list (deliberately not a numbered heading). */
function subLabel(text) {
  return new Paragraph({
    children: [run(text, { bold: true, color: OB.slate })],
    spacing: { before: tw(7), after: tw(3) },
    keepNext: true,
  });
}

const spacer = (pts = 8) => new Paragraph({ children: [], spacing: { after: tw(pts) } });

// ── Tables ────────────────────────────────────────────────────────────────────

function cell(text, width, opts = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    ...(opts.header ? { shading: headerShading } : {}),
    verticalAlign: VerticalAlign.CENTER,
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({
        text: clean(text),
        ...(opts.header ? headerRunProps : bodyRunProps),
        ...(opts.bold && !opts.header ? { bold: true } : {}),
      })],
      spacing: cellParaSpacing,
      alignment: opts.align ?? AlignmentType.LEFT,
    })],
  });
}

/**
 * Build an Open Box table: green header row, slate borders, no zebra banding.
 * @param headers string[]              column headings
 * @param rows    Array<Array<string|number>>  body rows; set `.isTotal` on a
 *                                      row to bold its first cell
 * @param widths  number[]              column widths in twips, summing to BODY_W
 */
function obTable(headers, rows, widths) {
  return new Table({
    width: { size: BODY_W, type: WidthType.DXA },
    columnWidths: widths,
    borders: tableBorders,
    rows: [
      new TableRow({
        tableHeader: true,   // repeat the header row across page breaks
        children: headers.map((h, i) => cell(h, widths[i], { header: true })),
      }),
      ...rows.map(r => new TableRow({
        children: r.map((v, i) => cell(v, widths[i], { bold: r.isTotal })),
      })),
    ],
  });
}

/** Split BODY_W into columns by fractional weights, absorbing rounding drift. */
function cols(...fractions) {
  const w = fractions.slice(0, -1).map(f => Math.round(BODY_W * f));
  w.push(BODY_W - w.reduce((a, b) => a + b, 0));
  return w;
}

// ── Scope helpers ─────────────────────────────────────────────────────────────

function scopePass(scope, includes) {
  if (!scope)                   return includes.untagged;
  if (scope === 'core')         return includes.core;
  if (scope === 'custom')       return includes.custom;
  if (scope === 'out-of-scope') return includes['out-of-scope'];
  return true;
}

function tally(item, parent, counts, included, includes, effectiveScopeFn, linkedSet) {
  const key = effectiveScopeFn(item, parent, linkedSet).scope || 'untagged';
  if (key in counts) counts[key]++;
  if (scopePass(key === 'untagged' ? null : key, includes) && key in included) included[key]++;
}

// ── Content blocks ────────────────────────────────────────────────────────────

function processBlock(item, level, nextTableNo, opts) {
  const { inclOverview, inclActivities, inclPrereqs, inclAssoc } = opts;
  const out = [heading(item.title, level)];

  if (item.mri_title) out.push(fieldLine('MRI module', item.mri_title));
  if (inclOverview && item.desc) out.push(bodyPara(item.desc));

  if (inclActivities && item.activities?.length) {
    out.push(subLabel('Core activities'));
    item.activities.forEach(a => out.push(bullet(a)));
  }

  if (inclPrereqs && item.mri_prereqs?.length) {
    out.push(subLabel('MRI setup prerequisites'));
    item.mri_prereqs.forEach(p => out.push(bullet(p)));
  }

  if (inclAssoc && item.mri_assoc?.length) {
    out.push(
      caption(`Table ${nextTableNo()}: Associated MRI screens — ${clean(item.title)}`),
      obTable(
        ['MRI screen', 'Purpose in this process'],
        item.mri_assoc.map(a => [a.name, a.desc]),
        cols(0.42, 0.58),
      ),
      spacer(8),
    );
  }

  if (item.clientNote) out.push(fieldLine('Client note', item.clientNote));

  return out;
}

// ── Shared branded shell ──────────────────────────────────────────────────────

/**
 * Assemble the finished Document from view-specific body blocks, wrapping them
 * in the Open Box shell: cover page, Contents, branded page frames and footer.
 * Both view generators funnel through here so neither can drift from the style.
 */
async function buildBrandedDocument({
  docTitle, versionName, dateStr, clientName, projectName, scopeStr,
  bodyBlocks,
}) {
  const [coverBuf, logoBuf] = await Promise.all([
    loadAsset(coverFrameUrl), loadAsset(pageLogoUrl),
  ]);

  const blank = n => Array.from({ length: n }, () => new Paragraph({ children: [] }));

  const cover = [
    // Vertical drop so the title clears the frame's logo, as in the template
    ...blank(3),
    new Paragraph({
      style: 'OBDocumentTitle',
      children: [run(docTitle, { size: hp(26), color: OB.slate })],
    }),
    new Paragraph({
      style: 'OBDate',
      children: [run(`${versionName}  |  ${dateStr}`, { color: OB.slate })],
    }),
    ...blank(3),
    new Paragraph({
      style: 'OBClientName',
      children: [run(clientName, { size: hp(14), color: OB.slate })],
    }),
    new Paragraph({
      style: 'OBProjectName',
      children: [run(projectName, { size: hp(14), color: OB.slate })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const contents = [
    new Paragraph({
      children: [run('Contents', { size: hp(12), bold: true, color: OB.slate })],
      spacing: { after: tw(10) },
    }),
    new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-4' }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  /* The brand frames are full-bleed page backgrounds: anchored to the page
     origin, behind the text, so body content flows over them. */
  const frame = (buf, wIn, hIn) => new Header({
    children: [new Paragraph({
      children: buf
        ? [new ImageRun({
            data: buf,
            type: 'png',
            transformation: { width: px(wIn), height: px(hIn) },
            floating: {
              horizontalPosition: { offset: 0 },
              verticalPosition:   { offset: 0 },
              behindDocument: true,
            },
          })]
        : [],
    })],
  });

  const footer = new Footer({
    children: [new Paragraph({
      tabStops: footerTabs,
      children: [
        run('Page ', { color: OB.slate }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: hp(9), color: OB.slate }),
        run(' of ', { color: OB.slate }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: hp(9), color: OB.slate }),
        new TextRun({ text: '\t', font: FONT, size: hp(9) }),
        run(`${clientName}  |  ${docTitle}  |  ${versionName}`, { color: OB.slate }),
      ],
    })],
  });

  const doc = new Document({
    creator: 'Open Box Software',
    title: `${projectName} — ${docTitle}`,
    description: `Scope: ${scopeStr} · Version: ${versionName}`,
    styles: documentStyles,
    numbering: { config: numberingConfig },
    features: { updateFields: true },   // prompt Word to build the TOC on open
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE.width, height: PAGE.height },
          margin: {
            top: PAGE.margin, bottom: PAGE.margin,
            left: PAGE.margin, right: PAGE.margin,
            header: PAGE.header, footer: PAGE.footer,
          },
        },
        titlePage: true,   // distinct first-page header (the cover frame)
      },
      headers: {
        first:   frame(coverBuf, 8.32, 11.74),
        default: frame(logoBuf,  8.24, 11.64),
      },
      footers: { default: footer },
      children: [...cover, ...contents, ...bodyBlocks],
    }],
  });

  return Packer.toBlob(doc);
}

// ── Value Streams view ────────────────────────────────────────────────────────

/**
 * Branded export for the Value Streams (business) view.
 *
 * @param tabs        string[]   value-stream ids to include
 * @param itemFilter  (item) => boolean  the view's live coverage/vertical filter,
 *                    passed in so the document matches exactly what's on screen
 * @param linksFor    (id) => Array<{moduleLabel, breadcrumb, title}>  system
 *                    processes linked to a value-stream item
 * @param coverageLabel (key) => string  human label for a coverage tag
 */
export async function generateBusinessDocx({
  tabs, businessData, businessConfig,
  inclOverview, inclActivities,
  scopeStr, versionName, dateStr, marketLabel,
  itemFilter    = () => true,
  linksFor      = () => [],
  coverageLabel = k => k,
  clientName  = 'Client Name',
  projectName = 'MRI ERP Implementation',
  docTitle    = 'Business Process Taxonomy',
}) {
  let tableSeq = 0;
  const nextTableNo = () => ++tableSeq;

  // ── Coverage summary ───────────────────────────────────────────────────────
  const counts = { full: 0, partial: 0, outside: 0, untagged: 0 };
  let shown = 0;
  tabs.forEach(tab => (businessData[tab] || []).forEach(col => col.processes.forEach(proc => {
    [proc, ...(proc.subs || [])].forEach(it => {
      const k = it.coverage || 'untagged';
      if (k in counts) counts[k]++;
      if (itemFilter(it)) shown++;
    });
  })));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const totalRow = ['Total', total];
  totalRow.isTotal = true;

  const body = [
    heading('Coverage Summary', 0),
    bodyPara(`This document covers ${scopeStr}. Markets: ${marketLabel}. The counts `
           + `below reflect the "${versionName}" version as at ${dateStr}; `
           + `${shown} of ${total} processes match the active filters.`),
    caption(`Table ${nextTableNo()}: Process count by system-coverage classification`),
    obTable(
      ['Coverage classification', 'Processes'],
      [
        [coverageLabel('full'),    counts.full],
        [coverageLabel('partial'), counts.partial],
        [coverageLabel('outside'), counts.outside],
        ['Untagged',               counts.untagged],
        totalRow,
      ],
      cols(0.7, 0.3),
    ),
  ];

  // ── Value stream content ───────────────────────────────────────────────────
  const streamBlock = (item, level) => {
    const out = [heading(item.title, level)];

    if (item.coverage) out.push(fieldLine('System coverage', coverageLabel(item.coverage)));
    if (inclOverview && item.desc) out.push(bodyPara(item.desc));

    if (inclActivities && item.activities?.length) {
      out.push(subLabel('Core activities'));
      item.activities.forEach(a => out.push(bullet(a)));
    }

    const links = linksFor(item.id);
    if (links.length) {
      out.push(
        caption(`Table ${nextTableNo()}: Supporting MRI PMX processes — ${clean(item.title)}`),
        obTable(
          ['MRI PMX module', 'Supporting system process'],
          links.map(l => [l.moduleLabel, l.breadcrumb ? `${l.breadcrumb} › ${l.title}` : l.title]),
          cols(0.32, 0.68),
        ),
        spacer(8),
      );
    }

    if (item.clientNote) out.push(fieldLine('Client note', item.clientNote));
    return out;
  };

  tabs.forEach(tab => {
    if (!businessData[tab]) return;
    body.push(heading(businessConfig[tab]?.label || tab, 0, { pageBreakBefore: true }));

    businessData[tab].forEach(col => {
      const visible = col.processes.filter(p =>
        itemFilter(p) || (p.subs || []).some(itemFilter));
      if (!visible.length) return;

      body.push(heading(col.title, 1));

      visible.forEach(proc => {
        if (itemFilter(proc)) body.push(...streamBlock(proc, 2));
        (proc.subs || []).forEach(sub => {
          if (itemFilter(sub)) body.push(...streamBlock(sub, 3));
        });
      });
    });
  });

  return buildBrandedDocument({
    docTitle, versionName, dateStr, clientName, projectName, scopeStr,
    bodyBlocks: body,
  });
}

// ── MRI PMX System view ───────────────────────────────────────────────────────

export async function generateDocx({
  tabs, allData, moduleConfig,
  inclOverview, inclActivities, inclPrereqs, inclAssoc,
  includes, linkedSet, scopeStr, versionName, dateStr,
  effectiveScopeFn,
  clientName  = 'Client Name',
  projectName = 'MRI ERP Implementation',
  docTitle    = 'Process Summary',
}) {
  let tableSeq = 0;
  const nextTableNo = () => ++tableSeq;
  const opts = { inclOverview, inclActivities, inclPrereqs, inclAssoc };

  // ── Scope summary ──────────────────────────────────────────────────────────
  const counts   = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  const included = { core: 0, custom: 0, 'out-of-scope': 0, untagged: 0 };
  tabs.forEach(tab => (allData[tab] || []).forEach(col => col.processes.forEach(proc => {
    tally(proc, null, counts, included, includes, effectiveScopeFn, linkedSet);
    (proc.subs || []).forEach(sub =>
      tally(sub, proc, counts, included, includes, effectiveScopeFn, linkedSet));
  })));
  const totAll = Object.values(counts).reduce((a, b) => a + b, 0);
  const totInc = Object.values(included).reduce((a, b) => a + b, 0);

  const totalRow = ['Total', totAll, totInc];
  totalRow.isTotal = true;

  const summary = [
    heading('Scope Summary', 0),
    bodyPara(`This document covers ${scopeStr}. The counts below reflect the `
       + `"${versionName}" version as at ${dateStr}.`),
    caption(`Table ${nextTableNo()}: Process count by scope classification`),
    obTable(
      ['Scope classification', 'Total processes', 'Included here'],
      [
        ['Core',         counts.core,            included.core],
        ['Custom',       counts.custom,          included.custom],
        ['Out of scope', counts['out-of-scope'], included['out-of-scope']],
        ['Untagged',     counts.untagged,        included.untagged],
        totalRow,
      ],
      cols(0.5, 0.25, 0.25),
    ),
  ];

  // ── Module content ─────────────────────────────────────────────────────────
  const content = [];
  tabs.forEach(tab => {
    if (!allData[tab]) return;
    content.push(heading(moduleConfig[tab]?.label || tab, 0, { pageBreakBefore: true }));

    allData[tab].forEach(col => {
      const visible = col.processes.filter(p =>
        scopePass(effectiveScopeFn(p, null, linkedSet).scope || null, includes));
      if (!visible.length) return;

      content.push(heading(col.title, 1));

      visible.forEach(proc => {
        content.push(...processBlock(proc, 2, nextTableNo, opts));

        (proc.subs || []).forEach(sub => {
          if (!scopePass(effectiveScopeFn(sub, proc, linkedSet).scope || null, includes)) return;
          content.push(...processBlock(sub, 3, nextTableNo, opts));
        });
      });
    });
  });

  return buildBrandedDocument({
    docTitle, versionName, dateStr, clientName, projectName, scopeStr,
    bodyBlocks: [...summary, ...content],
  });
}
