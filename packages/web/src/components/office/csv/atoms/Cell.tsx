'use client';

import { FC } from 'react';
import type { Alignment } from '@/lib/office/csv/types';

interface CellProps {
  value: string;
  isSelected: boolean;
  isFocus: boolean;
  isEditing: boolean;
  hasComment: boolean;
  commentText: string;
  width: number;
  height: number;
  alignment?: Alignment;
  extraClassName?: string;
  extraStyle?: React.CSSProperties;
  showFillHandle?: boolean;
  onFillHandlePointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  cellRow: number;
  cellCol: number;
  onSelect: (event: React.MouseEvent<HTMLTableCellElement>) => void;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onCommit: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPointerDown: (event: React.PointerEvent<HTMLTableCellElement>) => void;
}

const Cell: FC<CellProps> = ({
  value,
  isSelected,
  isFocus,
  isEditing,
  hasComment,
  commentText,
  width,
  height,
  alignment,
  extraClassName = '',
  extraStyle,
  showFillHandle = false,
  onFillHandlePointerDown,
  cellRow,
  cellCol,
  onSelect,
  onStartEdit,
  onChange,
  onCommit,
  onKeyDown,
  onPointerDown,
}) => {
  const cellStyle = { width, height, ...extraStyle };

  if (isEditing) {
    return (
      <td className='border-base-300 bg-base-100 border p-0' style={cellStyle} role='gridcell'>
        <input
          aria-label='Cell value'
          autoFocus
          className='bg-primary/10 h-full w-full px-1.5 font-mono text-xs outline-none'
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onCommit}
          onKeyDown={onKeyDown}
          onDoubleClick={(event) => event.stopPropagation()}
        />
      </td>
    );
  }

  const tone = isFocus ? 'bg-primary/20' : isSelected ? 'bg-primary/10' : 'bg-base-200';

  return (
    <td
      aria-selected={isSelected || isFocus}
      className={`group border-base-300 relative border p-0 ${tone} ${
        isFocus ? 'shadow-[inset_0_0_0_1px_theme(colors.primary)] z-10' : ''
      } ${extraClassName}`}
      style={{ ...cellStyle, textAlign: alignment }}
      onClick={onSelect}
      onDoubleClick={onStartEdit}
      onPointerDown={onPointerDown}
      role='gridcell'
      data-cell=''
      data-row={cellRow}
      data-col={cellCol}
      tabIndex={-1}>
      <span className='block h-full w-full cursor-default truncate px-1.5 py-1 font-mono text-xs'>
        {value}
      </span>
      {hasComment && (
        <>
          <span className='bg-accent absolute right-0 bottom-0 h-1.5 w-1.5 rounded-full' />
          <span className='bg-base-100 border-base-300 pointer-events-none absolute bottom-full left-0 z-50 hidden max-w-60 rounded-md border px-2 py-1 text-xs whitespace-normal shadow-lg group-hover:block'>
            {commentText}
          </span>
        </>
      )}
      {showFillHandle && (
        <div
          aria-label='Fill handle'
          className='border-base-100 bg-primary absolute -right-[3px] -bottom-[3px] z-20 h-3 w-3 cursor-crosshair rounded-sm border'
          onPointerDown={onFillHandlePointerDown}
          role='button'
        />
      )}
    </td>
  );
};

export default Cell;
