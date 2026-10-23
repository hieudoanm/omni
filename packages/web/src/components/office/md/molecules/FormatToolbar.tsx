'use client';

import { FC } from 'react';
import type { EditorView } from '@codemirror/view';
import {
  TbBold,
  TbItalic,
  TbStrikethrough,
  TbCode,
  TbTerminal2,
  TbBlockquote,
  TbList,
  TbListNumbers,
  TbCheckbox,
  TbLink,
  TbPhoto,
  TbMinus,
  TbH1,
  TbH2,
  TbH3,
  TbTable,
} from 'react-icons/tb';
import { applyFormat, insertHeading, insertTable, type FormatKind } from '@/lib/office/md/format';

interface FormatToolbarProps {
  view: EditorView | null;
}

interface ToolButton {
  kind: FormatKind;
  label: string;
  icon: FC<{ size?: number }>;
}

const TOOLS: ToolButton[] = [
  { kind: 'bold', label: 'Bold', icon: TbBold },
  { kind: 'italic', label: 'Italic', icon: TbItalic },
  { kind: 'strikethrough', label: 'Strikethrough', icon: TbStrikethrough },
  { kind: 'inline-code', label: 'Inline code', icon: TbCode },
  { kind: 'code-block', label: 'Code block', icon: TbTerminal2 },
  { kind: 'quote', label: 'Quote', icon: TbBlockquote },
  { kind: 'ul', label: 'Bullet list', icon: TbList },
  { kind: 'ol', label: 'Numbered list', icon: TbListNumbers },
  { kind: 'task', label: 'Task list', icon: TbCheckbox },
  { kind: 'link', label: 'Link', icon: TbLink },
  { kind: 'image', label: 'Image', icon: TbPhoto },
  { kind: 'divider', label: 'Divider', icon: TbMinus },
];

const HEADINGS = [
  { level: 1, label: 'Heading 1', icon: TbH1 },
  { level: 2, label: 'Heading 2', icon: TbH2 },
  { level: 3, label: 'Heading 3', icon: TbH3 },
];

export const FormatToolbar: FC<FormatToolbarProps> = ({ view }) => {
  const runFormat = (kind: FormatKind): void => {
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const edit = applyFormat(view.state.doc.toString(), from, to, kind);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: edit.text },
      selection: { anchor: edit.selectionStart, head: edit.selectionEnd },
    });
    view.focus();
  };

  const runHeading = (level: number): void => {
    if (!view) return;
    const pos = view.state.selection.main.from;
    const edit = insertHeading(view.state.doc.toString(), pos, level);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: edit.text },
      selection: { anchor: edit.selectionStart, head: edit.selectionEnd },
    });
    view.focus();
  };

  const runTable = (): void => {
    if (!view) return;
    const dims = window.prompt('Table size (rows x columns)', '3x3');
    if (!dims) return;
    const [rows, cols] = dims.split(/[xX×]/).map((n) => parseInt(n, 10));
    if (!rows || !cols) return;
    const pos = view.state.selection.main.from;
    const edit = insertTable(view.state.doc.toString(), pos, rows, cols);
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: edit.text },
    });
    view.focus();
  };

  return (
    <div className='border-base-content/10 bg-base-200/50 flex flex-wrap items-center gap-1 border-b px-2 py-1'>
      {HEADINGS.map(({ level, label, icon: Icon }) => (
        <button
          key={`h${level}`}
          className='btn btn-ghost btn-xs tooltip tooltip-bottom'
          data-tip={label}
          onClick={() => runHeading(level)}
          disabled={!view}
          aria-label={label}>
          <Icon size={16} />
        </button>
      ))}

      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />

      {TOOLS.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          className='btn btn-ghost btn-xs tooltip tooltip-bottom'
          data-tip={label}
          onClick={() => runFormat(kind)}
          disabled={!view}
          aria-label={label}>
          <Icon size={16} />
        </button>
      ))}

      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />

      <button
        className='btn btn-ghost btn-xs tooltip tooltip-bottom'
        data-tip='Table'
        onClick={runTable}
        disabled={!view}
        aria-label='Table'>
        <TbTable size={16} />
      </button>
    </div>
  );
};
