'use client';

import { useCallback, useEffect, useState, type FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiCheck,
  FiCopy,
  FiGrid,
  FiLoader,
  FiMaximize,
  FiMinimize,
  FiMoreVertical,
  FiPlay,
  FiRotateCcw,
  FiRotateCw,
  FiShare2,
} from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { IconButton } from '@/components/office/keynotes/atoms/IconButton';
import { LiveRegion } from '@/components/office/keynotes/atoms/LiveRegion';
import { ExportMenu } from '@/components/office/keynotes/organisms/ExportMenu';
import { DiagnosticsPanel } from '@/components/office/keynotes/organisms/DiagnosticsPanel';
import type { CanvasView } from '@/app/apps/office/keynotes/editor/[id]/EditorPage';

export const EditorToolbar: FC<{
  zoom: number;
  setZoom: (z: number) => void;
  onFit: () => void;
  onFill: () => void;
  onActual: () => void;
  view: CanvasView;
  setView: (v: CanvasView) => void;
}> = ({ zoom, setZoom, onFit, onFill, onActual, view, setView }) => {
  const { currentDeck, saveDeck, undo, redo, canUndo, canRedo, renameDeck, duplicateDeck } =
    useDeck();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [saved]);

  const doSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveDeck();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }, [saveDeck]);

  const doDuplicate = useCallback(async () => {
    if (!currentDeck) return;
    const id = await duplicateDeck(currentDeck.id);
    router.push(`/editor/${id}`);
  }, [currentDeck, duplicateDeck, router]);

  if (!currentDeck) return null;

  return (
    <div className='border-base-300 bg-base-200 flex h-12 shrink-0 items-center gap-1 overflow-x-auto border-b px-3'>
      <LiveRegion message={saving ? 'Saving deck' : saved ? 'Deck saved' : ''} />
      {editingTitle ? (
        <input
          autoFocus
          defaultValue={currentDeck.title}
          onBlur={(e) => {
            renameDeck(currentDeck.id, e.target.value.trim() || 'Untitled deck');
            setEditingTitle(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setEditingTitle(false);
          }}
          className='input input-sm input-bordered w-56'
          placeholder='Deck title'
        />
      ) : (
        <button
          type='button'
          onClick={() => setEditingTitle(true)}
          className='truncate text-sm font-medium opacity-80 hover:opacity-100'
          title='Rename deck'>
          {currentDeck.title || 'Untitled deck'}
        </button>
      )}

      <div className='divider divider-horizontal mx-1 h-6' />

      <IconButton icon={FiRotateCcw} label='Undo (Ctrl+Z)' disabled={!canUndo} onClick={undo} />
      <IconButton icon={FiRotateCw} label='Redo (Ctrl+Y)' disabled={!canRedo} onClick={redo} />
      {saving ? (
        <FiLoader className='text-base-content/40 size-4 animate-spin' />
      ) : saved ? (
        <span className='text-success flex items-center gap-1 text-xs'>
          <FiCheck className='size-3.5' /> Saved
        </span>
      ) : (
        <button type='button' onClick={doSave} className='btn btn-ghost btn-xs' title='Save'>
          <FiCheck className='size-3.5' /> Save
        </button>
      )}

      <div className='flex-1' />

      <div className='bg-base-300/60 flex items-center gap-0.5 rounded-lg p-0.5'>
        <ExportMenu />
        <IconButton icon={FiCopy} label='Duplicate deck' size='sm' onClick={doDuplicate} />
        <IconButton icon={FiShare2} label='Share' size='sm' onClick={() => {}} />
        <IconButton
          icon={FiMoreVertical}
          label='More'
          size='sm'
          onClick={() => setShowDiagnostics(true)}
        />
      </div>

      <div className='divider divider-horizontal mx-1 h-6' />

      <div className='bg-base-300/60 flex items-center gap-0.5 rounded-lg p-0.5'>
        <button
          type='button'
          onClick={onFit}
          className='btn btn-ghost btn-xs gap-1'
          title='Zoom to fit'>
          <FiMinimize className='size-3.5' /> Fit
        </button>
        <button
          type='button'
          onClick={onFill}
          className='btn btn-ghost btn-xs gap-1'
          title='Zoom to fill'>
          <FiMaximize className='size-3.5' /> Fill
        </button>
        <button
          type='button'
          onClick={onActual}
          className='btn btn-ghost btn-xs'
          title='Zoom to 100%'>
          100%
        </button>
      </div>

      <div className='dropdown dropdown-end'>
        <div tabIndex={0} role='button' className='btn btn-ghost btn-xs gap-1' title='View options'>
          <FiGrid className='size-3.5' />
        </div>
        <div
          tabIndex={0}
          className='dropdown-content menu border-base-300 bg-base-100 z-50 mt-1 w-44 rounded-lg border p-2 shadow-xl'>
          {(
            [
              { key: 'gridlines', label: 'Gridlines' },
              { key: 'snap', label: 'Snap to grid & guides' },
              { key: 'rulers', label: 'Rulers' },
            ] as const
          ).map((opt) => (
            <label
              key={opt.key}
              className='flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs'>
              <span>{opt.label}</span>
              <input
                type='checkbox'
                checked={view[opt.key]}
                onChange={(e) => setView({ ...view, [opt.key]: e.target.checked })}
                className='toggle toggle-primary toggle-xs'
              />
            </label>
          ))}
        </div>
      </div>

      <div className='flex items-center gap-1'>
        <button
          type='button'
          className='btn btn-ghost btn-xs'
          onClick={() => setZoom(Math.max(0.1, zoom / 1.1))}>
          −
        </button>
        <select
          className='select select-xs bg-base-300/60 w-20'
          value={Math.round(zoom * 100)}
          onChange={(e) => setZoom(Number(e.target.value) / 100)}>
          {[25, 50, 75, 100, 125, 150, 200, 300].map((z) => (
            <option key={z} value={z}>
              {z}%
            </option>
          ))}
        </select>
        <button
          type='button'
          className='btn btn-ghost btn-xs'
          onClick={() => setZoom(Math.min(4, zoom * 1.1))}>
          +
        </button>
      </div>

      <Link href={`/present/${currentDeck.id}`} className='btn btn-primary btn-sm ml-2 gap-1.5'>
        <FiPlay className='size-4' />
        Present
      </Link>

      {showDiagnostics && (
        <div className='modal modal-open' role='dialog' aria-modal='true' aria-label='Diagnostics'>
          <div className='modal-box'>
            <h3 className='text-lg font-bold'>Diagnostics</h3>
            <div className='mt-2'>
              <DiagnosticsPanel deck={currentDeck} />
            </div>
            <div className='modal-action'>
              <button type='button' className='btn' onClick={() => setShowDiagnostics(false)}>
                Close
              </button>
            </div>
          </div>
          <div className='modal-backdrop' onClick={() => setShowDiagnostics(false)} />
        </div>
      )}
    </div>
  );
};
