'use client';

import { ChangeEvent, FC, useRef } from 'react';
import { TbPlus, TbUpload, TbDownload, TbFileText, TbTrash } from 'react-icons/tb';

interface FileToolbarProps {
  canExport: boolean;
  onNew: () => void;
  onImport: (content: string) => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onExportPdf: () => void;
  onDelete: () => void;
}

export const FileToolbar: FC<FileToolbarProps> = ({
  canExport,
  onNew,
  onImport,
  onExportMarkdown,
  onExportHtml,
  onExportPdf,
  onDelete,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImport(String(reader.result ?? ''));
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className='border-base-content/10 bg-base-200/50 flex flex-wrap items-center gap-1 border-b px-2 py-1'>
      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='New note'
        onClick={onNew}
        aria-label='New note'>
        <TbPlus size={16} />
      </button>

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='Import Markdown'
        onClick={() => inputRef.current?.click()}
        aria-label='Import Markdown'>
        <TbUpload size={16} />
      </button>
      <input
        ref={inputRef}
        type='file'
        accept='.md,.markdown,.txt,text/markdown,text/plain'
        className='hidden'
        onChange={handleFile}
      />

      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='Export Markdown'
        onClick={onExportMarkdown}
        disabled={!canExport}
        aria-label='Export Markdown'>
        <TbDownload size={16} />
      </button>

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='Export HTML'
        onClick={onExportHtml}
        disabled={!canExport}
        aria-label='Export HTML'>
        <TbFileText size={16} />
      </button>

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='Export PDF'
        onClick={onExportPdf}
        disabled={!canExport}
        aria-label='Export PDF'>
        <TbDownload size={16} />
      </button>

      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom hover:text-error'
        data-tip='Delete note'
        onClick={onDelete}
        disabled={!canExport}
        aria-label='Delete note'>
        <TbTrash size={16} />
      </button>
    </div>
  );
};
