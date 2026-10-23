'use client';

import { type FC, useState } from 'react';
import { FiFolder, FiTrash2, FiChevronUp, FiChevronDown, FiPlus, FiX } from 'react-icons/fi';
import type { Deck, DeckSection, Slide } from '@/types/keynotes/deck';
import { SlideThumb } from '@/components/office/keynotes/organisms/panels/SlideThumb';

export const SectionGroup: FC<{
  deck: Deck;
  section: DeckSection;
  thumbW: number;
  activeSlideId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleHidden: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onRemoveSection: (id: string) => void;
  onMoveSection: (id: string, dir: -1 | 1) => void;
  onAddSlide: (sectionId: string, slideId: string) => void;
  onRemoveSlide: (sectionId: string, slideId: string) => void;
  onDragStart: (i: number) => (e: React.DragEvent) => void;
  onDragOver: (i: number) => (e: React.DragEvent) => void;
  onDrop: (i: number) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
  dragging: boolean;
  overIndex: (i: number) => boolean;
}> = ({
  deck,
  section,
  thumbW,
  activeSlideId,
  onSelect,
  onDuplicate,
  onDelete,
  onMove,
  onToggleHidden,
  onRename,
  onRemoveSection,
  onMoveSection,
  onAddSlide,
  onRemoveSlide,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragging,
  overIndex,
}) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const slides = section.slideIds
    .map((sid) => deck.slides.find((s) => s.id === sid))
    .filter((s): s is Slide => Boolean(s));

  const commitTitle = () => {
    onRename(section.id, title.trim() || section.title);
    setEditing(false);
  };

  return (
    <div className='border-base-300 bg-base-300/40 rounded-lg border'>
      <div className='flex items-center gap-1 px-2 py-1'>
        <FiFolder className='shrink-0 text-[10px] opacity-60' />
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setEditing(false);
            }}
            className='input input-xs input-bordered w-full'
          />
        ) : (
          <button
            type='button'
            onClick={() => setEditing(true)}
            title='Rename section'
            className='flex-1 truncate text-left text-[10px] font-semibold uppercase opacity-70 hover:opacity-100'>
            {section.title}
          </button>
        )}
        {activeSlideId && !section.slideIds.includes(activeSlideId) && (
          <button
            type='button'
            title='Add active slide to this section'
            onClick={() => onAddSlide(section.id, activeSlideId)}
            className='text-[10px] opacity-60 hover:opacity-100'>
            <FiPlus />
          </button>
        )}
        <button
          type='button'
          title='Move section up'
          onClick={() => onMoveSection(section.id, -1)}
          className='text-[10px] opacity-60 hover:opacity-100'>
          <FiChevronUp />
        </button>
        <button
          type='button'
          title='Move section down'
          onClick={() => onMoveSection(section.id, 1)}
          className='text-[10px] opacity-60 hover:opacity-100'>
          <FiChevronDown />
        </button>
        <button
          type='button'
          title='Delete section'
          onClick={() => onRemoveSection(section.id)}
          className='hover:text-error text-[10px] opacity-60'>
          <FiTrash2 />
        </button>
      </div>
      {slides.map((s) => {
        const index = deck.slides.findIndex((x) => x.id === s.id);
        return (
          <div key={s.id} className='group relative'>
            <SlideThumb
              deckId={deck.id}
              slideId={s.id}
              index={index}
              thumbW={thumbW}
              active={activeSlideId === s.id}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onMove={onMove}
              onToggleHidden={onToggleHidden}
              dragging={dragging}
              over={overIndex(index)}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            />
            <button
              type='button'
              title='Remove from section'
              onClick={() => onRemoveSlide(section.id, s.id)}
              className='absolute right-3 bottom-2 z-10 hidden rounded bg-black/50 p-0.5 text-white/80 group-hover:block hover:text-white'>
              <FiX className='size-3' />
            </button>
          </div>
        );
      })}
    </div>
  );
};
