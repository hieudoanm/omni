'use client';

import { FC, memo, useEffect, useRef, useState } from 'react';
import Cell from '../atoms/Cell';
import { boundingBox } from '@/lib/office/csv/autofill';
import { columnToLabel } from '@/lib/office/csv/columns';
import { isInSelection, samePosition, selectionBounds } from '@/lib/office/csv/selection';
import type { Bounds } from '@/lib/office/csv/selection';
import { cellAlignment, columnWidth, rowHeight } from '@/lib/office/csv/workbook';
import type {
  CellPosition,
  FindResult,
  Grid as GridData,
  Selection,
  Sheet,
} from '@/lib/office/csv/types';

const HEADER_HEIGHT = 28;
const HEADER_WIDTH = 36;
const MIN_COL_WIDTH = 40;
const MIN_ROW_HEIGHT = 20;

interface GridProps {
  sheet: Sheet;
  displayGrid: GridData;
  selection: Selection;
  editing: CellPosition | null;
  editingValue: string;
  filteredRows: number[] | null;
  findResults: FindResult[];
  currentMatch: FindResult | null;
  commentDraft: CellPosition | null;
  onSelect: (position: CellPosition, extend?: boolean) => void;
  onStartEdit: (position: CellPosition) => void;
  onChange: (position: CellPosition, value: string) => void;
  onCommit: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onResizeColumn: (col: number, width: number) => void;
  onResizeRow: (row: number, height: number) => void;
  onAutoFill: (source: Bounds, target: Bounds) => void;
}

const prefixSums = (sizes: number[]): number[] => {
  const sums = new Array(sizes.length).fill(0);
  let acc = 0;
  for (let i = 0; i < sizes.length; i += 1) {
    sums[i] = acc;
    acc += sizes[i];
  }
  return sums;
};

