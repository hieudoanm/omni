import { createSheet, createWorkbook } from '@/lib/office/csv/workbook';
import type { Grid, Workbook } from '@/lib/office/csv/types';

const WORKBOOK_KEY = 'csv-editor:workbook';
const LEGACY_GRID_KEY = 'csv-editor:grid';

export const loadWorkbook = (): Workbook | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(WORKBOOK_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isWorkbook(parsed)) return parsed;
    } catch {
      // fall through to legacy migration
    }
  }
  const legacy = window.localStorage.getItem(LEGACY_GRID_KEY);
  if (legacy) {
    try {
      const grid = JSON.parse(legacy) as unknown;
      if (isGrid(grid)) {
        const workbook = createWorkbook([
          createSheet('Sheet 1', grid.length, grid[0]?.length ?? 1),
        ]);
        workbook.sheets[0].grid = grid;
        return workbook;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const saveWorkbook = (workbook: Workbook): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WORKBOOK_KEY, JSON.stringify(workbook));
};

const isGrid = (value: unknown): value is Grid =>
  Array.isArray(value) &&
  value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'));

const isWorkbook = (value: unknown): value is Workbook => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Workbook>;
  return (
    Array.isArray(candidate.sheets) &&
    candidate.sheets.length > 0 &&
    typeof candidate.activeSheetId === 'string' &&
    candidate.sheets.every(
      (sheet) =>
        sheet &&
        typeof sheet.id === 'string' &&
        typeof sheet.name === 'string' &&
        isGrid(sheet.grid) &&
        Array.isArray(sheet.colWidths) &&
        Array.isArray(sheet.rowHeights) &&
        typeof sheet.frozenRows === 'number' &&
        typeof sheet.frozenCols === 'number' &&
        typeof sheet.comments === 'object',
    )
  );
};
