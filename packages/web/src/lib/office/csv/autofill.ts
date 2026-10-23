import type { Bounds } from '@/lib/office/csv/selection';
import type { CellPosition, Grid } from '@/lib/office/csv/types';

export interface FillResult {
  row: number;
  col: number;
  value: string;
}

const mod = (n: number, m: number): number => ((n % m) + m) % m;

const formatSeriesValue = (value: number): string => String(Math.round(value * 1e10) / 1e10);

export const arithmeticStep = (values: string[]): number | null => {
  if (values.length === 0) return null;
  if (values.some((value) => value.trim() === '')) return null;
  const numbers = values.map(Number);
  if (numbers.some((value) => !Number.isFinite(value))) return null;
  if (numbers.length === 1) return 0;
  return (numbers[numbers.length - 1] - numbers[0]) / (numbers.length - 1);
};

export const boundingBox = (...points: CellPosition[]): Bounds => ({
  top: Math.min(...points.map((point) => point.row)),
  left: Math.min(...points.map((point) => point.col)),
  bottom: Math.max(...points.map((point) => point.row)),
  right: Math.max(...points.map((point) => point.col)),
});

const cellValue = (grid: Grid, row: number, col: number): string => grid[row]?.[col] ?? '';

export const fillRegion = (grid: Grid, source: Bounds, target: Bounds): FillResult[] => {
  const height = source.bottom - source.top + 1;
  const width = source.right - source.left + 1;

  const horizontalExtension: string[][] = [];
  for (let row = source.top; row <= source.bottom; row += 1) {
    const rowValues: string[] = [];
    for (let col = source.left; col <= source.right; col += 1) {
      rowValues.push(cellValue(grid, row, col));
    }
    const step = arithmeticStep(rowValues);
    const extended: string[] = [];
    for (let col = target.left; col <= target.right; col += 1) {
      if (col >= source.left && col <= source.right) {
        extended.push(cellValue(grid, row, col));
      } else {
        extended.push(
          step === null
            ? cellValue(grid, row, source.left + mod(col - source.left, width))
            : formatSeriesValue(Number(rowValues[0]) + (col - source.left) * step),
        );
      }
    }
    horizontalExtension.push(extended);
  }

  const results: FillResult[] = [];
  for (let row = target.top; row <= target.bottom; row += 1) {
    for (let col = target.left; col <= target.right; col += 1) {
      const inSource =
        row >= source.top && row <= source.bottom && col >= source.left && col <= source.right;
      if (inSource) continue;
      if (row >= source.top && row <= source.bottom) {
        results.push({
          row,
          col,
          value: horizontalExtension[row - source.top][col - target.left],
        });
        continue;
      }
      const dRow = row - source.top;
      const columnValues = horizontalExtension.map((rowValues) => rowValues[col - target.left]);
      const step = arithmeticStep(columnValues);
      const value =
        step === null
          ? horizontalExtension[mod(dRow, height)][col - target.left]
          : formatSeriesValue(Number(columnValues[0]) + dRow * step);
      results.push({ row, col, value });
    }
  }
  return results;
};
