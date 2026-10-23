import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = join(__dirname, '..');
const CSV_PATH = join(DATA_DIR, 'apps.csv');
const JSON_PATH = join(DATA_DIR, 'apps.json');
const COLUMNS = [
  'section',
  'sectionId',
  'type',
  'typeId',
  'label',
  'description',
  'icon',
  'toolId',
  'href',
  'badge',
] as const;

type Column = (typeof COLUMNS)[number];

type CsvRow = Record<Column, string>;

type Item = {
  label: string;
  description: string;
  icon: string;
  badge?: string;
  type?: string;
  typeId?: string;
  sectionId?: string;
  toolId?: string;
  href?: string;
};

type Section = {
  id?: string;
  label: string;
  items: Item[];
};

const parseCsvRows = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"' && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  rows.push(row);
  return rows;
};

const readCsvRows = (): CsvRow[] => {
  const csv = readFileSync(CSV_PATH, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '');
  const [header, ...body] = parseCsvRows(csv);
  return body
    .filter((values) => values.some((value) => value.trim() !== ''))
    .map((values) => {
      const row = {} as CsvRow;
      header.forEach((column, index) => {
        row[column as Column] = values[index] ?? '';
      });
      return row;
    });
};

const toItem = (row: CsvRow): Item => {
  const item: Item = {
    label: row.label,
    description: row.description,
    icon: row.icon,
  };
  if (row.badge) item.badge = row.badge;
  if (row.type) item.type = row.type;
  if (row.typeId) item.typeId = row.typeId;
  if (row.sectionId) item.sectionId = row.sectionId;
  if (row.toolId) item.toolId = row.toolId;
  if (row.href) item.href = row.href;
  return item;
};

const toJson = (rows: CsvRow[]): Section[] => {
  const sections: Section[] = [];
  for (const row of rows) {
    if (row.label === '' || (row.toolId === '' && row.href === '')) continue;
    let section = sections.find((entry) => entry.label === row.section);
    if (!section) {
      section = { label: row.section, items: [] };
      if (row.sectionId) section.id = row.sectionId;
      sections.push(section);
    }
    section.items.push(toItem(row));
  }
  return sections;
};

export const main = (): void => {
  writeFileSync(JSON_PATH, JSON.stringify(toJson(readCsvRows()), null, 2) + '\n');
  console.log(`Wrote ${JSON_PATH}`);
};

main();
