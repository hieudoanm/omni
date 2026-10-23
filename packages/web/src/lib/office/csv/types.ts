export type Grid = string[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface Sheet {
  id: string;
  name: string;
  grid: Grid;
  colWidths: number[];
  rowHeights: number[];
  frozenRows: number;
  frozenCols: number;
  comments: Record<string, string>;
  formats?: Record<string, NumberFormat>;
  alignments?: Record<string, Alignment>;
}

export type Alignment = 'left' | 'center' | 'right';

export type NumberFormat = 'general' | 'number' | 'number2' | 'currency' | 'percent' | 'scientific';

export interface Workbook {
  sheets: Sheet[];
  activeSheetId: string;
}

export interface Selection {
  anchor: CellPosition;
  focus: CellPosition;
}

export type ExportFormat = 'csv' | 'tsv' | 'json' | 'html' | 'xml' | 'xlsx';

export type FreezeMode = 'none' | 'row' | 'col' | 'both';

export interface FindResult {
  row: number;
  col: number;
}

export interface FilterState {
  col: number;
  text: string;
}
