'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addActiveColumn,
  addActiveRow,
  addSheet,
  cellAlignment,
  cellFormat,
  deleteActiveColumn,
  deleteActiveRow,
  getActiveSheet,
  removeSheet,
  renameSheet,
  setActiveCell,
  setActiveCellAlignments,
  setActiveCellComment,
  setActiveCellFormats,
  setActiveColumnWidth,
  setActiveFreeze,
  setActiveRowHeight,
  setActiveSheet,
  setActiveSheetGrid,
  sortActiveSheet,
} from '@/lib/office/csv/workbook';
import { columnToLabel } from '@/lib/office/csv/columns';
import { fillRegion } from '@/lib/office/csv/autofill';
import { parseDelimited } from '@/lib/office/csv/csv';
import { downloadWorkbook } from '@/lib/office/csv/export';
import {
  Bounds,
  clampPosition,
  samePosition,
  selectionBounds,
  selectionCells,
} from '@/lib/office/csv/selection';
import { createWorkbook } from '@/lib/office/csv/workbook';
import { createGrid } from '@/lib/office/csv/grid';
import type {
  Alignment,
  CellPosition,
  ExportFormat,
  FilterState,
  FindResult,
  FreezeMode,
  NumberFormat,
  Selection,
  Workbook,
} from '@/lib/office/csv/types';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface EditorApi {
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeSheet: ReturnType<typeof getActiveSheet>;
  selection: Selection;
  editing: CellPosition | null;
  editBuffer: string;
  findOpen: boolean;
  findText: string;
  replaceText: string;
  findResults: FindResult[];
  findCurrent: number;
  filter: FilterState | null;
  filteredRows: number[] | null;
  commentDraft: CellPosition | null;
  commentText: string;
  shortcutsOpen: boolean;
  activeLabel: string;
  rangeLabel: string;
  activeFormat: NumberFormat;
  activeAlignment: Alignment;
  onFormatChange: (format: NumberFormat) => void;
  onAlignmentChange: (alignment: Alignment) => void;
  onSelect: (position: CellPosition, extend?: boolean) => void;
  onStartEdit: (position: CellPosition) => void;
  onEditBufferChange: (value: string) => void;
  onCommitEdit: (offsetRow?: number, offsetCol?: number) => void;
  onCellKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onGridKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onCopy: (event: React.ClipboardEvent) => void;
  onCut: (event: React.ClipboardEvent) => void;
  onPaste: (event: React.ClipboardEvent) => void;
  onResizeColumn: (col: number, width: number) => void;
  onResizeRow: (row: number, height: number) => void;
  onAutoFill: (source: Bounds, target: Bounds) => void;
  onSort: (direction: 'asc' | 'desc') => void;
  onToggleFilter: () => void;
  onFilterColChange: (col: number) => void;
  onFilterTextChange: (text: string) => void;
  onToggleFind: () => void;
  onFindTextChange: (text: string) => void;
  onReplaceTextChange: (text: string) => void;
  onFindPrev: () => void;
  onFindNext: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onCloseFind: () => void;
  onToggleComment: () => void;
  onCommentTextChange: (text: string) => void;
  onSaveComment: () => void;
  onDeleteComment: () => void;
  onCloseComment: () => void;
  onNew: () => void;
  onImport: (text: string) => void;
  onExport: (format: ExportFormat) => void;
  onPrint: () => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteRow: () => void;
  onDeleteColumn: () => void;
  onAddSheet: () => void;
  onRemoveSheet: (id: string) => void;
  onRenameSheet: (id: string, name: string) => void;
  onSelectSheet: (id: string) => void;
  onSetFreeze: (mode: FreezeMode) => void;
  onToggleShortcuts: () => void;
}

