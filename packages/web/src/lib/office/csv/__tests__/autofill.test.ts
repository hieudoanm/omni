import { arithmeticStep, boundingBox, fillRegion } from '@/lib/office/csv/autofill';
import { createGrid } from '@/lib/office/csv/grid';

describe('arithmeticStep', () => {
  it('returns null for empty and non-numeric values', () => {
    expect(arithmeticStep([])).toBeNull();
    expect(arithmeticStep([''])).toBeNull();
    expect(arithmeticStep([' '])).toBeNull();
    expect(arithmeticStep(['a', 'b'])).toBeNull();
    expect(arithmeticStep(['1', ''])).toBeNull();
  });

  it('treats a single numeric value as a constant series', () => {
    expect(arithmeticStep(['5'])).toBe(0);
  });

  it('computes the step between values', () => {
    expect(arithmeticStep(['1', '2'])).toBe(1);
    expect(arithmeticStep(['1', '2', '3'])).toBe(1);
    expect(arithmeticStep(['10', '20'])).toBe(10);
    expect(arithmeticStep(['0.5', '1'])).toBe(0.5);
    expect(arithmeticStep(['3', '1'])).toBe(-2);
  });
});

describe('boundingBox', () => {
  it('spans all given points', () => {
    expect(boundingBox({ row: 2, col: 5 }, { row: 0, col: 1 }, { row: 4, col: 3 })).toEqual({
      top: 0,
      left: 1,
      bottom: 4,
      right: 5,
    });
  });
});

describe('fillRegion', () => {
  it('returns no values when the target is the source', () => {
    const grid = createGrid(3, 3);
    const source = { top: 0, left: 0, bottom: 1, right: 1 };
    expect(fillRegion(grid, source, source)).toEqual([]);
  });

  it('continues a numeric row series to the right', () => {
    const grid = createGrid(1, 3);
    grid[0][0] = '1';
    grid[0][1] = '2';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 0, right: 1 },
      { top: 0, left: 0, bottom: 0, right: 4 },
    );
    expect(values).toEqual([
      { row: 0, col: 2, value: '3' },
      { row: 0, col: 3, value: '4' },
      { row: 0, col: 4, value: '5' },
    ]);
  });

  it('continues a numeric column series downward', () => {
    const grid = createGrid(5, 1);
    grid[0][0] = '10';
    grid[1][0] = '20';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 1, right: 0 },
      { top: 0, left: 0, bottom: 4, right: 0 },
    );
    expect(values.map((value) => value.value)).toEqual(['30', '40', '50']);
  });

  it('copies a single value across the target', () => {
    const grid = createGrid(1, 5);
    grid[0][0] = 'x';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 0, right: 0 },
      { top: 0, left: 0, bottom: 0, right: 2 },
    );
    expect(values.map((value) => value.value)).toEqual(['x', 'x']);
  });

  it('repeats a single numeric value instead of inferring a step', () => {
    const grid = createGrid(1, 5);
    grid[0][0] = '7';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 0, right: 0 },
      { top: 0, left: 0, bottom: 0, right: 3 },
    );
    expect(values.map((value) => value.value)).toEqual(['7', '7', '7']);
  });

  it('repeats non-numeric row values cyclically', () => {
    const grid = createGrid(1, 6);
    grid[0][0] = 'a';
    grid[0][1] = 'b';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 0, right: 1 },
      { top: 0, left: 0, bottom: 0, right: 4 },
    );
    expect(values.map((value) => value.value)).toEqual(['a', 'b', 'a']);
  });

  it('continues a series upward from the source', () => {
    const grid = createGrid(5, 1);
    grid[2][0] = '5';
    grid[3][0] = '6';
    const values = fillRegion(
      grid,
      { top: 2, left: 0, bottom: 3, right: 0 },
      { top: 0, left: 0, bottom: 3, right: 0 },
    );
    expect(values.map((value) => value.value)).toEqual(['3', '4']);
  });

  it('extends a 2D block with series continuation in both axes', () => {
    const grid = createGrid(4, 4);
    grid[0][0] = '1';
    grid[0][1] = '2';
    grid[1][0] = '3';
    grid[1][1] = '4';
    const values = fillRegion(
      grid,
      { top: 0, left: 0, bottom: 1, right: 1 },
      { top: 0, left: 0, bottom: 3, right: 3 },
    );
    const matrix = createGrid(4, 4);
    values.forEach(({ row, col, value }) => {
      matrix[row][col] = value;
    });
    matrix[0][0] = '1';
    matrix[0][1] = '2';
    matrix[1][0] = '3';
    matrix[1][1] = '4';
    expect(matrix).toEqual([
      ['1', '2', '3', '4'],
      ['3', '4', '5', '6'],
      ['5', '6', '7', '8'],
      ['7', '8', '9', '10'],
    ]);
  });
});
