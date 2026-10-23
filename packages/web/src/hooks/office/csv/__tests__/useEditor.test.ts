jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { act, renderHook } from '@testing-library/react';
import { createGrid } from '@/lib/office/csv/grid';
import { createWorkbook, setActiveSheetGrid } from '@/lib/office/csv/workbook';
import type { Workbook } from '@/lib/office/csv/types';
import { useEditor } from '@/hooks/office/csv/useEditor';

const gridKey = (
  key: string,
  extra: Record<string, unknown> = {},
): React.KeyboardEvent<HTMLDivElement> =>
  ({
    key,
    shiftKey: false,
    ...extra,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  }) as unknown as React.KeyboardEvent<HTMLDivElement>;

const cellKey = (
  key: string,
  extra: Record<string, unknown> = {},
): React.KeyboardEvent<HTMLInputElement> =>
  gridKey(key, extra) as unknown as React.KeyboardEvent<HTMLInputElement>;

const clipboardEvent = (clipboardData: Partial<DataTransfer>): React.ClipboardEvent =>
  ({
    clipboardData,
    preventDefault: jest.fn(),
  }) as unknown as React.ClipboardEvent;

const renderEditor = (initial?: Workbook) => {
  let workbook = initial ?? createWorkbook();
  const setWorkbook = jest.fn((updater: Workbook | ((prev: Workbook) => Workbook)) => {
    workbook = typeof updater === 'function' ? updater(workbook) : updater;
  });
  const reset = jest.fn((next: Workbook) => {
    workbook = next;
  });
  const { result, rerender } = renderHook(() => useEditor(workbook, setWorkbook, reset));
  const refresh = (): void => rerender();
  return { result, refresh, setWorkbook, reset, getWorkbook: () => workbook };
};

