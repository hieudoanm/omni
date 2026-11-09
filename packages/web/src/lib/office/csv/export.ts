import { saveAs } from 'file-saver';
import { serializeCsv, serializeTsv } from '@/lib/office/csv/csv';
import { getActiveSheet } from '@/lib/office/csv/workbook';
import { buildXlsx } from '@/lib/office/csv/xlsx';
import { escapeXml } from '@/lib/office/csv/xml';
import type { ExportFormat, Workbook } from '@/lib/office/csv/types';

const serializeJson = (sheet: { name: string; grid: string[][] }): string =>
  JSON.stringify({ name: sheet.name, rows: sheet.grid }, null, 2);

const serializeHtml = (sheet: { name: string; grid: string[][] }): string =>
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeXml(sheet.name)}</title>
<style>table{border-collapse:collapse}th,td{border:1px solid #9ca3af;padding:4px 8px;font:13px/1.4 ui-monospace,monospace}th{background:#f3f4f6}td[data-col="0"]{font-weight:600;background:#f9fafb}</style>
</head>
<body>
<h1>${escapeXml(sheet.name)}</h1>
<table>
<thead><tr>${sheet.grid[0]?.map((_, i) => `<th>${String.fromCharCode(65 + (i % 26))}</th>`).join('') ?? ''}</tr></thead>
<tbody>
${sheet.grid
  .map(
    (row, r) =>
      `<tr>${row
        .map((cell, c) => `<td data-col="${c}">${c === 0 ? `${r + 1}` : ''}${escapeXml(cell)}</td>`)
        .join('')}</tr>`,
  )
  .join('\n')}
</tbody>
</table>
</body>
</html>`;

const serializeXml = (sheet: { name: string; grid: string[][] }): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<spreadsheet>
  <sheet name="${escapeXml(sheet.name)}">
${sheet.grid
  .map(
    (row, r) =>
      `    <row index="${r + 1}">${row
        .map((cell) => `<cell>${escapeXml(cell)}</cell>`)
        .join('')}</row>`,
  )
  .join('\n')}
  </sheet>
</spreadsheet>`;

const filenameFor = (name: string, format: ExportFormat): string =>
  `${name.replace(/[^a-z0-9_-]+/gi, '_')}.${format}`;

export const downloadWorkbook = (workbook: Workbook, format: ExportFormat): void => {
  const sheet = getActiveSheet(workbook);
  const filename = filenameFor(sheet.name, format);

  switch (format) {
    case 'csv': {
      saveAs(
        new Blob([serializeCsv(sheet.grid)], {
          type: 'text/csv;charset=utf-8',
        }),
        filename,
      );
      break;
    }
    case 'tsv': {
      saveAs(
        new Blob([serializeTsv(sheet.grid)], {
          type: 'text/tab-separated-values;charset=utf-8',
        }),
        filename,
      );
      break;
    }
    case 'json': {
      saveAs(
        new Blob([serializeJson(sheet)], {
          type: 'application/json;charset=utf-8',
        }),
        filename,
      );
      break;
    }
    case 'html': {
      saveAs(new Blob([serializeHtml(sheet)], { type: 'text/html;charset=utf-8' }), filename);
      break;
    }
    case 'xml': {
      saveAs(
        new Blob([serializeXml(sheet)], {
          type: 'application/xml;charset=utf-8',
        }),
        filename,
      );
      break;
    }
    case 'xlsx': {
      const bytes = buildXlsx(sheet);
      saveAs(
        new Blob([bytes as unknown as BlobPart], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        filename,
      );
      break;
    }
  }
};