const Grid: FC<GridProps> = ({
  sheet,
  displayGrid,
  selection,
  editing,
  editingValue,
  filteredRows,
  findResults,
  currentMatch,
  commentDraft,
  onSelect,
  onStartEdit,
  onChange,
  onCommit,
  onKeyDown,
  onResizeColumn,
  onResizeRow,
  onAutoFill,
}) => {
  const colCount = sheet.grid[0]?.length ?? 0;
  const colOffsets = prefixSums(
    Array.from({ length: colCount }, (_, col) => columnWidth(sheet, col)),
  );
  const rowOffsets = prefixSums(sheet.grid.map((_, row) => rowHeight(sheet, row)));

  const dragRef = useRef<{ active: boolean; anchor: CellPosition } | null>(null);
  const resizeRef = useRef<{
    type: 'col' | 'row';
    index: number;
    start: number;
    base: number;
  } | null>(null);
  const fillRef = useRef<{ source: Bounds; target: Bounds } | null>(null);
  const [fillPreview, setFillPreview] = useState<Bounds | null>(null);

  useEffect(
    () => () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
      window.removeEventListener('pointermove', handleFillMove);
      window.removeEventListener('pointerup', handleFillEnd);
    },
    [],
  );

  const handleResizeMove = (event: PointerEvent): void => {
    const resize = resizeRef.current;
    if (!resize) return;
    const delta =
      resize.type === 'col' ? event.clientX - resize.start : event.clientY - resize.start;
    const min = resize.type === 'col' ? MIN_COL_WIDTH : MIN_ROW_HEIGHT;
    const next = Math.round(Math.max(min, resize.base + delta));
    if (resize.type === 'col') onResizeColumn(resize.index, next);
    else onResizeRow(resize.index, next);
  };

  const handleResizeEnd = (): void => {
    resizeRef.current = null;
    window.removeEventListener('pointermove', handleResizeMove);
    window.removeEventListener('pointerup', handleResizeEnd);
  };

  const handleFillMove = (event: PointerEvent): void => {
    const fill = fillRef.current;
    if (!fill) return;
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const cellEl = target?.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return;
    const next = boundingBox(
      { row: fill.source.top, col: fill.source.left },
      { row: fill.source.bottom, col: fill.source.right },
      {
        row: Number(cellEl.dataset.row),
        col: Number(cellEl.dataset.col),
      },
    );
    fillRef.current = { source: fill.source, target: next };
    setFillPreview(next);
  };

  const handleFillEnd = (): void => {
    const fill = fillRef.current;
    fillRef.current = null;
    setFillPreview(null);
    window.removeEventListener('pointermove', handleFillMove);
    window.removeEventListener('pointerup', handleFillEnd);
    if (fill) onAutoFill(fill.source, fill.target);
  };

  const beginFill = (event: React.PointerEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    const source = selectionBounds(selection);
    fillRef.current = { source, target: source };
    setFillPreview(source);
    window.addEventListener('pointermove', handleFillMove);
    window.addEventListener('pointerup', handleFillEnd);
  };

  const beginResize =
    (type: 'col' | 'row', index: number) =>
    (event: React.PointerEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      resizeRef.current = {
        type,
        index,
        start: type === 'col' ? event.clientX : event.clientY,
        base: type === 'col' ? columnWidth(sheet, index) : rowHeight(sheet, index),
      };
      window.addEventListener('pointermove', handleResizeMove);
      window.addEventListener('pointerup', handleResizeEnd);
    };

  const handleCellPointerDown =
    (position: CellPosition) =>
    (event: React.PointerEvent): void => {
      if (event.button !== 0) return;
      dragRef.current = { active: false, anchor: position };
    };

  const handleContainerPointerMove = (event: React.PointerEvent): void => {
    const drag = dragRef.current;
    if (!drag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const cellEl = target?.closest('[data-cell]') as HTMLElement | null;
    if (!cellEl) return;
    if (!drag.active) {
      onSelect(drag.anchor);
      dragRef.current = { ...drag, active: true };
    }
    onSelect({ row: Number(cellEl.dataset.row), col: Number(cellEl.dataset.col) }, true);
  };

  const handleContainerPointerUp = (): void => {
    dragRef.current = null;
  };

  const cellSticky = (
    row: number,
    col: number,
  ): { className: string; style: React.CSSProperties } => {
    const freezeRow = row < sheet.frozenRows;
    const freezeCol = col < sheet.frozenCols;
    const className: string[] = [];
    const style: React.CSSProperties = {};
    if (freezeRow) {
      className.push('sticky');
      style.top = HEADER_HEIGHT + rowOffsets[row];
    }
    if (freezeCol) {
      className.push('sticky');
      style.left = colOffsets[col];
    }
    if (freezeRow && freezeCol) className.push('z-30');
    else if (freezeRow || freezeCol) className.push('z-20');
    return { className: className.join(' '), style };
  };

  const rowIndices = filteredRows ?? sheet.grid.map((_, index) => index);
  const isDraft = (position: CellPosition): boolean =>
    commentDraft?.row === position.row && commentDraft?.col === position.col;
  const selBounds = selectionBounds(selection);
  const fillCorner = { row: selBounds.bottom, col: selBounds.right };
  const inFillRegion = (row: number, col: number): boolean =>
    fillPreview !== null &&
    row >= fillPreview.top &&
    row <= fillPreview.bottom &&
    col >= fillPreview.left &&
    col <= fillPreview.right;
  const inFillSource = (row: number, col: number): boolean =>
    inFillRegion(row, col) &&
    row >= selBounds.top &&
    row <= selBounds.bottom &&
    col >= selBounds.left &&
    col <= selBounds.right;

  return (
    <div
      className='bg-base-200 h-full overflow-auto print:h-auto print:overflow-visible'
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}>
      <table className='border-separate border-spacing-0' role='grid'>
        <thead>
          <tr>
            <th
              className='border-base-300 bg-base-300 sticky top-0 left-0 z-40 border'
              scope='colgroup'
              style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}
            />
            {Array.from({ length: colCount }, (_, col) => {
              const frozen = col < sheet.frozenCols;
              return (
                <th
                  key={col}
                  className={`border-base-300 relative sticky top-0 border px-1.5 font-mono text-[11px] font-medium ${
                    frozen ? 'z-30' : 'z-20'
                  } ${
                    col === selection.focus.col ? 'bg-primary text-primary-content' : 'bg-base-300'
                  }`}
                  scope='col'
                  style={{
                    width: columnWidth(sheet, col),
                    height: HEADER_HEIGHT,
                    ...(frozen ? { left: colOffsets[col] } : {}),
                  }}>
                  {columnToLabel(col)}
                  <div
                    aria-label={`Resize column ${columnToLabel(col)}`}
                    aria-orientation='vertical'
                    className='absolute top-0 right-0 h-full w-1 cursor-col-resize'
                    onPointerDown={beginResize('col', col)}
                    role='separator'
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rowIndices.map((row, displayIndex) => {
            const height = rowHeight(sheet, row);
            const frozen = row < sheet.frozenRows;
            return (
              <tr key={row}>
                <th
                  className={`border-base-300 relative sticky left-0 border px-1.5 font-mono text-[11px] font-medium ${
                    frozen ? 'z-30' : 'z-20'
                  } ${
                    row === selection.focus.row ? 'bg-primary text-primary-content' : 'bg-base-300'
                  }`}
                  scope='row'
                  style={{
                    width: HEADER_WIDTH,
                    height,
                    ...(frozen ? { top: HEADER_HEIGHT + rowOffsets[row] } : {}),
                  }}>
                  {displayIndex + 1}
                  <div
                    aria-label={`Resize row ${displayIndex + 1}`}
                    aria-orientation='horizontal'
                    className='absolute bottom-0 left-0 h-1 w-full cursor-row-resize'
                    onPointerDown={beginResize('row', row)}
                    role='separator'
                  />
                </th>
                {sheet.grid[row].map((value, col) => {
                  const position = { row, col };
                  const isEditing = editing?.row === row && editing?.col === col;
                  const isCurrentMatch = currentMatch?.row === row && currentMatch?.col === col;
                  const isMatch = findResults.some(
                    (match) => match.row === row && match.col === col,
                  );
                  const sticky = cellSticky(row, col);
                  const extraClassName = [
                    sticky.className,
                    inFillRegion(row, col) && !inFillSource(row, col) ? 'bg-primary/25' : '',
                    isCurrentMatch ? 'bg-warning/50' : isMatch ? 'bg-warning/25' : '',
                    isDraft(position) ? 'outline-accent outline-2 outline-dashed outline' : '',
                  ].join(' ');
                  return (
                    <Cell
                      key={col}
                      value={isEditing ? editingValue : (displayGrid[row]?.[col] ?? value)}
                      isSelected={isInSelection(selection, row, col)}
                      isFocus={samePosition(selection.focus, position)}
                      isEditing={isEditing}
                      hasComment={Boolean(sheet.comments[`${row}:${col}`])}
                      commentText={sheet.comments[`${row}:${col}`] ?? ''}
                      alignment={cellAlignment(sheet, row, col)}
                      width={columnWidth(sheet, col)}
                      height={height}
                      extraClassName={extraClassName}
                      extraStyle={sticky.style}
                      cellRow={row}
                      cellCol={col}
                      onSelect={(event) => onSelect(position, event.shiftKey)}
                      onStartEdit={() => onStartEdit(position)}
                      onChange={(next) => onChange(position, next)}
                      onCommit={onCommit}
                      onKeyDown={onKeyDown}
                      onPointerDown={handleCellPointerDown(position)}
                      showFillHandle={!editing && samePosition(position, fillCorner)}
                      onFillHandlePointerDown={beginFill}
                    />
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default memo(Grid);
