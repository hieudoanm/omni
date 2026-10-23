import type { CellPosition, Grid, Selection } from '@/lib/office/csv/types';

export interface Bounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const selectionBounds = (selection: Selection): Bounds => ({
  top: Math.min(selection.anchor.row, selection.focus.row),
  left: Math.min(selection.anchor.col, selection.focus.col),
  bottom: Math.max(selection.anchor.row, selection.focus.row),
  right: Math.max(selection.anchor.col, selection.focus.col),
});

export const isInSelection = (selection: Selection, row: number, col: number): boolean => {
  const bounds = selectionBounds(selection);
  return row >= bounds.top && row <= bounds.bottom && col >= bounds.left && col <= bounds.right;
};

export const selectionCells = (selection: Selection): CellPosition[] => {
  const bounds = selectionBounds(selection);
  const cells: CellPosition[] = [];
  for (let row = bounds.top; row <= bounds.bottom; row += 1) {
    for (let col = bounds.left; col <= bounds.right; col += 1) {
      cells.push({ row, col });
    }
  }
  return cells;
};

export const samePosition = (a: CellPosition, b: CellPosition): boolean =>
  a.row === b.row && a.col === b.col;

export const clampPosition = (position: CellPosition, grid: Grid): CellPosition => ({
  row: Math.min(Math.max(position.row, 0), Math.max(grid.length - 1, 0)),
  col: Math.min(Math.max(position.col, 0), Math.max((grid[0]?.length ?? 1) - 1, 0)),
});
