'use client';

import { type FC, useState } from 'react';
import { FiFileText, FiImage, FiList, FiMessageSquare } from 'react-icons/fi';
import { SlidesPanel } from '@/components/office/keynotes/organisms/panels/SlidesPanel';
import { OutlinePanel } from '@/components/office/keynotes/organisms/panels/OutlinePanel';
import { NotesPanel } from '@/components/office/keynotes/organisms/panels/NotesPanel';
import { CommentsPanel } from '@/components/office/keynotes/organisms/panels/CommentsPanel';

const TABS = [
  { id: 'slides', label: 'Slides', icon: FiImage },
  { id: 'outline', label: 'Outline', icon: FiList },
  { id: 'notes', label: 'Notes', icon: FiFileText },
  { id: 'comments', label: 'Comments', icon: FiMessageSquare },
] as const;

export const LeftPanel: FC = () => {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('slides');

  return (
    <aside className='border-base-300 bg-base-200 flex w-64 shrink-0 flex-col border-r'>
      <div className='border-base-300 flex h-11 shrink-0 items-center border-b px-1'>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type='button'
              onClick={() => setTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] ${
                tab === t.id ? 'border-primary text-primary' : 'text-base-content/50'
              } border-b-2`}
              title={t.label}>
              <Icon className='size-4' />
              {t.label}
            </button>
          );
        })}
      </div>
      {tab === 'slides' && <SlidesPanel />}
      {tab === 'outline' && <OutlinePanel />}
      {tab === 'notes' && <NotesPanel />}
      {tab === 'comments' && <CommentsPanel />}
    </aside>
  );
};
