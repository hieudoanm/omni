import type { Grid } from '@/lib/office/csv/types';

const parseDelimitedGrid = (text: string, delimiter: ',' | '\t'): Grid => {
  const rows: Grid = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === '') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.length > 1 || field !== '') {
    rows.push(row);
  }

  return rows;
};

export const parseCsv = (text: string): Grid => parseDelimitedGrid(text, ',');

export const serializeCsv = (grid: Grid): string =>
  grid.map((row) => row.map((cell) => quote(cell)).join(',')).join('\r\n');

export const serializeTsv = (grid: Grid): string =>
  grid.map((row) => row.map((cell) => quote(cell)).join('\t')).join('\r\n');

export const parseDelimited = (text: string): Grid => {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim() !== '');
  const isTsv = (firstLine ?? '').split('\t').length > (firstLine ?? '').split(',').length;
  return isTsv ? parseTsv(text) : parseCsv(text);
};

export const parseTsv = (text: string): Grid => parseDelimitedGrid(text, '\t');

const quote = (value: string): string =>
  /[",\r\n\t]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
