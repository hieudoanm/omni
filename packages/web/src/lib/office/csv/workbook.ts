import { createGrid, setCell } from '@/lib/office/csv/grid';
import type {
  Alignment,
  CellPosition,
  Grid,
  NumberFormat,
  Sheet,
  Workbook,
} from '@/lib/office/csv/types';

export const DEFAULT_COL_WIDTH = 128;
export const DEFAULT_ROW_HEIGHT = 28;

const createSheetId = (): string => `sheet-${Math.random().toString(36).slice(2, 10)}`;

export const createSheet = (name = 'Sheet 1', rows = 10, cols = 5): Sheet => ({
  id: createSheetId(),
  name,
  grid: createGrid(rows, cols),
  colWidths: [],
  rowHeights: [],
  frozenRows: 0,
  frozenCols: 0,
  comments: {},
  formats: {},
  alignments: {},
});

export const createWorkbook = (sheets: Sheet[] = [createSheet()]): Workbook => ({
  sheets,
  activeSheetId: sheets[0].id,
});

export const getActiveSheet = (workbook: Workbook): Sheet =>
  workbook.sheets.find((sheet) => sheet.id === workbook.activeSheetId) ?? workbook.sheets[0];

export const updateActiveSheet = (
  workbook: Workbook,
  updater: (sheet: Sheet) => Sheet,
): Workbook => ({
  ...workbook,
  sheets: workbook.sheets.map((sheet) =>
    sheet.id === workbook.activeSheetId ? updater(sheet) : sheet,
  ),
});

export const setActiveCell = (
  workbook: Workbook,
  row: number,
  col: number,
  value: string,
): Workbook =>
  updateActiveSheet(workbook, (sheet) => ({
    ...sheet,
    grid: setCell(sheet.grid, row, col, value),
  }));

export const setActiveSheetGrid = (workbook: Workbook, grid: Grid): Workbook =>
  updateActiveSheet(workbook, (sheet) => ({ ...sheet, grid }));

export const addActiveRow = (workbook: Workbook): Workbook =>
  updateActiveSheet(workbook, (sheet) => ({
    ...sheet,
    grid: [...sheet.grid, Array.from({ length: sheet.grid[0]?.length ?? 1 }, () => '')],
  }));

export const deleteActiveRow = (workbook: Workbook, row: number): Workbook =>
  updateActiveSheet(workbook, (sheet) =>
    sheet.grid.length <= 1
      ? sheet
      : {
          ...sheet,
          grid: sheet.grid.filter((_, index) => index !== row),
          rowHeights: sheet.rowHeights.filter((_, index) => index !== row),
        },
  );

export const addActiveColumn = (workbook: Workbook): Workbook =>
  updateActiveSheet(workbook, (sheet) => ({
    ...sheet,
    grid: sheet.grid.map((row) => [...row, '']),
  }));

export const deleteActiveColumn = (workbook: Workbook, col: number): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    if ((sheet.grid[0]?.length ?? 1) <= 1) return sheet;
    return {
      ...sheet,
      grid: sheet.grid
        .map((row) => row.filter((_, index) => index !== col))
        .filter((row) => row.length > 0),
      colWidths: sheet.colWidths.filter((_, index) => index !== col),
    };
  });

export const sortActiveSheet = (
  workbook: Workbook,
  col: number,
  direction: 'asc' | 'desc',
): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const grid = [...sheet.grid];
    grid.sort((a, b) => {
      const aValue = a[col] ?? '';
      const bValue = b[col] ?? '';
      if (aValue === '' && bValue === '') return 0;
      if (aValue === '') return 1;
      if (bValue === '') return -1;
      const result = aValue.localeCompare(bValue, undefined, {
        numeric: true,
      });
      return direction === 'asc' ? result : -result;
    });
    return { ...sheet, grid };
  });

export const setActiveColumnWidth = (workbook: Workbook, col: number, width: number): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const colWidths = [...sheet.colWidths];
    colWidths[col] = width;
    return { ...sheet, colWidths };
  });

export const setActiveRowHeight = (workbook: Workbook, row: number, height: number): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const rowHeights = [...sheet.rowHeights];
    rowHeights[row] = height;
    return { ...sheet, rowHeights };
  });

export const setActiveFreeze = (
  workbook: Workbook,
  frozenRows: number,
  frozenCols: number,
): Workbook =>
  updateActiveSheet(workbook, (sheet) => ({
    ...sheet,
    frozenRows,
    frozenCols,
  }));

export const setActiveCellComment = (
  workbook: Workbook,
  row: number,
  col: number,
  text: string,
): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const key = `${row}:${col}`;
    const comments = { ...sheet.comments };
    if (text.trim() === '') delete comments[key];
    else comments[key] = text;
    return { ...sheet, comments };
  });

export const setActiveCellFormats = (
  workbook: Workbook,
  cells: CellPosition[],
  format: NumberFormat,
): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const formats = { ...(sheet.formats ?? {}) };
    cells.forEach(({ row, col }) => {
      formats[`${row}:${col}`] = format;
    });
    return { ...sheet, formats };
  });

export const setActiveCellAlignments = (
  workbook: Workbook,
  cells: CellPosition[],
  alignment: Alignment,
): Workbook =>
  updateActiveSheet(workbook, (sheet) => {
    const alignments = { ...(sheet.alignments ?? {}) };
    cells.forEach(({ row, col }) => {
      alignments[`${row}:${col}`] = alignment;
    });
    return { ...sheet, alignments };
  });

export const addSheet = (workbook: Workbook): Workbook => {
  const template = workbook.sheets[0]?.grid;
  const sheet = createSheet(
    `Sheet ${workbook.sheets.length + 1}`,
    template?.length ?? 10,
    template?.[0]?.length ?? 5,
  );
  return {
    ...workbook,
    sheets: [...workbook.sheets, sheet],
    activeSheetId: sheet.id,
  };
};

export const removeSheet = (workbook: Workbook, id: string): Workbook => {
  if (workbook.sheets.length <= 1) return workbook;
  const index = workbook.sheets.findIndex((sheet) => sheet.id === id);
  if (index < 0) return workbook;
  const sheets = workbook.sheets.filter((sheet) => sheet.id !== id);
  const activeSheetId =
    workbook.activeSheetId === id
      ? sheets[Math.min(index, sheets.length - 1)].id
      : workbook.activeSheetId;
  return { ...workbook, sheets, activeSheetId };
};

export const renameSheet = (workbook: Workbook, id: string, name: string): Workbook => ({
  ...workbook,
  sheets: workbook.sheets.map((sheet) => (sheet.id === id ? { ...sheet, name } : sheet)),
});

export const setActiveSheet = (workbook: Workbook, id: string): Workbook => ({
  ...workbook,
  activeSheetId: id,
});

export const columnWidth = (sheet: Sheet, col: number): number =>
  sheet.colWidths[col] ?? DEFAULT_COL_WIDTH;

export const rowHeight = (sheet: Sheet, row: number): number =>
  sheet.rowHeights[row] ?? DEFAULT_ROW_HEIGHT;

export const cellFormat = (sheet: Sheet, row: number, col: number): NumberFormat =>
  sheet.formats?.[`${row}:${col}`] ?? 'general';

export const cellAlignment = (sheet: Sheet, row: number, col: number): Alignment =>
  sheet.alignments?.[`${row}:${col}`] ?? 'left';
