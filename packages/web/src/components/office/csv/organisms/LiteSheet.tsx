'use client';

import { FC, useMemo } from 'react';
import { FiArrowLeft, FiArrowRight, FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi';
import Grid from './Grid';
import { useCsvState } from '@/hooks/office/csv/useCsvState';
import { useEditor } from '@/hooks/office/csv/useEditor';
import { computeDisplayGrid } from '@/lib/office/csv/formula';
import { applyNumberFormats } from '@/lib/office/csv/format';
import { getActiveSheet } from '@/lib/office/csv/workbook';

const buttonClass = 'btn btn-ghost btn-sm gap-1 font-normal';

export const LiteSheet: FC = () => {
  const { workbook, setWorkbook, undo, redo, canUndo, canRedo, reset } = useCsvState();
  const editor = useEditor(workbook, setWorkbook, reset);

  const activeSheet = getActiveSheet(workbook);
  const displayGrid = useMemo(
    () => applyNumberFormats(computeDisplayGrid(activeSheet.grid), activeSheet.formats),
    [activeSheet.grid, activeSheet.formats],
  );

  return (
    <div className='flex h-full flex-col'>
      <div className='border-base-300 bg-base-200 flex flex-wrap items-center gap-1 border-b px-2 py-1.5'>
        <button className={buttonClass} onClick={undo} disabled={!canUndo} aria-label='Undo'>
          <FiArrowLeft /> Undo
        </button>
        <button className={buttonClass} onClick={redo} disabled={!canRedo} aria-label='Redo'>
          <FiArrowRight /> Redo
        </button>
        <span className='bg-base-300 mx-1 h-6 w-px' />
        <button className={buttonClass} onClick={editor.onAddRow}>
          <FiPlus /> Add row
        </button>
        <button className={buttonClass} onClick={editor.onAddColumn}>
          <FiPlus /> Add column
        </button>
        <button className={buttonClass} onClick={editor.onDeleteRow}>
          <FiTrash2 /> Delete row
        </button>
        <button className={buttonClass} onClick={editor.onDeleteColumn}>
          <FiTrash2 /> Delete column
        </button>
        <span className='bg-base-300 mx-1 h-6 w-px' />
        <button className={buttonClass} onClick={() => editor.onExport('csv')}>
          <FiDownload /> Export CSV
        </button>
      </div>
      <div
        ref={editor.containerRef}
        aria-label='CSV spreadsheet'
        className='min-h-0 flex-1 outline-none'
        role='application'
        tabIndex={-1}
        onKeyDown={editor.onGridKeyDown}
        onCopy={editor.onCopy}
        onCut={editor.onCut}
        onPaste={editor.onPaste}>
        <Grid
          sheet={activeSheet}
          displayGrid={displayGrid}
          selection={editor.selection}
          editing={editor.editing}
          editingValue={editor.editBuffer}
          filteredRows={editor.filteredRows}
          findResults={editor.findResults}
          currentMatch={null}
          commentDraft={null}
          onSelect={editor.onSelect}
          onStartEdit={editor.onStartEdit}
          onChange={(_position, value) => editor.onEditBufferChange(value)}
          onCommit={() => editor.onCommitEdit()}
          onKeyDown={editor.onCellKeyDown}
          onResizeColumn={editor.onResizeColumn}
          onResizeRow={editor.onResizeRow}
          onAutoFill={editor.onAutoFill}
        />
      </div>
    </div>
  );
};
