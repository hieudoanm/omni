'use client';

import { useRef, useState, type FC, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiDownload, FiExternalLink, FiLoader } from 'react-icons/fi';
import type { Deck } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { serializeDeckJson } from '@/lib/office/keynotes/exporters';
import { fetchGoogleSlidesMock, parseImportText } from '@/lib/office/keynotes/importers';

export const ImportMenu: FC = () => {
  const { importDeck } = useDeck();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const saveDeck = async (deck: Deck) => {
    setBusy(true);
    try {
      const id = await importDeck(serializeDeckJson(deck));
      router.push(`/editor/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const deck = parseImportText(await file.text());
      await saveDeck(deck);
    } catch {
      setError('Could not read that file. Use a .keynotes.json or mock .pptx file.');
    } finally {
      setBusy(false);
    }
  };

  const handleUrl = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const deck = await fetchGoogleSlidesMock(url);
      await saveDeck(deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='dropdown dropdown-end'>
      <button type='button' tabIndex={0} className='btn btn-outline gap-1.5' disabled={busy}>
        {busy ? <FiLoader className='size-4 animate-spin' /> : <FiDownload className='size-4' />}
        Import
      </button>
      <div
        tabIndex={0}
        className='dropdown-content border-base-300 bg-base-100 z-50 mt-1 w-60 rounded-lg border p-2 shadow-xl'>
        <button
          type='button'
          onClick={() => fileRef.current?.click()}
          className='hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs'>
          <FiDownload className='size-3.5 opacity-70' />
          Import file (.keynotes.json, mock .pptx)
        </button>
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs'>
          <FiExternalLink className='size-3.5 opacity-70' />
          Import from Google Slides link…
        </button>
      </div>

      <input
        ref={fileRef}
        type='file'
        accept='.json,.keynotes,.pptx,.ppt'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />

      {open && (
        <div
          className='modal modal-open'
          role='dialog'
          aria-modal='true'
          aria-label='Import from Google Slides'>
          <form className='modal-box' onSubmit={handleUrl}>
            <h3 className='text-lg font-bold'>Import from Google Slides</h3>
            <p className='py-2 text-sm opacity-70'>
              Paste a public Google Slides link. This demo fetches a mock deck derived from the
              link.
            </p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://docs.google.com/presentation/d/…/edit'
              className='input input-bordered w-full'
              disabled={busy}
            />
            {error && <p className='text-error mt-2 text-sm'>{error}</p>}
            <div className='modal-action'>
              <button type='button' className='btn' onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </button>
              <button type='submit' className='btn btn-primary' disabled={busy || !url.trim()}>
                {busy ? <FiLoader className='size-4 animate-spin' /> : null}
                Import
              </button>
            </div>
          </form>
          <div className='modal-backdrop' onClick={() => !busy && setOpen(false)} />
        </div>
      )}
    </div>
  );
};
