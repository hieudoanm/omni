'use client';

import { type FC, useState } from 'react';
import { FiPlus, FiFolder, FiCopy, FiRefreshCw } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlideThumb } from '@/components/office/keynotes/organisms/panels/SlideThumb';
import { SectionGroup } from '@/components/office/keynotes/organisms/panels/SectionGroup';
import { ReuseSlidesModal } from '@/components/office/keynotes/organisms/panels/ReuseSlidesModal';
import type { DeckSection, SlideLayoutId } from '@/types/keynotes/deck';
import {
  newSection,
  renameSection,
  deleteSection,
  moveSection,
  sectionAddSlide,
  sectionRemoveSlide,
  sectionedSlideIds,
} from '@/lib/office/keynotes/sections';

const LAYOUTS: Array<{ id: SlideLayoutId; label: string }> = [
  { id: 'title', label: 'Title' },
  { id: 'title-content', label: 'Title & content' },
  { id: 'two-content', label: 'Two content' },
  { id: 'cover', label: 'Cover' },
  { id: 'section', label: 'Section' },
  { id: 'image', label: 'Image' },
  { id: 'quote', label: 'Quote' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'thank-you', label: 'Thank you' },
  { id: 'blank', label: 'Blank' },
];

export const SlidesPanel: FC = () => {
  const {
    currentDeck,
    activeSlideId,
    setActiveSlide,
    addSlide,
    duplicateSlide,
    deleteSlide,
    moveSlide,
    toggleSlideHidden,
    reorderSlides,
    mutate,
  } = useDeck();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reuseOpen, setReuseOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  if (!currentDeck) return null;
  const thumbW = 168;
  const sectioned = sectionedSlideIds(currentDeck.sections);

  const setSections = (updater: (sections: DeckSection[]) => DeckSection[]) => {
    mutate((deck) => ({ ...deck, sections: updater(deck.sections) }));
  };

  const handleDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  };
  const handleDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (overIndex !== i) setOverIndex(i);
  };
  const handleDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== i) reorderSlides(dragIndex, i);
    setDragIndex(null);
    setOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const dragProps = {
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
    dragging: dragIndex !== null,
  };

  const thumbProps = {
    onSelect: setActiveSlide,
    onDuplicate: duplicateSlide,
    onDelete: deleteSlide,
    onMove: moveSlide,
    onToggleHidden: toggleSlideHidden,
    ...dragProps,
  };

  return (
    <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto p-2'>
      <div className='mb-2 flex gap-1'>
        <button
          type='button'
          onClick={() => setMenuOpen((v) => !v)}
          className='btn btn-primary btn-sm flex-1 gap-1'>
          <FiPlus /> New slide
        </button>
        <button
          type='button'
          onClick={() => setSections((s) => [...s, newSection()])}
          className='btn btn-outline btn-sm gap-1'
          title='New section'>
          <FiFolder />
        </button>
        <button
          type='button'
          onClick={() => setReuseOpen(true)}
          className='btn btn-outline btn-sm gap-1'
          title='Reuse slides from other decks'>
          <FiCopy />
        </button>
      </div>
      {menuOpen && (
        <div className='border-base-300 bg-base-100 mb-2 grid grid-cols-2 gap-1 rounded-xl border p-1.5 shadow-lg'>
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type='button'
              onClick={() => {
                addSlide(l.id);
                setMenuOpen(false);
              }}
              className='hover:bg-base-200 rounded-lg px-2 py-1.5 text-left text-xs'>
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div className='flex flex-col gap-2'>
        {currentDeck.sections.map((section) => (
          <SectionGroup
            key={section.id}
            deck={currentDeck}
            section={section}
            thumbW={thumbW}
            activeSlideId={activeSlideId}
            onRename={(id, title) => setSections((s) => renameSection(s, id, title))}
            onRemoveSection={(id) => setSections((s) => deleteSection(s, id))}
            onMoveSection={(id, dir) => setSections((s) => moveSection(s, id, dir))}
            onAddSlide={(id, sid) => setSections((s) => sectionAddSlide(s, id, sid))}
            onRemoveSlide={(id, sid) => setSections((s) => sectionRemoveSlide(s, id, sid))}
            overIndex={(i) => overIndex === i}
            {...thumbProps}
          />
        ))}

        {currentDeck.sections.length > 0 &&
          currentDeck.slides.filter((s) => !sectioned.has(s.id)).length === 0 && (
            <p className='py-4 text-center text-[11px] opacity-40'>All slides are in sections.</p>
          )}

        {currentDeck.slides.map((s, i) =>
          sectioned.has(s.id) ? null : (
            <SlideThumb
              key={s.id}
              deckId={currentDeck.id}
              slideId={s.id}
              index={i}
              thumbW={thumbW}
              over={overIndex === i}
              active={activeSlideId === s.id}
              {...thumbProps}
            />
          ),
        )}
      </div>

      {reuseOpen && <ReuseSlidesModal onClose={() => setReuseOpen(false)} />}
    </div>
  );
};
