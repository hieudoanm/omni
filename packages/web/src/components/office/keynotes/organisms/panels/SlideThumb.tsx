'use client';

import { type FC } from 'react';
import { FiCopy, FiTrash2, FiChevronUp, FiChevronDown, FiEyeOff } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';

export const SlideThumb: FC<{
  deckId: string;
  slideId: string;
  index: number;
  thumbW: number;
  active: boolean;
  dragging: boolean;
  over: boolean;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggleHidden: (id: string) => void;
  onDragStart: (i: number) => (e: React.DragEvent) => void;
  onDragOver: (i: number) => (e: React.DragEvent) => void;
  onDrop: (i: number) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}> = ({
  deckId,
  slideId,
  index,
  thumbW,
  active,
  dragging,
  over,
  onSelect,
  onDuplicate,
  onDelete,
  onMove,
  onToggleHidden,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const { currentDeck } = useDeck();
  if (!currentDeck) return null;
  const slide = currentDeck.slides.find((s) => s.id === slideId);
  if (!slide) return null;
  const number = index + 1;

  return (
    <div
      className={`group relative m-1.5 cursor-pointer rounded-lg border-2 p-1 transition ${
        active ? 'border-primary' : 'hover:border-base-content/30 border-transparent'
      } ${over ? 'border-primary/80' : ''} ${dragging ? 'opacity-60' : ''}`}
      draggable
      onDragStart={onDragStart(index)}
      onDragOver={onDragOver(index)}
      onDrop={onDrop(index)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(slideId)}>
      {over && (
        <div className='bg-primary pointer-events-none absolute inset-x-0 -top-1 z-10 h-1 rounded-full' />
      )}
      <div className={`pointer-events-none relative ${slide.hidden ? 'opacity-40' : ''}`}>
        <SlidePreview deck={currentDeck} slide={slide} width={thumbW} slideNumber={number} />
        <span className='absolute top-1 left-1 rounded bg-black/50 px-1.5 text-[9px] text-white'>
          {slide.hidden ? 'Hidden' : number}
        </span>
      </div>
      <div className='absolute top-1 right-1 hidden gap-0.5 rounded bg-black/50 p-0.5 group-hover:flex'>
        <button
          type='button'
          title='Duplicate'
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(slideId);
          }}
          className='text-white/80 hover:text-white'>
          <FiCopy className='size-3' />
        </button>
        <button
          type='button'
          title='Hide'
          onClick={(e) => {
            e.stopPropagation();
            onToggleHidden(slideId);
          }}
          className='text-white/80 hover:text-white'>
          <FiEyeOff className='size-3' />
        </button>
        <button
          type='button'
          title='Delete'
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slideId);
          }}
          className='text-red-300 hover:text-red-400'>
          <FiTrash2 className='size-3' />
        </button>
      </div>
      <div className='absolute right-1 bottom-1 hidden gap-0.5 rounded bg-black/50 p-0.5 group-hover:flex'>
        <button
          type='button'
          title='Move up'
          onClick={(e) => {
            e.stopPropagation();
            onMove(slideId, -1);
          }}
          className='text-white/80 hover:text-white'>
          <FiChevronUp className='size-3' />
        </button>
        <button
          type='button'
          title='Move down'
          onClick={(e) => {
            e.stopPropagation();
            onMove(slideId, 1);
          }}
          className='text-white/80 hover:text-white'>
          <FiChevronDown className='size-3' />
        </button>
      </div>
    </div>
  );
};
