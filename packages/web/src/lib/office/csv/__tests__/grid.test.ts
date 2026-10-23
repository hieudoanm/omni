import {
  addColumn,
  addRow,
  clearGrid,
  createGrid,
  deleteColumn,
  deleteRow,
  setCell,
} from '@/lib/office/csv/grid';

describe('createGrid', () => {
  it('creates an empty grid with the given dimensions', () => {
    expect(createGrid(2, 3)).toEqual([
      ['', '', ''],
      ['', '', ''],
    ]);
  });
});

describe('setCell', () => {
  it('returns a new grid with the updated value without mutating', () => {
    const grid = createGrid(2, 2);
    const next = setCell(grid, 1, 0, 'x');
    expect(next[1][0]).toBe('x');
    expect(grid[1][0]).toBe('');
    expect(next).not.toBe(grid);
  });
});

describe('addRow', () => {
  it('appends an empty row with the same width', () => {
    const grid = createGrid(2, 3);
    expect(addRow(grid)).toHaveLength(3);
    expect(addRow(grid)[2]).toEqual(['', '', '']);
  });

  it('defaults to a single column on an empty grid', () => {
    expect(addRow([])).toEqual([['']]);
  });
});

describe('deleteRow', () => {
  it('removes the requested row', () => {
    const grid = createGrid(3, 2);
    const next = deleteRow(grid, 1);
    expect(next).toHaveLength(2);
    expect(next[1]).toBe(grid[2]);
  });

  it('keeps a single-row grid intact', () => {
    const grid = createGrid(1, 2);
    expect(deleteRow(grid, 0)).toBe(grid);
  });
});

describe('addColumn', () => {
  it('appends an empty cell to every row', () => {
    const grid = createGrid(2, 2);
    const next = addColumn(grid);
    expect(next[0]).toHaveLength(3);
    expect(next[1]).toHaveLength(3);
    expect(next[1][2]).toBe('');
  });
});

describe('deleteColumn', () => {
  it('removes the requested column from every row', () => {
    const grid = [
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
    ];
    expect(deleteColumn(grid, 1)).toEqual([
      ['a', 'c'],
      ['d', 'f'],
    ]);
  });

  it('keeps a single-column grid intact', () => {
    const grid = createGrid(2, 1);
    expect(deleteColumn(grid, 0)).toBe(grid);
  });

  it('drops rows that become empty after column removal', () => {
    const grid = [['a', 'b'], ['c']];
    expect(deleteColumn(grid, 0)).toEqual([['b']]);
  });
});

describe('clearGrid', () => {
  it('clears values but keeps the dimensions', () => {
    const grid = [
      ['a', 'b'],
      ['c', 'd'],
    ];
    expect(clearGrid(grid)).toEqual([
      ['', ''],
      ['', ''],
    ]);
  });

  it('returns an empty grid for an empty grid', () => {
    expect(clearGrid([])).toEqual([]);
  });
});
