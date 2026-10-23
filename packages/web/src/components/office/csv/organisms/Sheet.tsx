'use client';

import { FC, useMemo } from 'react';
import CommentPopover from '../molecules/CommentPopover';
import FilterBar from '../molecules/FilterBar';
import FindBar from '../molecules/FindBar';
import Grid from './Grid';
import SheetTabs from '../molecules/SheetTabs';
import ShortcutsModal from '../molecules/ShortcutsModal';
import StatusBar from '../molecules/StatusBar';
import Toolbar from '../molecules/Toolbar';
import { useCsvState } from '@/hooks/office/csv/useCsvState';
import { useEditor } from '@/hooks/office/csv/useEditor';
import { useTheme } from '@/hooks/office/shared/useTheme';
import { computeDisplayGrid } from '@/lib/office/csv/formula';
import { applyNumberFormats } from '@/lib/office/csv/format';
import { getActiveSheet } from '@/lib/office/csv/workbook';

export const Sheet: FC = () => {
  const { workbook, setWorkbook, undo, redo, canUndo, canRedo, reset } = useCsvState();
  const editor = useEditor(workbook, setWorkbook, reset);
  const { theme, toggleTheme } = useTheme();

  const activeSheet = getActiveSheet(workbook);
  const displayGrid = useMemo(
    () => applyNumberFormats(computeDisplayGrid(activeSheet.grid), activeSheet.formats),
    [activeSheet.grid, activeSheet.formats],
  );
  const freezeMode =
    activeSheet.frozenRows > 0 && activeSheet.frozenCols > 0
      ? 'both'
      : activeSheet.frozenRows > 0
        ? 'row'
        : activeSheet.frozenCols > 0
          ? 'col'
          : 'none';

  return (
    <div className='flex h-screen flex-col print:h-auto print:overflow-visible'>
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onNew={editor.onNew}
        onImport={editor.onImport}
        onExport={editor.onExport}
        onPrint={editor.onPrint}
        onAddRow={editor.onAddRow}
        onAddColumn={editor.onAddColumn}
        onDeleteRow={editor.onDeleteRow}
        onDeleteColumn={editor.onDeleteColumn}
        onSort={editor.onSort}
        onToggleFilter={editor.onToggleFilter}
        filterActive={editor.filter !== null}
        onToggleFind={editor.onToggleFind}
        findOpen={editor.findOpen}
        onToggleComment={editor.onToggleComment}
        canComment={!editor.editing}
        freezeMode={freezeMode}
        onSetFreeze={editor.onSetFreeze}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenShortcuts={editor.onToggleShortcuts}
        activeCellLabel={editor.activeLabel}
        activeFormat={editor.activeFormat}
        activeAlignment={editor.activeAlignment}
        onFormatChange={editor.onFormatChange}
        onAlignmentChange={editor.onAlignmentChange}
      />
      {editor.findOpen && (
        <FindBar
          text={editor.findText}
          replaceText={editor.replaceText}
          matchCount={editor.findResults.length}
          current={Math.min(editor.findCurrent, Math.max(editor.findResults.length - 1, 0))}
          onTextChange={editor.onFindTextChange}
          onReplaceTextChange={editor.onReplaceTextChange}
          onPrev={editor.onFindPrev}
          onNext={editor.onFindNext}
          onReplace={editor.onReplace}
          onReplaceAll={editor.onReplaceAll}
          onClose={editor.onCloseFind}
        />
      )}
      {editor.filter && (
        <FilterBar
          cols={activeSheet.grid[0]?.length ?? 0}
          col={editor.filter.col}
          text={editor.filter.text}
          onColChange={editor.onFilterColChange}
          onTextChange={editor.onFilterTextChange}
          onClose={editor.onToggleFilter}
        />
      )}
      <div
        ref={editor.containerRef}
        aria-label='CSV spreadsheet'
        className='min-h-0 flex-1 outline-none print:h-auto print:overflow-visible'
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
          currentMatch={
            editor.findResults.length > 0
              ? editor.findResults[Math.min(editor.findCurrent, editor.findResults.length - 1)]
              : null
          }
          commentDraft={editor.commentDraft}
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
      <StatusBar
        activeLabel={editor.activeLabel}
        rangeLabel={editor.rangeLabel}
        sheetName={activeSheet.name}
        gridSize={{
          rows: activeSheet.grid.length,
          cols: activeSheet.grid[0]?.length ?? 0,
        }}
      />
      <SheetTabs
        sheets={workbook.sheets}
        activeId={workbook.activeSheetId}
        onSelect={editor.onSelectSheet}
        onAdd={editor.onAddSheet}
        onRemove={editor.onRemoveSheet}
        onRename={editor.onRenameSheet}
      />
      {editor.commentDraft && (
        <CommentPopover
          cellLabel={editor.activeLabel}
          text={editor.commentText}
          onTextChange={editor.onCommentTextChange}
          onSave={editor.onSaveComment}
          onDelete={editor.onDeleteComment}
          onClose={editor.onCloseComment}
        />
      )}
      <ShortcutsModal open={editor.shortcutsOpen} onClose={editor.onToggleShortcuts} />
    </div>
  );
};
