'use client';

import { useEffect, useRef, useState, type FC } from 'react';
import { useParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { EditorToolbar } from '@/components/office/keynotes/organisms/EditorToolbar';
import { InsertToolbar } from '@/components/office/keynotes/organisms/InsertToolbar';
import { LeftPanel } from '@/components/office/keynotes/organisms/panels/LeftPanel';
import { RightPanel } from '@/components/office/keynotes/organisms/panels/RightPanel';
import { SlideCanvas } from '@/components/office/keynotes/organisms/SlideCanvas';
import { HRuler, VRuler } from '@/components/office/keynotes/organisms/Rulers';
import { useObjectKeyboard } from '@/hooks/office/keynotes/useObjectKeyboard';
import { newImageObject } from '@/lib/office/keynotes/deckFactory';
import { clamp } from '@/lib/office/keynotes/geometry';

export interface CanvasView {
  gridlines: boolean;
  snap: boolean;
  rulers: boolean;
}

const PAD = 64;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;

const isTyping = (t: EventTarget | null): boolean =>
  t instanceof HTMLElement &&
  (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

const EditorPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDeck, openDeck, closeDeck, addObject, setSelection } = useDeck();
  const [zoom, setZoom] = useState(0.5);
  const [view, setView] = useState<CanvasView>({
    gridlines: false,
    snap: true,
    rulers: false,
  });
  const [drawing, setDrawing] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [panning, setPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  useObjectKeyboard();

  useEffect(() => {
    if (id) void openDeck(id);
    return () => closeDeck();
  }, [id, openDeck, closeDeck]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setViewport({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTyping(e.target)) return;
      setSpaceHeld(true);
      e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    const blur = () => {
      setSpaceHeld(false);
      setPanning(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      const img = files.find((f) => f.type.startsWith('image/'));
      if (!img) return;
      e.preventDefault();
      const reader = new FileReader();
      reader.onload = () => {
        addObject(newImageObject({ src: reader.result as string }));
      };
      reader.readAsDataURL(img);
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [addObject]);

  const zoomToFit = () => {
    if (!currentDeck) return;
    setZoom(
      clamp(
        Math.min((viewport.w - PAD) / currentDeck.width, (viewport.h - PAD) / currentDeck.height),
        ZOOM_MIN,
        ZOOM_MAX,
      ),
    );
  };
  const zoomToFill = () => {
    if (!currentDeck) return;
    setZoom(
      clamp(
        Math.max((viewport.w - PAD) / currentDeck.width, (viewport.h - PAD) / currentDeck.height),
        ZOOM_MIN,
        ZOOM_MAX,
      ),
    );
  };

  const onPanDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const wantPan = e.button === 1 || (e.button === 0 && spaceHeld);
    if (!wantPan || !scrollRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    panRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    };
    scrollRef.current.setPointerCapture(e.pointerId);
    setPanning(true);
  };
  const onPanMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = panRef.current;
    if (!p || !scrollRef.current) return;
    scrollRef.current.scrollLeft = p.scrollLeft - (e.clientX - p.startX);
    scrollRef.current.scrollTop = p.scrollTop - (e.clientY - p.startY);
  };
  const onPanUp = () => {
    panRef.current = null;
    setPanning(false);
  };

  if (!currentDeck) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-2 text-sm opacity-50'>
        <FiLoader className='size-5 animate-spin' />
        Opening deck…
      </div>
    );
  }

  const rulerStyle = {
    width: currentDeck.width * zoom,
    height: currentDeck.height * zoom,
  };

  return (
    <div id='main-content' className='flex h-full flex-col'>
      <EditorToolbar
        zoom={zoom}
        setZoom={setZoom}
        onFit={zoomToFit}
        onFill={zoomToFill}
        onActual={() => setZoom(1)}
        view={view}
        setView={setView}
      />
      <InsertToolbar
        drawMode={drawing}
        onToggleDrawing={() => {
          setDrawing((d) => !d);
          setSelection([]);
        }}
      />
      <div className='flex min-h-0 flex-1'>
        <LeftPanel />
        <div
          ref={scrollRef}
          className='no-scrollbar min-w-0 flex-1 overflow-auto bg-neutral-950'
          style={{
            cursor: panning ? 'grabbing' : spaceHeld ? 'grab' : undefined,
            touchAction: 'none',
          }}
          onPointerDownCapture={onPanDown}
          onPointerMoveCapture={onPanMove}
          onPointerUpCapture={onPanUp}
          onPointerCancelCapture={onPanUp}>
          <div className='relative mx-auto my-6' style={rulerStyle}>
            {view.rulers && (
              <>
                <div
                  className='pointer-events-none absolute -top-5 left-0 z-10'
                  style={{ width: currentDeck.width * zoom + 18, height: 20 }}>
                  <HRuler length={currentDeck.width * zoom} zoom={zoom} />
                </div>
                <div
                  className='pointer-events-none absolute top-0 -left-5 z-10'
                  style={{ width: 20, height: currentDeck.height * zoom }}>
                  <VRuler length={currentDeck.height * zoom} zoom={zoom} />
                </div>
              </>
            )}
            <SlideCanvas zoom={zoom} setZoom={setZoom} view={view} drawMode={drawing} />
          </div>
        </div>
        <RightPanel />
      </div>
    </div>
  );
};

export default EditorPage;
