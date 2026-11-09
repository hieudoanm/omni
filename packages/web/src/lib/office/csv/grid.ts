import type { Grid } from '@/lib/office/csv/types';

export const EMPTY_CELL = '';

export const createGrid = (rows: number, cols: number): Grid =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => EMPTY_CELL));

export const setCell = (grid: Grid, row: number, col: number, value: string): Grid => {
  const next = grid.map((r) => [...r]);
  next[row][col] = value;
  return next;
};

export const addRow = (grid: Grid): Grid => {
  const cols = grid[0]?.length ?? 1;
  return [...grid, Array.from({ length: cols }, () => EMPTY_CELL)];
};

export const deleteRow = (grid: Grid, row: number): Grid => {
  if (grid.length <= 1) return grid;
  return grid.filter((_, index) => index !== row);
};

export const addColumn = (grid: Grid): Grid => grid.map((row) => [...row, EMPTY_CELL]);

export const deleteColumn = (grid: Grid, col: number): Grid => {
  if (grid[0]?.length <= 1) return grid;
  return grid.map((row) => row.filter((_, index) => index !== col)).filter((row) => row.length > 0);
};

export const clearGrid = (grid: Grid): Grid => createGrid(grid.length, grid[0]?.length ?? 0);