describe('useEditor', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'print', {
      value: jest.fn(),
      writable: true,
    });
  });

  it('moves the focus with arrow keys and Tab', () => {
    const { result } = renderEditor();
    act(() => result.current.onSelect({ row: 1, col: 1 }));

    act(() => result.current.onGridKeyDown(gridKey('ArrowUp')));
    expect(result.current.selection.focus).toEqual({ row: 0, col: 1 });
    act(() => result.current.onGridKeyDown(gridKey('ArrowDown')));
    expect(result.current.selection.focus).toEqual({ row: 1, col: 1 });
    act(() => result.current.onGridKeyDown(gridKey('ArrowLeft')));
    expect(result.current.selection.focus).toEqual({ row: 1, col: 0 });
    act(() => result.current.onGridKeyDown(gridKey('ArrowRight')));
    expect(result.current.selection.focus).toEqual({ row: 1, col: 1 });
    act(() => result.current.onGridKeyDown(gridKey('Tab')));
    expect(result.current.selection.focus).toEqual({ row: 1, col: 2 });
    act(() => result.current.onGridKeyDown(gridKey('Tab', { shiftKey: true })));
    expect(result.current.selection.focus).toEqual({ row: 1, col: 1 });
  });

  it('extends the selection with Shift and reports a range', () => {
    const { result } = renderEditor();
    act(() => result.current.onSelect({ row: 0, col: 0 }));
    act(() => result.current.onGridKeyDown(gridKey('ArrowRight', { shiftKey: true })));
    act(() => result.current.onGridKeyDown(gridKey('ArrowDown', { shiftKey: true })));
    expect(result.current.selection.anchor).toEqual({ row: 0, col: 0 });
    expect(result.current.selection.focus).toEqual({ row: 1, col: 1 });
    expect(result.current.activeLabel).toBe('B2');
    expect(result.current.rangeLabel).toBe('A1:B2');
  });

  it('closes find, filter and comment overlays with Escape', () => {
    const { result } = renderEditor();
    act(() => result.current.onToggleFind());
    act(() => result.current.onToggleFilter());
    act(() => result.current.onToggleComment());
    expect(result.current.findOpen).toBe(true);
    expect(result.current.filter).not.toBeNull();
    expect(result.current.commentDraft).not.toBeNull();

    act(() => result.current.onGridKeyDown(gridKey('Escape')));
    expect(result.current.findOpen).toBe(false);
    expect(result.current.filter).toBeNull();
    expect(result.current.commentDraft).toBeNull();
  });

  it('starts editing and clears cells from the grid keyboard', () => {
    const { result, getWorkbook } = renderEditor();
    act(() => result.current.onSelect({ row: 1, col: 1 }));

    act(() => result.current.onGridKeyDown(gridKey('F2')));
    expect(result.current.editing).toEqual({ row: 1, col: 1 });
    expect(result.current.editBuffer).toBe('');

    act(() => result.current.onEditBufferChange('x'));
    act(() => result.current.onCommitEdit());
    expect(getWorkbook().sheets[0].grid[1][1]).toBe('x');

    act(() => result.current.onGridKeyDown(gridKey('Backspace')));
    expect(getWorkbook().sheets[0].grid[1][1]).toBe('');
  });

  it('starts editing with a printable key', () => {
    const { result } = renderEditor();
    act(() => result.current.onSelect({ row: 0, col: 0 }));
    act(() => result.current.onGridKeyDown(gridKey('h')));
    expect(result.current.editing).toEqual({ row: 0, col: 0 });
    expect(result.current.editBuffer).toBe('h');
  });

  it('handles cell editing keys', () => {
    const { result, getWorkbook } = renderEditor();

    act(() => result.current.onSelect({ row: 0, col: 0 }));
    act(() => result.current.onStartEdit({ row: 0, col: 0 }));
    act(() => result.current.onEditBufferChange('hello'));
    act(() => result.current.onCellKeyDown(cellKey('Tab')));
    expect(getWorkbook().sheets[0].grid[0][0]).toBe('hello');
    expect(result.current.selection.focus).toEqual({ row: 0, col: 1 });

    act(() => result.current.onSelect({ row: 1, col: 1 }));
    act(() => result.current.onStartEdit({ row: 1, col: 1 }));
    act(() => result.current.onEditBufferChange('world'));
    act(() => result.current.onCellKeyDown(cellKey('Enter')));
    expect(getWorkbook().sheets[0].grid[1][1]).toBe('world');
    expect(result.current.selection.focus).toEqual({ row: 2, col: 1 });

    act(() => result.current.onSelect({ row: 2, col: 2 }));
    act(() => result.current.onStartEdit({ row: 2, col: 2 }));
    act(() => result.current.onEditBufferChange('x'));
    act(() => result.current.onCellKeyDown(cellKey('Tab', { shiftKey: true })));
    expect(getWorkbook().sheets[0].grid[2][2]).toBe('x');
    expect(result.current.selection.focus).toEqual({ row: 2, col: 1 });

    act(() => result.current.onStartEdit({ row: 0, col: 0 }));
    act(() => result.current.onCellKeyDown(cellKey('Escape')));
    expect(result.current.editing).toBeNull();
  });

  it('ignores grid keys, copy, cut and paste while editing', () => {
    const { result } = renderEditor();
    act(() => result.current.onStartEdit({ row: 0, col: 0 }));
    act(() => result.current.onGridKeyDown(gridKey('ArrowDown')));
    expect(result.current.selection.focus).toEqual({ row: 0, col: 0 });

    const setData = jest.fn();
    const cutSetData = jest.fn();
    const getData = jest.fn(() => 'should-not-paste');
    act(() => result.current.onCopy(clipboardEvent({ setData } as unknown as DataTransfer)));
    act(() =>
      result.current.onCut(clipboardEvent({ setData: cutSetData } as unknown as DataTransfer)),
    );
    act(() => result.current.onPaste(clipboardEvent({ getData } as unknown as DataTransfer)));
    expect(setData).not.toHaveBeenCalled();
    expect(cutSetData).not.toHaveBeenCalled();
    expect(getData).not.toHaveBeenCalled();
  });

  it('copies, cuts and pastes the selection', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onImport('a,b\nc,d'));
    act(() => refresh());
    act(() => result.current.onSelect({ row: 0, col: 0 }));
    act(() => result.current.onSelect({ row: 0, col: 1 }, true));

    const setData = jest.fn();
    act(() => result.current.onCopy(clipboardEvent({ setData } as unknown as DataTransfer)));
    expect(setData).toHaveBeenCalledWith('text/plain', 'a\tb');

    const cutSetData = jest.fn();
    act(() =>
      result.current.onCut(clipboardEvent({ setData: cutSetData } as unknown as DataTransfer)),
    );
    expect(cutSetData).toHaveBeenCalledWith('text/plain', 'a\tb');
    expect(getWorkbook().sheets[0].grid[0][0]).toBe('');

    act(() => result.current.onSelect({ row: 0, col: 0 }));
    const getData = jest.fn(() => 'x,y\nz,w');
    act(() => result.current.onPaste(clipboardEvent({ getData } as unknown as DataTransfer)));
    act(() => refresh());
    const grid = getWorkbook().sheets[0].grid;
    expect(grid[0][0]).toBe('x');
    expect(grid[0][1]).toBe('y');
    expect(grid[1][0]).toBe('z');
    expect(grid[1][1]).toBe('w');

    act(() =>
      result.current.onPaste(clipboardEvent({ getData: () => '' } as unknown as DataTransfer)),
    );
    act(() =>
      result.current.onPaste(clipboardEvent({ getData: () => ',' } as unknown as DataTransfer)),
    );
    act(() => result.current.onSelect({ row: 1, col: 1 }));
    act(() =>
      result.current.onPaste(
        clipboardEvent({ getData: () => '1,2\n3,4' } as unknown as DataTransfer),
      ),
    );
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[1][1]).toBe('1');
    expect(getWorkbook().sheets[0].grid[1][0]).toBe('z');
  });

  it('resizes columns and rows', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onResizeColumn(0, 200));
    act(() => result.current.onResizeRow(1, 40));
    act(() => refresh());
    const sheet = getWorkbook().sheets[0];
    expect(sheet.colWidths[0]).toBe(200);
    expect(sheet.rowHeights[1]).toBe(40);
  });

  it('sorts the active sheet ascending and descending', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onImport('name,qty\nb,2\na,10\nc,1\n,5'));
    act(() => refresh());
    act(() => result.current.onSelect({ row: 0, col: 0 }));

    act(() => result.current.onSort('asc'));
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid.map((row) => row[0])).toEqual(['a', 'b', 'c', 'name', '']);

    act(() => result.current.onSort('desc'));
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid.map((row) => row[0])).toEqual(['name', 'c', 'b', 'a', '']);
  });

  it('toggles and configures filters', () => {
    const { result } = renderEditor();
    act(() => result.current.onToggleFilter());
    expect(result.current.filter).toEqual({ col: 0, text: '' });
    act(() => result.current.onFilterColChange(2));
    expect(result.current.filter).toEqual({ col: 2, text: '' });
    act(() => result.current.onFilterTextChange('ab'));
    expect(result.current.filter).toEqual({ col: 2, text: 'ab' });
    act(() => result.current.onToggleFilter());
    expect(result.current.filter).toBeNull();
    act(() => result.current.onFilterColChange(1));
    expect(result.current.filter).toEqual({ col: 1, text: '' });
    act(() => result.current.onFilterTextChange('x'));
    expect(result.current.filter).toEqual({ col: 1, text: 'x' });
    act(() => result.current.onToggleFilter());
    expect(result.current.filter).toBeNull();
    act(() => result.current.onFilterTextChange('y'));
    expect(result.current.filter).toEqual({ col: 0, text: 'y' });
  });

  it('computes filtered rows', () => {
    const { result, refresh } = renderEditor();
    act(() => result.current.onImport('a,b\nab,2\nc,d'));
    act(() => refresh());
    act(() => result.current.onToggleFilter());
    act(() => result.current.onFilterTextChange('a'));
    expect(result.current.filteredRows).toEqual([0, 1]);
    act(() => result.current.onFilterTextChange(''));
    expect(result.current.filteredRows).toBeNull();
  });

  it('finds, replaces and closes the find bar', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onImport('cat,hat\nbat,cat'));
    act(() => refresh());
    act(() => result.current.onToggleFind());
    act(() => result.current.onFindTextChange('at'));
    expect(result.current.findResults).toHaveLength(4);
    expect(result.current.findOpen).toBe(true);

    act(() => result.current.onFindNext());
    expect(result.current.findCurrent).toBe(1);
    act(() => result.current.onFindPrev());
    expect(result.current.findCurrent).toBe(0);
    act(() => result.current.onFindPrev());
    expect(result.current.findCurrent).toBe(3);

    act(() => result.current.onFindTextChange('zzz'));
    expect(result.current.findResults).toHaveLength(0);
    act(() => result.current.onFindNext());
    act(() => result.current.onFindPrev());
    act(() => result.current.onReplace());

    act(() => result.current.onFindTextChange(''));
    act(() => result.current.onReplaceAll());

    act(() => result.current.onFindTextChange('at'));
    act(() => result.current.onReplaceTextChange('AN'));
    act(() => result.current.onReplace());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[0][0]).toBe('cAN');

    act(() => result.current.onReplaceAll());
    act(() => refresh());
    expect(
      getWorkbook()
        .sheets[0].grid.flat()
        .every((value) => !value.includes('at')),
    ).toBe(true);

    act(() => result.current.onCloseFind());
    expect(result.current.findOpen).toBe(false);
    expect(result.current.findText).toBe('');
    expect(result.current.replaceText).toBe('');
  });

  it('adds, saves and deletes cell comments', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onSelect({ row: 1, col: 1 }));
    act(() => result.current.onToggleComment());
    expect(result.current.commentDraft).toEqual({ row: 1, col: 1 });
    expect(result.current.commentText).toBe('');

    act(() => result.current.onCommentTextChange('note'));
    act(() => result.current.onSaveComment());
    act(() => refresh());
    expect(getWorkbook().sheets[0].comments['1:1']).toBe('note');
    expect(result.current.commentDraft).toBeNull();

    act(() => result.current.onToggleComment());
    expect(result.current.commentText).toBe('note');
    act(() => result.current.onToggleComment());
    expect(result.current.commentDraft).toBeNull();

    act(() => result.current.onToggleComment());
    act(() => result.current.onDeleteComment());
    act(() => refresh());
    expect(getWorkbook().sheets[0].comments['1:1']).toBeUndefined();

    act(() => result.current.onToggleComment());
    act(() => result.current.onCloseComment());
    expect(result.current.commentDraft).toBeNull();

    act(() => result.current.onSaveComment());
    act(() => result.current.onDeleteComment());
    expect(result.current.commentDraft).toBeNull();
  });

  it('manages sheets', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onAddSheet());
    act(() => refresh());
    expect(getWorkbook().sheets).toHaveLength(2);
    const secondId = getWorkbook().sheets[1].id;

    act(() => result.current.onRenameSheet(secondId, 'Data'));
    act(() => refresh());
    expect(getWorkbook().sheets[1].name).toBe('Data');

    act(() => result.current.onSelectSheet(secondId));
    act(() => refresh());
    expect(getWorkbook().activeSheetId).toBe(secondId);

    act(() => result.current.onRemoveSheet(secondId));
    act(() => refresh());
    expect(getWorkbook().sheets).toHaveLength(1);

    act(() => result.current.onRemoveSheet(getWorkbook().sheets[0].id));
    act(() => refresh());
    expect(getWorkbook().sheets).toHaveLength(1);
  });

  it('imports, creates, exports and prints', () => {
    const { result, getWorkbook, reset, refresh } = renderEditor();
    act(() => result.current.onImport('a,b\nc,d'));
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);

    act(() => result.current.onImport(''));
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid).toEqual([['']]);

    act(() => result.current.onNew());
    expect(reset).toHaveBeenCalled();

    act(() => result.current.onExport('csv'));
    act(() => result.current.onExport('tsv'));
    act(() => result.current.onExport('json'));
    act(() => result.current.onExport('html'));
    act(() => result.current.onExport('xml'));
    act(() => result.current.onExport('xlsx'));

    act(() => result.current.onPrint());
    expect(window.print).toHaveBeenCalled();
  });

  it('adds and deletes rows and columns', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onSelect({ row: 1, col: 1 }));
    act(() => result.current.onAddRow());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid).toHaveLength(11);
    act(() => result.current.onAddColumn());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[0]).toHaveLength(6);
    act(() => result.current.onDeleteRow());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid).toHaveLength(10);
    act(() => result.current.onDeleteColumn());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[0]).toHaveLength(5);

    act(() => result.current.onImport('only'));
    act(() => refresh());
    act(() => result.current.onDeleteRow());
    act(() => result.current.onDeleteColumn());
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid).toEqual([['only']]);
  });

  it('sets the freeze mode', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onSetFreeze('row'));
    act(() => result.current.onSetFreeze('col'));
    act(() => result.current.onSetFreeze('both'));
    act(() => result.current.onSetFreeze('none'));
    act(() => refresh());
    const sheet = getWorkbook().sheets[0];
    expect(sheet.frozenRows).toBe(0);
    expect(sheet.frozenCols).toBe(0);
  });

  it('reports the format and alignment of the focused cell', () => {
    const { result, refresh } = renderEditor();
    expect(result.current.activeFormat).toBe('general');
    expect(result.current.activeAlignment).toBe('left');

    act(() => result.current.onSelect({ row: 2, col: 1 }));
    act(() => result.current.onFormatChange('currency'));
    act(() => result.current.onAlignmentChange('right'));
    act(() => refresh());
    expect(result.current.activeFormat).toBe('currency');
    expect(result.current.activeAlignment).toBe('right');
  });

  it('continues a numeric row series when filling', () => {
    const grid = createGrid(5, 5);
    grid[0][0] = '1';
    grid[0][1] = '2';
    const workbook = setActiveSheetGrid(createWorkbook(), grid);
    const { result, getWorkbook, refresh } = renderEditor(workbook);
    act(() =>
      result.current.onAutoFill(
        { top: 0, left: 0, bottom: 0, right: 1 },
        { top: 0, left: 0, bottom: 0, right: 4 },
      ),
    );
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[0]).toEqual(['1', '2', '3', '4', '5']);
  });

  it('continues a numeric column series when filling down', () => {
    const grid = createGrid(5, 5);
    grid[0][0] = '10';
    grid[1][0] = '20';
    const workbook = setActiveSheetGrid(createWorkbook(), grid);
    const { result, getWorkbook, refresh } = renderEditor(workbook);
    act(() =>
      result.current.onAutoFill(
        { top: 0, left: 0, bottom: 1, right: 0 },
        { top: 0, left: 0, bottom: 4, right: 0 },
      ),
    );
    act(() => refresh());
    const column = getWorkbook().sheets[0].grid.map((row) => row[0]);
    expect(column).toEqual(['10', '20', '30', '40', '50']);
  });

  it('copies non-numeric values when filling', () => {
    const grid = createGrid(5, 5);
    grid[0][0] = 'x';
    const workbook = setActiveSheetGrid(createWorkbook(), grid);
    const { result, getWorkbook, refresh } = renderEditor(workbook);
    act(() =>
      result.current.onAutoFill(
        { top: 0, left: 0, bottom: 0, right: 0 },
        { top: 0, left: 0, bottom: 0, right: 2 },
      ),
    );
    act(() => refresh());
    expect(getWorkbook().sheets[0].grid[0].slice(0, 3)).toEqual(['x', 'x', 'x']);
  });

  it('applies a number format and alignment to the selection', () => {
    const { result, getWorkbook, refresh } = renderEditor();
    act(() => result.current.onSelect({ row: 0, col: 0 }));
    act(() => result.current.onGridKeyDown(gridKey('ArrowRight', { shiftKey: true })));
    act(() => result.current.onFormatChange('percent'));
    act(() => result.current.onAlignmentChange('center'));
    act(() => refresh());
    const sheet = getWorkbook().sheets[0];
    expect(sheet.formats?.['0:0']).toBe('percent');
    expect(sheet.formats?.['0:1']).toBe('percent');
    expect(sheet.alignments?.['0:0']).toBe('center');
    expect(sheet.alignments?.['0:1']).toBe('center');
  });

  it('toggles shortcuts with Ctrl/Cmd+K and the find bar with Ctrl/Cmd+F', () => {
    const { result } = renderEditor();
    act(() => result.current.onGridKeyDown(gridKey('k', { metaKey: true })));
    expect(result.current.shortcutsOpen).toBe(true);
    act(() => result.current.onToggleShortcuts());
    expect(result.current.shortcutsOpen).toBe(false);

    act(() => result.current.onGridKeyDown(gridKey('f', { ctrlKey: true })));
    expect(result.current.findOpen).toBe(true);
  });

  it('clamps the selection when the grid shrinks', () => {
    const { result, setWorkbook, refresh } = renderEditor();
    act(() => result.current.onSelect({ row: 9, col: 4 }));
    act(() => {
      setWorkbook((prev) => setActiveSheetGrid(prev, createGrid(3, 3)));
    });
    act(() => refresh());
    expect(result.current.selection.focus).toEqual({ row: 2, col: 2 });
  });
});