export const useEditor = (
  workbook: Workbook,
  setWorkbook: (updater: Workbook | ((prev: Workbook) => Workbook)) => void,
  reset: (workbook: Workbook) => void,
): EditorApi => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSheet = getActiveSheet(workbook);
  const editingRef = useRef<CellPosition | null>(null);
  const editBufferRef = useRef('');

  const [selection, setSelection] = useState<Selection>({
    anchor: { row: 0, col: 0 },
    focus: { row: 0, col: 0 },
  });
  const [editing, setEditing] = useState<CellPosition | null>(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findCurrent, setFindCurrent] = useState(0);
  const [filter, setFilter] = useState<FilterState | null>(null);
  const [commentDraft, setCommentDraft] = useState<CellPosition | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    setSelection((prev) => {
      const next = clampPosition(prev.focus, activeSheet.grid);
      if (samePosition(next, prev.focus)) return prev;
      return { ...prev, focus: next };
    });
  }, [activeSheet.grid]);

  const focusGrid = useCallback((): void => {
    containerRef.current?.focus();
  }, []);

  const findResults = useMemo<FindResult[]>(() => {
    if (!findText) return [];
    const needle = findText.toLowerCase();
    const results: FindResult[] = [];
    activeSheet.grid.forEach((row, rowIndex) => {
      row.forEach((value, col) => {
        if (value.toLowerCase().includes(needle)) {
          results.push({ row: rowIndex, col });
        }
      });
    });
    return results;
  }, [findText, activeSheet.grid]);

  const currentMatch =
    findResults.length > 0 ? findResults[Math.min(findCurrent, findResults.length - 1)] : null;

  const filteredRows = useMemo<number[] | null>(() => {
    if (!filter || !filter.text) return null;
    const needle = filter.text.toLowerCase();
    return activeSheet.grid
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => (row[filter.col] ?? '').toLowerCase().includes(needle))
      .map(({ index }) => index);
  }, [filter, activeSheet.grid]);

  const onSelect = useCallback(
    (position: CellPosition, extend = false): void => {
      const next = clampPosition(position, activeSheet.grid);
      setSelection((prev) =>
        extend ? { anchor: prev.anchor, focus: next } : { anchor: next, focus: next },
      );
      focusGrid();
    },
    [activeSheet.grid, focusGrid],
  );

  const onStartEdit = useCallback(
    (position: CellPosition, initial?: string): void => {
      const value = initial ?? activeSheet.grid[position.row]?.[position.col] ?? '';
      editingRef.current = position;
      editBufferRef.current = value;
      setEditing(position);
      setEditBuffer(value);
      focusGrid();
    },
    [activeSheet.grid, focusGrid],
  );

  const moveFocus = useCallback(
    (dRow: number, dCol: number, extend = false): void => {
      setSelection((prev) => {
        const next = clampPosition(
          { row: prev.focus.row + dRow, col: prev.focus.col + dCol },
          activeSheet.grid,
        );
        return extend ? { anchor: prev.anchor, focus: next } : { anchor: next, focus: next };
      });
    },
    [activeSheet.grid],
  );

  const onCommitEdit = useCallback(
    (offsetRow = 0, offsetCol = 0): void => {
      const position = editingRef.current;
      if (!position) return;
      editingRef.current = null;
      const value = editBufferRef.current;
      setWorkbook((prev) => setActiveCell(prev, position.row, position.col, value));
      setEditing(null);
      moveFocus(offsetRow, offsetCol);
      focusGrid();
    },
    [setWorkbook, moveFocus, focusGrid],
  );

  const onEditBufferChange = (value: string): void => {
    editBufferRef.current = value;
    setEditBuffer(value);
  };

  const onCellKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      editingRef.current = null;
      setEditing(null);
      focusGrid();
    } else if (event.key === 'Enter') {
      onCommitEdit(1, 0);
    } else if (event.key === 'Tab') {
      event.preventDefault();
      onCommitEdit(0, event.shiftKey ? -1 : 1);
    }
  };

  const clearSelection = useCallback((): void => {
    setWorkbook((prev) =>
      selectionCells(selection).reduce(
        (acc, cell) => setActiveCell(acc, cell.row, cell.col, ''),
        prev,
      ),
    );
  }, [selection, setWorkbook]);

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (editing) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      setShortcutsOpen((open) => !open);
      return;
    }
    if (modifier && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      setFindOpen((open) => !open);
      return;
    }
    if (event.key === 'Escape') {
      setCommentDraft(null);
      setFindOpen(false);
      setFilter(null);
      return;
    }
    const isPrintable = event.key.length === 1 && !modifier && !event.altKey;
    if (event.key === 'Tab') {
      event.preventDefault();
      moveFocus(0, event.shiftKey ? -1 : 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(-1, 0, event.shiftKey);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(1, 0, event.shiftKey);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(0, -1, event.shiftKey);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(0, 1, event.shiftKey);
    } else if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      onStartEdit(selection.focus);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      clearSelection();
    } else if (isPrintable) {
      event.preventDefault();
      onStartEdit(selection.focus, event.key);
    }
  };

  const selectionText = useCallback((): string => {
    const bounds = selectionBounds(selection);
    const lines: string[] = [];
    for (let row = bounds.top; row <= bounds.bottom; row += 1) {
      const cells: string[] = [];
      for (let col = bounds.left; col <= bounds.right; col += 1) {
        cells.push(activeSheet.grid[row]?.[col] ?? '');
      }
      lines.push(cells.join('\t'));
    }
    return lines.join('\n');
  }, [selection, activeSheet.grid]);

  const onCopy = useCallback(
    (event: React.ClipboardEvent): void => {
      if (editing) return;
      event.preventDefault();
      event.clipboardData.setData('text/plain', selectionText());
    },
    [editing, selectionText],
  );

  const onCut = useCallback(
    (event: React.ClipboardEvent): void => {
      if (editing) return;
      event.preventDefault();
      event.clipboardData.setData('text/plain', selectionText());
      clearSelection();
    },
    [editing, selectionText, clearSelection],
  );

  const onPaste = useCallback(
    (event: React.ClipboardEvent): void => {
      if (editing) return;
      const text = event.clipboardData.getData('text/plain');
      if (!text) return;
      event.preventDefault();
      const pasted = parseDelimited(text);
      if (pasted.length === 0) return;
      setWorkbook((prev) => {
        let next = prev;
        pasted.forEach((row, rowOffset) => {
          row.forEach((value, colOffset) => {
            const targetRow = selection.focus.row + rowOffset;
            const targetCol = selection.focus.col + colOffset;
            if (
              targetRow < getActiveSheet(next).grid.length &&
              targetCol < (getActiveSheet(next).grid[targetRow]?.length ?? 0)
            ) {
              next = setActiveCell(next, targetRow, targetCol, value);
            }
          });
        });
        return next;
      });
    },
    [editing, selection.focus, setWorkbook],
  );

  const onResizeColumn = useCallback(
    (col: number, width: number) => setWorkbook((prev) => setActiveColumnWidth(prev, col, width)),
    [setWorkbook],
  );

  const onResizeRow = useCallback(
    (row: number, height: number) => setWorkbook((prev) => setActiveRowHeight(prev, row, height)),
    [setWorkbook],
  );

  const onAutoFill = useCallback(
    (source: Bounds, target: Bounds): void => {
      setWorkbook((prev) => {
        let next = prev;
        fillRegion(getActiveSheet(prev).grid, source, target).forEach(({ row, col, value }) => {
          next = setActiveCell(next, row, col, value);
        });
        return next;
      });
    },
    [setWorkbook],
  );

  const onSort = useCallback(
    (direction: 'asc' | 'desc') => {
      setWorkbook((prev) => sortActiveSheet(prev, selection.focus.col, direction));
    },
    [selection.focus.col, setWorkbook],
  );

  const onToggleFilter = useCallback((): void => {
    setFilter((current) => (current ? null : { col: selection.focus.col, text: '' }));
  }, [selection.focus.col]);

  const onFilterColChange = useCallback((col: number): void => {
    setFilter((current) => (current ? { ...current, col } : { col, text: '' }));
  }, []);

  const onFilterTextChange = useCallback((text: string): void => {
    setFilter((current) => (current ? { ...current, text } : { col: 0, text }));
  }, []);

  const onToggleFind = useCallback((): void => {
    setFindOpen((open) => !open);
    setFindCurrent(0);
  }, []);

  const onFindTextChange = (text: string): void => {
    setFindText(text);
    setFindCurrent(0);
  };

  const onFindPrev = useCallback((): void => {
    if (findResults.length === 0) return;
    setFindCurrent((current) => (current - 1 + findResults.length) % findResults.length);
  }, [findResults.length]);

  const onFindNext = useCallback((): void => {
    if (findResults.length === 0) return;
    setFindCurrent((current) => (current + 1) % findResults.length);
  }, [findResults.length]);

  const onReplace = useCallback((): void => {
    if (!currentMatch || !findText) return;
    const cell = activeSheet.grid[currentMatch.row][currentMatch.col];
    const replaced = cell.replace(new RegExp(escapeRegex(findText), 'gi'), replaceText);
    setWorkbook((prev) => setActiveCell(prev, currentMatch.row, currentMatch.col, replaced));
  }, [currentMatch, findText, replaceText, activeSheet.grid, setWorkbook]);

  const onReplaceAll = useCallback((): void => {
    if (!findText) return;
    const regex = new RegExp(escapeRegex(findText), 'gi');
    setWorkbook((prev) => {
      let next = prev;
      const sheet = getActiveSheet(prev);
      sheet.grid.forEach((row, rowIndex) => {
        row.forEach((value, col) => {
          const replaced = value.replace(regex, replaceText);
          if (replaced !== value) {
            next = setActiveCell(next, rowIndex, col, replaced);
          }
        });
      });
      return next;
    });
  }, [findText, replaceText, setWorkbook]);

  const onCloseFind = useCallback((): void => {
    setFindOpen(false);
    setFindText('');
    setReplaceText('');
    setFindCurrent(0);
  }, []);

  const onToggleComment = useCallback((): void => {
    if (commentDraft) {
      setCommentDraft(null);
      return;
    }
    setCommentText(activeSheet.comments[`${selection.focus.row}:${selection.focus.col}`] ?? '');
    setCommentDraft({
      row: selection.focus.row,
      col: selection.focus.col,
    });
  }, [commentDraft, activeSheet.comments, selection.focus]);

  const onSaveComment = useCallback((): void => {
    if (!commentDraft) return;
    setWorkbook((prev) =>
      setActiveCellComment(prev, commentDraft.row, commentDraft.col, commentText),
    );
    setCommentDraft(null);
  }, [commentDraft, commentText, setWorkbook]);

  const onDeleteComment = useCallback((): void => {
    if (!commentDraft) return;
    setWorkbook((prev) => setActiveCellComment(prev, commentDraft.row, commentDraft.col, ''));
    setCommentDraft(null);
  }, [commentDraft, setWorkbook]);

  const onCloseComment = useCallback((): void => {
    setCommentDraft(null);
  }, []);

  const onNew = useCallback((): void => {
    reset(createWorkbook());
    setSelection({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } });
    setEditing(null);
    setFilter(null);
    setFindOpen(false);
    setCommentDraft(null);
  }, [reset]);

  const onImport = useCallback(
    (text: string): void => {
      const parsed = parseDelimited(text);
      const grid = parsed.length > 0 ? parsed : createGrid(1, 1);
      setWorkbook((prev) => setActiveSheetGrid(prev, grid));
      setSelection({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } });
      setEditing(null);
      setFilter(null);
    },
    [setWorkbook],
  );

  const onExport = useCallback(
    (format: ExportFormat) => downloadWorkbook(workbook, format),
    [workbook],
  );

  const onPrint = useCallback((): void => {
    window.print();
  }, []);

  const onAddRow = useCallback(() => setWorkbook((prev) => addActiveRow(prev)), [setWorkbook]);
  const onAddColumn = useCallback(
    () => setWorkbook((prev) => addActiveColumn(prev)),
    [setWorkbook],
  );
  const onDeleteRow = useCallback(
    () =>
      setWorkbook((prev) => {
        const sheet = getActiveSheet(prev);
        if (sheet.grid.length <= 1) return prev;
        return deleteActiveRow(prev, selection.focus.row);
      }),
    [selection.focus.row, setWorkbook],
  );
  const onDeleteColumn = useCallback(
    () =>
      setWorkbook((prev) => {
        const sheet = getActiveSheet(prev);
        if ((sheet.grid[0]?.length ?? 1) <= 1) return prev;
        return deleteActiveColumn(prev, selection.focus.col);
      }),
    [selection.focus.col, setWorkbook],
  );

  const onAddSheet = useCallback(() => setWorkbook((prev) => addSheet(prev)), [setWorkbook]);
  const onRemoveSheet = useCallback(
    (id: string) => setWorkbook((prev) => removeSheet(prev, id)),
    [setWorkbook],
  );
  const onRenameSheet = useCallback(
    (id: string, name: string) => setWorkbook((prev) => renameSheet(prev, id, name)),
    [setWorkbook],
  );
  const onSelectSheet = useCallback(
    (id: string): void => {
      setWorkbook((prev) => setActiveSheet(prev, id));
      setSelection({ anchor: { row: 0, col: 0 }, focus: { row: 0, col: 0 } });
      setEditing(null);
      setFilter(null);
      setCommentDraft(null);
      setFindText('');
      setFindCurrent(0);
    },
    [setWorkbook],
  );

  const onSetFreeze = useCallback(
    (mode: FreezeMode): void => {
      const frozen =
        mode === 'row'
          ? { frozenRows: 1, frozenCols: 0 }
          : mode === 'col'
            ? { frozenRows: 0, frozenCols: 1 }
            : mode === 'both'
              ? { frozenRows: 1, frozenCols: 1 }
              : { frozenRows: 0, frozenCols: 0 };
      setWorkbook((prev) => setActiveFreeze(prev, frozen.frozenRows, frozen.frozenCols));
    },
    [setWorkbook],
  );

  const onToggleShortcuts = useCallback((): void => {
    setShortcutsOpen((open) => !open);
  }, []);

  const onFormatChange = useCallback(
    (format: NumberFormat) => {
      setWorkbook((prev) => setActiveCellFormats(prev, selectionCells(selection), format));
    },
    [selection, setWorkbook],
  );

  const onAlignmentChange = useCallback(
    (alignment: Alignment) => {
      setWorkbook((prev) => setActiveCellAlignments(prev, selectionCells(selection), alignment));
    },
    [selection, setWorkbook],
  );

  const bounds = selectionBounds(selection);
  const activeLabel = `${columnToLabel(selection.focus.col)}${selection.focus.row + 1}`;
  const rangeLabel = samePosition(selection.anchor, selection.focus)
    ? activeLabel
    : `${columnToLabel(bounds.left)}${bounds.top + 1}:${columnToLabel(bounds.right)}${bounds.bottom + 1}`;
  const activeFormat = cellFormat(activeSheet, selection.focus.row, selection.focus.col);
  const activeAlignment = cellAlignment(activeSheet, selection.focus.row, selection.focus.col);

  return {
    containerRef,
    activeSheet,
    selection,
    editing,
    editBuffer,
    findOpen,
    findText,
    replaceText,
    findResults,
    findCurrent,
    filter,
    filteredRows,
    commentDraft,
    commentText,
    shortcutsOpen,
    activeLabel,
    rangeLabel,
    activeFormat,
    activeAlignment,
    onSelect,
    onStartEdit,
    onEditBufferChange,
    onCommitEdit,
    onCellKeyDown,
    onGridKeyDown,
    onCopy,
    onCut,
    onPaste,
    onResizeColumn,
    onResizeRow,
    onAutoFill,
    onSort,
    onToggleFilter,
    onFilterColChange,
    onFilterTextChange,
    onToggleFind,
    onFindTextChange,
    onFindPrev,
    onFindNext,
    onReplace,
    onReplaceAll,
    onCloseFind,
    onToggleComment,
    onCommentTextChange: setCommentText,
    onReplaceTextChange: setReplaceText,
    onSaveComment,
    onDeleteComment,
    onCloseComment,
    onNew,
    onImport,
    onExport,
    onPrint,
    onAddRow,
    onAddColumn,
    onDeleteRow,
    onDeleteColumn,
    onAddSheet,
    onRemoveSheet,
    onRenameSheet,
    onSelectSheet,
    onSetFreeze,
    onToggleShortcuts,
    onFormatChange,
    onAlignmentChange,
  };
};
