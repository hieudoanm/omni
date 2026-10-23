import {
  clampPosition,
  isInSelection,
  samePosition,
  selectionBounds,
  selectionCells,
} from '@/lib/office/csv/selection';
import type { Selection } from '@/lib/office/csv/types';

const selection = (
  anchorRow: number,
  anchorCol: number,
  focusRow: number,
  focusCol: number,
): Selection => ({
  anchor: { row: anchorRow, col: anchorCol },
  focus: { row: focusRow, col: focusCol },
});

describe('selectionBounds', () => {
  it('orders cells regardless of anchor/focus direction', () => {
    expect(selectionBounds(selection(3, 5, 1, 2))).toEqual({
      top: 1,
      left: 2,
      bottom: 3,
      right: 5,
    });
    expect(selectionBounds(selection(0, 0, 0, 0))).toEqual({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    });
  });
});

describe('isInSelection', () => {
  const sel = selection(1, 1, 3, 3);

  it('is true inside the range', () => {
    expect(isInSelection(sel, 2, 2)).toBe(true);
    expect(isInSelection(sel, 1, 1)).toBe(true);
    expect(isInSelection(sel, 3, 3)).toBe(true);
  });

  it('is false outside the range', () => {
    expect(isInSelection(sel, 0, 2)).toBe(false);
    expect(isInSelection(sel, 2, 0)).toBe(false);
    expect(isInSelection(sel, 4, 4)).toBe(false);
  });
});

describe('selectionCells', () => {
  it('expands a range into every cell position', () => {
    expect(selectionCells(selection(0, 0, 1, 2))).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]);
  });

  it('returns a single cell for a collapsed selection', () => {
    expect(selectionCells(selection(2, 2, 2, 2))).toEqual([{ row: 2, col: 2 }]);
  });
});

describe('samePosition', () => {
  it('compares rows and columns', () => {
    expect(samePosition({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true);
    expect(samePosition({ row: 1, col: 2 }, { row: 2, col: 2 })).toBe(false);
    expect(samePosition({ row: 1, col: 2 }, { row: 1, col: 3 })).toBe(false);
  });
});

describe('clampPosition', () => {
  const grid = [[], [], []];
  const wide = [
    ['', '', ''],
    ['', '', ''],
  ];

  it('keeps positions inside the grid', () => {
    expect(clampPosition({ row: 1, col: 2 }, wide)).toEqual({ row: 1, col: 2 });
  });

  it('clamps negative positions to zero', () => {
    expect(clampPosition({ row: -1, col: -5 }, wide)).toEqual({
      row: 0,
      col: 0,
    });
  });

  it('clamps positions beyond the grid edges', () => {
    expect(clampPosition({ row: 10, col: 20 }, wide)).toEqual({
      row: 1,
      col: 2,
    });
  });

  it('handles an empty grid', () => {
    expect(clampPosition({ row: 5, col: 5 }, [])).toEqual({ row: 0, col: 0 });
    expect(clampPosition({ row: -1, col: -1 }, [])).toEqual({ row: 0, col: 0 });
  });

  it('handles rows with no columns', () => {
    expect(clampPosition({ row: 5, col: 5 }, grid)).toEqual({ row: 2, col: 0 });
  });
});
