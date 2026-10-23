import {
  CSSProperties,
  JSX,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  width?: string;
}

interface VirtualTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight: number;
  height: number;
  renderCell?: (item: T, column: Column<T>, rowIndex: number, isSelected: boolean) => ReactNode;
}

export const VirtualTable = <T,>({
  columns,
  data,
  rowHeight,
  height,
  renderCell,
}: VirtualTableProps<T>): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);

  // Instead of a single selected index, we keep a set of selected row indexes
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

  // Track the "anchor" index for shift-selection range
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);

  const totalHeight = data.length * rowHeight;
  const visibleCount = Math.ceil(height / rowHeight);
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, data.length);
  const visibleRows = data.slice(startIndex, endIndex);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const scrollToRow = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const currentScrollTop = container.scrollTop;
    const rowTop = index * rowHeight;
    const rowBottom = rowTop + rowHeight;

    if (rowTop < currentScrollTop) {
      container.scrollTop = rowTop;
    } else if (rowBottom > currentScrollTop + height) {
      container.scrollTop = rowBottom - height;
    }
  };

  // Select rows between two indexes (inclusive)
  const selectRange = (start: number, end: number) => {
    const rangeStart = Math.min(start, end);
    const rangeEnd = Math.max(start, end);
    const newSelection = new Set(selectedIndexes);
    for (let i = rangeStart; i <= rangeEnd; i++) {
      newSelection.add(i);
    }
    return newSelection;
  };

  // Keyboard navigation with multi-select support (Shift)
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (data.length === 0) return;

    // Get current focused index; if none, fallback to first selected or 0
    const focusedIndex =
      anchorIndex !== null
        ? anchorIndex
        : selectedIndexes.size > 0
          ? Math.min(...selectedIndexes)
          : 0;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(focusedIndex + 1, data.length - 1);
      if (e.shiftKey) {
        // extend selection range
        setSelectedIndexes(selectRange(anchorIndex ?? next, next));
      } else {
        setSelectedIndexes(new Set([next]));
        setAnchorIndex(next);
      }
      scrollToRow(next);
      setAnchorIndex(next);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(focusedIndex - 1, 0);
      if (e.shiftKey) {
        setSelectedIndexes(selectRange(anchorIndex ?? prev, prev));
      } else {
        setSelectedIndexes(new Set([prev]));
        setAnchorIndex(prev);
      }
      scrollToRow(prev);
      setAnchorIndex(prev);
    }
  };

  // Mouse click supports multi-selection with Shift and Ctrl/Cmd keys
  const handleRowClick = (rowIndex: number, e: React.MouseEvent) => {
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;

    if (isShiftPressed && anchorIndex !== null) {
      // Shift + click: select range between anchor and clicked row
      setSelectedIndexes(selectRange(anchorIndex, rowIndex));
    } else if (isCtrlPressed) {
      // Ctrl/Cmd + click: toggle single row selection
      setSelectedIndexes((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(rowIndex)) {
          newSelection.delete(rowIndex);
        } else {
          newSelection.add(rowIndex);
        }
        return newSelection;
      });
      setAnchorIndex(rowIndex);
    } else {
      // Normal click: select only clicked row
      setSelectedIndexes(new Set([rowIndex]));
      setAnchorIndex(rowIndex);
    }
    scrollToRow(rowIndex);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div
      className='overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800'
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role='grid'
      aria-rowcount={data.length}
      aria-colcount={columns.length}>
      <table className='w-full border-collapse' role='rowgroup'>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className='border-b border-neutral-200 bg-neutral-100 p-2 text-left dark:border-neutral-800 dark:bg-neutral-900'
                style={{ width: col.width ?? 'auto' }}
                role='columnheader'>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
      </table>

      <div
        ref={containerRef}
        className='relative overflow-y-auto focus:outline-none'
        style={{ height }}
        role='rowgroup'>
        <div className='relative' style={{ height: totalHeight }}>
          {visibleRows.map((row, i) => {
            const rowIndex = startIndex + i;
            const isSelected = selectedIndexes.has(rowIndex);

            const style: CSSProperties = {
              position: 'absolute',
              top: rowIndex * rowHeight,
              height: rowHeight,
              left: 0,
              right: 0,
              display: 'table',
              width: '100%',
              tableLayout: 'fixed',
              background: isSelected ? '#e2e8f0' : undefined,
              cursor: 'pointer',
            };

            return (
              <div
                key={rowIndex}
                style={style}
                onClick={(e) => handleRowClick(rowIndex, e)}
                role='row'
                aria-selected={isSelected}
                tabIndex={-1}>
                <table className='w-full border-collapse' role='presentation'>
                  <tbody>
                    <tr>
                      {columns.map((col) => (
                        <td
                          key={String(col.key)}
                          className='border-b border-neutral-200 p-2 text-left dark:border-neutral-800'
                          style={{ width: col.width ?? 'auto' }}
                          role='gridcell'>
                          {renderCell
                            ? renderCell(row, col, rowIndex, isSelected)
                            : String(row[col.key])}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

VirtualTable.displayName = 'VirtualTable';
