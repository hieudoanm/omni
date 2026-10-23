'use client';

import { FC } from 'react';
import { TbPlus, TbSearch, TbFile, TbX } from 'react-icons/tb';
import type { Note } from '@/lib/office/md/types';

interface MarkdownSidebarProps {
  notes: Note[];
  activeId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
  mobile: boolean;
}

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export const MarkdownSidebar: FC<MarkdownSidebarProps> = ({
  notes,
  activeId,
  search,
  onSearchChange,
  onSelect,
  onNew,
  onClose,
  mobile,
}) => {
  const filtered = notes.filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div
      className={`bg-base-200/70 flex h-full w-64 shrink-0 flex-col ${
        mobile ? 'absolute inset-y-0 left-0 z-20' : ''
      }`}>
      <div className='border-base-content/10 flex items-center gap-2 border-b p-2'>
        <div className='relative flex-1'>
          <TbSearch
            className='text-base-content/40 pointer-events-none absolute top-1/2 left-2 -translate-y-1/2'
            size={14}
          />
          <input
            type='search'
            className='input input-sm input-bordered w-full pl-7 text-sm'
            placeholder='Search notes'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label='Search notes'
          />
        </div>
        <button
          className='btn btn-ghost btn-sm tooltip tooltip-bottom'
          data-tip='New note'
          onClick={onNew}
          aria-label='New note'>
          <TbPlus size={16} />
        </button>
        {mobile && (
          <button
            className='btn btn-ghost btn-sm lg:hidden'
            onClick={onClose}
            aria-label='Close sidebar'>
            <TbX size={16} />
          </button>
        )}
      </div>

      <nav className='min-h-0 flex-1 overflow-y-auto p-2' aria-label='Notes'>
        {filtered.length === 0 ? (
          <p className='text-base-content/40 px-2 py-3 text-sm'>No notes found.</p>
        ) : (
          <ul className='m-0 flex list-none flex-col gap-0.5 p-0'>
            {filtered.map((note) => (
              <li key={note.id}>
                <button
                  className={`hover:bg-base-content/10 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left ${
                    note.id === activeId ? 'bg-primary/15 text-primary' : ''
                  }`}
                  onClick={() => onSelect(note.id)}>
                  <TbFile size={15} className='text-base-content/40 shrink-0' />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-medium'>{note.title}</span>
                    <span className='text-base-content/40 block truncate text-xs'>
                      {formatDate(note.updatedAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className='border-base-content/10 text-base-content/40 border-t px-3 py-2 text-xs'>
        {notes.length} note{notes.length === 1 ? '' : 's'} · stored locally
      </div>
    </div>
  );
};
