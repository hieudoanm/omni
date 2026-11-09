'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiChevronLeft, FiChevronRight, FiClock, FiLoader } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlidePreview } from '@/components/office/keynotes/organisms/SlidePreview';
import { RehearsalSummary } from '@/components/office/keynotes/molecules/RehearsalSummary';
import { renderMarkdown } from '@/lib/office/keynotes/markdown';
import { formatDuration } from '@/lib/office/keynotes/format';

const PresenterView: FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentDeck, openDeck, closeDeck, questions } = useDeck();

  const [slideIndex, setSlideIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clock, setClock] = useState('');
  const [perSlide, setPerSlide] = useState(0);
  const [rehearse, setRehearse] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [slideTimes, setSlideTimes] = useState<Record<number, number>>({});
  const countRef = useRef(0);
  const enterRef = useRef(Date.now());

  const goto = (dir: -1 | 1) =>
    setSlideIndex((i) => {
      const max = Math.max(countRef.current - 1, 0);
      return Math.min(Math.max(i + dir, 0), max);
    });

  useEffect(() => {
    if (id) void openDeck(id);
    return () => closeDeck();
  }, [id, openDeck, closeDeck]);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setClock(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
      setPerSlide(Math.max(Math.round((Date.now() - enterRef.current) / 1000), 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const prev = slideIndex - 1;
    if (prev >= 0) {
      const dur = Math.max(Math.round((Date.now() - enterRef.current) / 1000), 0);
      setSlideTimes((times) => ({
        ...times,
        [prev]: (times[prev] ?? 0) + dur,
      }));
    }
    enterRef.current = Date.now();
    setPerSlide(0);
  }, [slideIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
      else if (['ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        goto(1);
      } else if (['ArrowLeft', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        goto(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  if (!currentDeck) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-sm opacity-50'>
        <FiLoader className='size-5 animate-spin' />
        Starting presenter view…
      </div>
    );
  }

  const slides = currentDeck.slides.filter((s) => !s.hidden);
  countRef.current = slides.length;
  const slide = slides[Math.min(slideIndex, slides.length - 1)];
  const next = slides[slideIndex + 1];
  const unanswered = questions.filter((q) => !q.answered);
  const currentTime = rehearse ? perSlide : 0;

  return (
    <div className='flex h-screen bg-neutral-950 text-white'>
      <div className='flex min-w-0 flex-1 flex-col gap-4 p-6'>
        <div className='flex min-h-0 flex-1 items-center justify-center'>
          <SlidePreview
            deck={currentDeck}
            slide={slide}
            width={960}
            slideNumber={slides.indexOf(slide) + 1}
            className='shadow-2xl'
          />
        </div>
        <div className='flex items-center gap-4'>
          {next ? (
            <div className='flex items-center gap-2 text-xs text-white/50'>
              <span>Up next:</span>
              <SlidePreview deck={currentDeck} slide={next} width={200} />
            </div>
          ) : (
            <span className='text-xs text-white/40'>End of deck</span>
          )}
          <div className='ml-auto flex items-center gap-2'>
            <button
              type='button'
              onClick={() => goto(-1)}
              disabled={slideIndex === 0}
              className='rounded-lg p-2 hover:bg-white/10 disabled:opacity-30'>
              <FiChevronLeft className='size-5' />
            </button>
            <span className='w-16 text-center text-sm'>
              {slides.indexOf(slide) + 1} / {slides.length}
            </span>
            <button
              type='button'
              onClick={() => goto(1)}
              disabled={slideIndex === slides.length - 1}
              className='rounded-lg p-2 hover:bg-white/10 disabled:opacity-30'>
              <FiChevronRight className='size-5' />
            </button>
          </div>
        </div>
      </div>

      <div className='flex w-80 shrink-0 flex-col gap-4 border-l border-white/10 bg-neutral-900 p-4'>
        <div className='flex items-center justify-between'>
          <div className='text-xs font-semibold tracking-wide text-white/40 uppercase'>
            Speaker notes
          </div>
          <button
            type='button'
            onClick={() => setRehearse((r) => !r)}
            className={`btn btn-xs gap-1 ${rehearse ? 'btn-primary' : 'btn-outline'}`}
            title='Track time per slide and get pacing feedback'>
            <FiClock className='size-3.5' /> {rehearse ? 'Rehearsing' : 'Rehearse'}
          </button>
        </div>
        <div className='no-scrollbar max-h-56 min-h-24 flex-1 overflow-y-auto text-sm text-white/80'>
          {slide.notes.trim() ? (
            renderMarkdown(slide.notes)
          ) : (
            <p className='text-white/30'>No notes for this slide.</p>
          )}
        </div>
        <div className='flex items-center justify-between border-t border-white/10 pt-3 text-sm'>
          <span className='text-white/50'>Clock</span>
          <span className='tabular-nums'>{clock}</span>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-white/50'>Deck time</span>
          <span className='tabular-nums'>{formatDuration(elapsed)}</span>
        </div>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-white/50'>Slide time</span>
          <span className='tabular-nums'>{formatDuration(currentTime)}</span>
        </div>
        {rehearse && (
          <button
            type='button'
            onClick={() => setShowSummary(true)}
            className='btn btn-outline btn-sm'>
            Finish &amp; view summary
          </button>
        )}
        <div className='flex items-center justify-between border-t border-white/10 pt-3 text-sm'>
          <span className='text-white/50'>Q&A</span>
          <span className='text-amber-400'>{unanswered.length} unanswered</span>
        </div>
        <button
          type='button'
          onClick={() => router.push(`/present/${currentDeck.id}`)}
          className='btn btn-primary btn-sm mt-auto'>
          Enter present mode
        </button>
      </div>

      {showSummary && (
        <RehearsalSummary
          slideNames={slides.map((s) => s.name)}
          times={slideTimes}
          total={elapsed}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
};

export default PresenterView;
