'use client';

import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiLoader,
  FiMinimize,
  FiX,
} from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { PresentSlide } from '@/components/office/keynotes/molecules/PresentSlide';
import { AnnotationOverlay } from '@/components/office/keynotes/molecules/AnnotationOverlay';
import { PresentTools } from '@/components/office/keynotes/molecules/PresentTools';
import {
  BlackoutOverlay,
  type ScreenMode,
} from '@/components/office/keynotes/molecules/BlackoutOverlay';
import { CaptionsBar } from '@/components/office/keynotes/molecules/CaptionsBar';
import { presentSteps } from '@/lib/office/keynotes/presentSteps';
import { transitionClass, transitionTiming } from '@/lib/office/keynotes/animations';
import { useCaptions } from '@/hooks/office/keynotes/useCaptions';
import { formatDuration } from '@/lib/office/keynotes/format';
import type { AnnotationTool } from '@/lib/office/keynotes/annotations';
import type { Slide } from '@/types/keynotes/deck';

const isTyping = (e: KeyboardEvent): boolean => {
  const target = e.target as HTMLElement | null;
  return Boolean(
    target &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable),
  );
};

const PresentPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentDeck, openDeck, closeDeck, addQuestion } = useDeck();

  const [slideIndex, setSlideIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [scale, setScale] = useState(0.5);
  const [elapsed, setElapsed] = useState(0);
  const [clock, setClock] = useState('');
  const [qaOpen, setQaOpen] = useState(false);
  const [qText, setQText] = useState('');
  const [annotTool, setAnnotTool] = useState<AnnotationTool | 'off'>('off');
  const [annotColor, setAnnotColor] = useState('#ffd60a');
  const [clearNonce, setClearNonce] = useState(0);
  const [screenMode, setScreenMode] = useState<ScreenMode>('normal');
  const [spotlight, setSpotlight] = useState({ on: false, x: 0, y: 0 });
  const captions = useCaptions();

  const slideIndexRef = useRef(0);
  const stepRef = useRef(0);
  const prevSlideRef = useRef<Slide | null>(null);
  slideIndexRef.current = slideIndex;
  stepRef.current = step;

  useEffect(() => {
    if (id) void openDeck(id);
    return () => closeDeck();
  }, [id, openDeck, closeDeck]);

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1900, window.innerHeight / 1100));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setClock(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const slides = currentDeck ? currentDeck.slides.filter((s) => !s.hidden) : [];
  const slide = slides.length ? slides[Math.min(slideIndex, slides.length - 1)] : undefined;
  const steps = slide ? presentSteps(slide.objects) : [];

  useEffect(() => {
    if (slide) prevSlideRef.current = slide;
  }, [slide]);

  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const advance = useCallback(() => {
    const current = slideIndexRef.current;
    const s = slidesRef.current;
    if (!s[current]) return;
    if (stepRef.current < presentSteps(s[current].objects).length) {
      setStep(stepRef.current + 1);
      return;
    }
    if (current < s.length - 1) {
      setSlideIndex(current + 1);
      setStep(0);
    }
  }, []);

  const goBack = useCallback(() => {
    const current = slideIndexRef.current;
    const s = slidesRef.current;
    if (stepRef.current > 0) {
      setStep(stepRef.current - 1);
      return;
    }
    if (current > 0) {
      setSlideIndex(current - 1);
      setStep(presentSteps(s[current - 1].objects).length);
    }
  }, []);

  const goToSlideById = useCallback((id: string) => {
    const idx = slidesRef.current.findIndex((s) => s.id === id);
    if (idx >= 0) {
      setSlideIndex(idx);
      setStep(0);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const key = e.key.toLowerCase();
      if (e.key === 'Escape') {
        router.back();
      } else if (['arrowright', ' ', 'enter', 'pagedown'].includes(key)) {
        e.preventDefault();
        advance();
      } else if (['arrowleft', 'backspace', 'pageup'].includes(key)) {
        e.preventDefault();
        goBack();
      } else if (key === 'b') {
        setScreenMode((m) => (m === 'black' ? 'normal' : 'black'));
      } else if (key === 'w') {
        setScreenMode((m) => (m === 'white' ? 'normal' : 'white'));
      } else if (key === 's') {
        setSpotlight((s) => ({ ...s, on: !s.on }));
      } else if (key === 'p') {
        setAnnotTool((t) => (t === 'pen' ? 'off' : 'pen'));
      } else if (key === 'l') {
        setAnnotTool((t) => (t === 'laser' ? 'off' : 'laser'));
      } else if (key === 'h') {
        setAnnotTool((t) => (t === 'highlighter' ? 'off' : 'highlighter'));
      } else if (key === 'e') {
        setAnnotTool((t) => (t === 'eraser' ? 'off' : 'eraser'));
      } else if (key === 'c') {
        setClearNonce((n) => n + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, goBack, router]);

  useEffect(() => {
    if (!slide?.autoAdvance) return;
    const t = setTimeout(advance, slide.autoAdvance * 1000);
    return () => clearTimeout(t);
  }, [slideIndex, step, slide?.autoAdvance, advance]);

  if (!currentDeck) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-sm opacity-50'>
        <FiLoader className='size-5 animate-spin' />
        Starting presentation…
      </div>
    );
  }

  if (!slide) return null;
  const trans = slide.transition;
  const isMorph = trans?.effect === 'morph';
  const transCls = isMorph ? '' : transitionClass(trans?.effect ?? 'none');
  const transStyle: Record<string, string> = {};
  if (!isMorph && trans?.duration) transStyle.animationDuration = `${trans.duration}ms`;
  if (!isMorph && trans?.bounciness && trans.bounciness > 0) {
    transStyle.animationTimingFunction = transitionTiming(trans.bounciness);
  }

  return (
    <div className='flex h-screen flex-col bg-black'>
      <div className='relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-6'>
        <div
          className='relative shrink-0'
          style={{
            width: currentDeck.width * scale,
            height: currentDeck.height * scale,
            transform: spotlight.on ? 'scale(2.2)' : undefined,
            transformOrigin: `${spotlight.x}px ${spotlight.y}px`,
            cursor: spotlight.on ? 'zoom-out' : undefined,
          }}
          onPointerMove={(e) => {
            if (!spotlight.on) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setSpotlight({
              on: true,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}>
          <div key={slide.id} className={`absolute top-0 left-0 ${transCls}`} style={transStyle}>
            <PresentSlide
              deck={currentDeck}
              slide={slide}
              step={step}
              slideNumber={slides.indexOf(slide) + 1}
              className='shadow-2xl'
              onSlideLink={goToSlideById}
              morphFrom={isMorph ? prevSlideRef.current : null}
            />
          </div>
          <AnnotationOverlay
            width={currentDeck.width}
            height={currentDeck.height}
            scale={scale}
            tool={annotTool}
            color={annotColor}
            clearNonce={clearNonce}
          />
        </div>

        <PresentTools
          tool={annotTool}
          onTool={setAnnotTool}
          color={annotColor}
          onColor={setAnnotColor}
          onClear={() => setClearNonce((n) => n + 1)}
          blackoutOn={screenMode === 'black'}
          onBlackout={() => setScreenMode((m) => (m === 'black' ? 'normal' : 'black'))}
          whiteoutOn={screenMode === 'white'}
          onWhiteout={() => setScreenMode((m) => (m === 'white' ? 'normal' : 'white'))}
          spotlightOn={spotlight.on}
          onSpotlight={() => setSpotlight((s) => ({ ...s, on: !s.on }))}
          captionsSupported={captions.supported}
          captionsOn={captions.listening}
          onCaptions={captions.toggle}
        />

        <BlackoutOverlay mode={screenMode} />
        <CaptionsBar text={captions.text} listening={captions.listening} />
      </div>

      <div className='flex h-12 shrink-0 items-center gap-3 bg-neutral-900 px-4 text-sm text-white/70'>
        <button
          type='button'
          onClick={goBack}
          disabled={slideIndex === 0 && step === 0}
          className='rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-30'
          title='Previous (←)'>
          <FiChevronLeft className='size-5' />
        </button>
        <span className='w-16 text-center'>
          {slides.indexOf(slide) + 1} / {slides.length}
        </span>
        <button
          type='button'
          onClick={advance}
          disabled={slideIndex === slides.length - 1 && step >= steps.length}
          className='rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-30'
          title='Next (→)'>
          <FiChevronRight className='size-5' />
        </button>
        <div className='ml-auto flex items-center gap-3'>
          {clock && <span className='tabular-nums opacity-60'>{clock}</span>}
          <span className='tabular-nums'>{formatDuration(elapsed)}</span>
          <button
            type='button'
            onClick={() => setQaOpen(true)}
            className='rounded-lg p-1.5 hover:bg-white/10'
            title='Ask a question'>
            <FiHelpCircle className='size-5' />
          </button>
          <button
            type='button'
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen();
              else document.documentElement.requestFullscreen();
            }}
            className='rounded-lg p-1.5 hover:bg-white/10'
            title='Toggle fullscreen'>
            <FiMinimize className='size-5' />
          </button>
          <button
            type='button'
            onClick={() => router.back()}
            className='rounded-lg p-1.5 hover:bg-white/10'
            title='Exit (Esc)'>
            <FiX className='size-5' />
          </button>
        </div>
      </div>

      {qaOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
          onClick={() => setQaOpen(false)}>
          <div
            className='bg-base-100 w-96 rounded-2xl p-4 shadow-2xl'
            onClick={(e) => e.stopPropagation()}>
            <div className='mb-2 text-sm font-semibold'>Ask a question</div>
            <textarea
              autoFocus
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder='Your question will appear in the Q&A feed…'
              className='textarea textarea-bordered w-full resize-none'
              rows={3}
            />
            <div className='mt-2 flex justify-end gap-2'>
              <button
                type='button'
                className='btn btn-ghost btn-sm'
                onClick={() => setQaOpen(false)}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-primary btn-sm'
                onClick={() => {
                  if (qText.trim()) {
                    addQuestion(qText.trim());
                    setQText('');
                    setQaOpen(false);
                  }
                }}>
                Ask
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentPage;
