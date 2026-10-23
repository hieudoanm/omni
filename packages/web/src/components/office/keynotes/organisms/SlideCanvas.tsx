'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { Point, SlideObject } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { ObjectRenderer } from '@/components/office/keynotes/organisms/ObjectRenderer';
import { newDrawingObject, newImageObject } from '@/lib/office/keynotes/deckFactory';
import {
  textStyleCss,
  VerticalAlignStyle,
} from '@/components/office/keynotes/organisms/ObjectContent';
import {
  SelectionOverlay,
  type HandleName,
} from '@/components/office/keynotes/organisms/SelectionOverlay';
import {
  frameOfObjects,
  hitTest,
  moveSelection,
  normalizeAngle,
  resizeSelection,
  resolveSelection,
  rotateSelection,
} from '@/components/office/keynotes/organisms/canvasOps';
import { clamp } from '@/lib/office/keynotes/geometry';

interface DragState {
  mode: 'move' | 'resize' | 'rotate' | 'marquee';
  start: Point;
  originals: SlideObject[];
  others: Array<{ x: number; y: number; w: number; h: number }>;
  handle?: HandleName;
  rotate?: {
    cx: number;
    cy: number;
    startAngle: number;
    startRotation: number;
  };
  marqueeStart?: Point;
  moved: boolean;
}

const ZOOM_MIN = 0.1;
const ZOOM_MAX = 4;

export const SlideCanvas = ({
  zoom,
  setZoom,
  readOnly = false,
  onBackgroundClick,
  view = { gridlines: false, snap: true, rulers: false },
  drawMode = false,
}: {
  zoom: number;
  setZoom: (z: number) => void;
  readOnly?: boolean;
  onBackgroundClick?: (point: Point) => void;
  view?: { gridlines: boolean; snap: boolean; rulers: boolean };
  drawMode?: boolean;
}) => {
  const {
    currentDeck,
    activeSlide,
    activeSlideId,
    selectedObjectIds,
    setSelection,
    selectObject,
    updateObject,
    mutateLive,
    snapshotHistory,
    addObject,
  } = useDeck();

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const drawingRef = useRef<Point[] | null>(null);
  const [liveStroke, setLiveStroke] = useState<Point[]>([]);
  const [guides, setGuides] = useState<{ xs: number[]; ys: number[] }>({
    xs: [],
    ys: [],
  });
  const [marquee, setMarquee] = useState<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const editingRef = useRef<HTMLDivElement>(null);

  const deck = currentDeck;
  const slide = activeSlide;

  const toSlidePoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left) / zoom,
        y: (clientY - rect.top) / zoom,
      };
    },
    [zoom],
  );

  useEffect(() => {
    if (editingTextId) {
      const el = editingRef.current;
      if (el) {
        el.focus();
        const sel = window.getSelection();
        sel?.selectAllChildren(el);
      }
    }
  }, [editingTextId]);

  const commitText = useCallback(() => {
    const el = editingRef.current;
    if (el && editingTextId) {
      updateObject(editingTextId, { text: el.innerText });
    }
    setEditingTextId(null);
  }, [editingTextId, updateObject]);

  const transformObjects = useCallback(
    (fn: (objects: SlideObject[]) => SlideObject[]) => {
      if (!activeSlideId) return;
      mutateLive((d) => ({
        ...d,
        slides: d.slides.map((s) =>
          s.id === activeSlideId ? { ...s, objects: fn(s.objects) } : s,
        ),
      }));
    },
    [activeSlideId, mutateLive],
  );

  const startMove = useCallback(
    (e: ReactPointerEvent, target: SlideObject) => {
      e.preventDefault();
      if (readOnly || !slide) return;
      const p = toSlidePoint(e.clientX, e.clientY);
      const current = resolveSelection(slide.objects, selectedObjectIds);
      const clicked = resolveSelection(slide.objects, [target.id]);
      if (clicked.length === 0) return;
      if (!current.some((o) => o.id === clicked[0].id)) {
        selectObject(clicked[0].id, e.shiftKey);
      }
      const originals = current.some((o) => o.id === clicked[0].id) ? current : clicked;
      const primary = clicked[0];
      const primaryChildren = primary.kind === 'group' ? primary.children : [];
      const others = slide.objects.filter(
        (o) =>
          !(
            o.id === primary.id ||
            (o.group && o.group === primary.id) ||
            primaryChildren.includes(o.id)
          ),
      );
      dragRef.current = {
        mode: 'move',
        start: p,
        originals,
        others: others.map((o) => ({ x: o.x, y: o.y, w: o.w, h: o.h })),
        moved: false,
      };
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [readOnly, slide, selectedObjectIds, selectObject, toSlidePoint],
  );

  const startHandle = useCallback(
    (handle: HandleName, e: ReactPointerEvent) => {
      e.preventDefault();
      if (readOnly || !slide) return;
      const p = toSlidePoint(e.clientX, e.clientY);
      const resolved = resolveSelection(slide.objects, selectedObjectIds);
      const primary = resolved[0];
      if (!primary || resolved.length > 1) return;
      dragRef.current = {
        mode: 'resize',
        start: p,
        originals: [primary],
        others: [],
        handle,
        moved: false,
      };
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [readOnly, slide, selectedObjectIds, toSlidePoint],
  );

  const startRotate = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      if (readOnly || !slide) return;
      const p = toSlidePoint(e.clientX, e.clientY);
      const resolved = resolveSelection(slide.objects, selectedObjectIds);
      const primary = resolved[0];
      if (!primary || resolved.length > 1) return;
      const cx = primary.x + primary.w / 2;
      const cy = primary.y + primary.h / 2;
      dragRef.current = {
        mode: 'rotate',
        start: p,
        originals: [primary],
        others: [],
        rotate: {
          cx,
          cy,
          startAngle: Math.atan2(p.y - cy, p.x - cx) * (180 / Math.PI),
          startRotation: primary.rotation,
        },
        moved: false,
      };
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [readOnly, slide, selectedObjectIds, toSlidePoint],
  );

  const handleContainerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (readOnly || e.button !== 0) return;
      if (drawMode) {
        e.preventDefault();
        const p = toSlidePoint(e.clientX, e.clientY);
        drawingRef.current = [p];
        setLiveStroke([p]);
        containerRef.current?.setPointerCapture(e.pointerId);
        return;
      }
      if (editingTextId) commitText();
      const p = toSlidePoint(e.clientX, e.clientY);
      if (onBackgroundClick) onBackgroundClick(p);
      if (!e.shiftKey) setSelection([]);
      dragRef.current = {
        mode: 'marquee',
        start: p,
        originals: [],
        others: [],
        marqueeStart: p,
        moved: false,
      };
      setMarquee({ x0: p.x, y0: p.y, x1: p.x, y1: p.y });
      containerRef.current?.setPointerCapture(e.pointerId);
    },
    [readOnly, drawMode, editingTextId, commitText, onBackgroundClick, setSelection, toSlidePoint],
  );

  const handleContainerMove = useCallback(
    (e: ReactPointerEvent) => {
      const p = toSlidePoint(e.clientX, e.clientY);
      if (drawingRef.current) {
        drawingRef.current = [...drawingRef.current, p];
        setLiveStroke(drawingRef.current);
        return;
      }
      const drag = dragRef.current;
      if (!drag || !slide || !deck) return;
      if (drag.mode === 'move') {
        const dx = p.x - drag.start.x;
        const dy = p.y - drag.start.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        drag.moved = true;
        const result = moveSelection(
          slide.objects,
          drag.originals,
          drag.others,
          dx,
          dy,
          deck.width,
          deck.height,
          { snap: view.snap, grid: view.gridlines ? 20 : undefined },
        );
        transformObjects(() => result.objects);
        setGuides(result.guides);
      } else if (drag.mode === 'resize' && drag.handle) {
        const dx = p.x - drag.start.x;
        const dy = p.y - drag.start.y;
        drag.moved = true;
        transformObjects((objects) =>
          resizeSelection(objects, drag.originals, drag.handle!, dx, dy),
        );
      } else if (drag.mode === 'rotate' && drag.rotate) {
        const r = drag.rotate;
        const angle = Math.atan2(p.y - r.cy, p.x - r.cx) * (180 / Math.PI);
        drag.moved = true;
        transformObjects((objects) =>
          rotateSelection(
            objects,
            drag.originals,
            normalizeAngle(r.startRotation + angle - r.startAngle),
          ),
        );
      } else if (drag.mode === 'marquee' && drag.marqueeStart) {
        const s = drag.marqueeStart;
        setMarquee({ x0: s.x, y0: s.y, x1: p.x, y1: p.y });
        const rect = {
          x: Math.min(s.x, p.x),
          y: Math.min(s.y, p.y),
          w: Math.abs(p.x - s.x),
          h: Math.abs(p.y - s.y),
        };
        const hits = slide.objects
          .filter(
            (o) => !o.locked && hitTest(o, { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 }),
          )
          .map((o) => o.id);
        setSelection(hits.length > 0 ? hits : []);
      }
    },
    [slide, deck, transformObjects, toSlidePoint, setSelection, view],
  );

  const handleContainerUp = useCallback(() => {
    const stroke = drawingRef.current;
    drawingRef.current = null;
    if (stroke && stroke.length > 1 && deck) {
      const PAD = 12;
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of stroke) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      const x = minX - PAD;
      const y = minY - PAD;
      const w = Math.max(maxX - minX + PAD * 2, 8);
      const h = Math.max(maxY - minY + PAD * 2, 8);
      addObject(
        newDrawingObject({
          x,
          y,
          w,
          h,
          color: deck.theme.colors.accent,
          width: 6,
          strokes: [stroke.map((p) => ({ x: p.x - x, y: p.y - y }))],
        }),
      );
    }
    setLiveStroke([]);
    const drag = dragRef.current;
    dragRef.current = null;
    setMarquee(null);
    if (drag?.moved) snapshotHistory();
    setGuides({ xs: [], ys: [] });
  }, [snapshotHistory, deck, addObject]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (readOnly || !slide) return;
      const files = Array.from(e.dataTransfer?.files ?? []);
      const img = files.find((f) => f.type.startsWith('image/'));
      if (!img) return;
      const p = toSlidePoint(e.clientX, e.clientY);
      const reader = new FileReader();
      reader.onload = () => {
        addObject(
          newImageObject({
            src: reader.result as string,
            x: p.x - 200,
            y: p.y - 120,
            w: 400,
            h: 240,
          }),
        );
      };
      reader.readAsDataURL(img);
    },
    [readOnly, slide, toSlidePoint, addObject],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      setZoom(clamp(zoom * (e.deltaY < 0 ? 1.1 : 0.9), ZOOM_MIN, ZOOM_MAX));
    },
    [zoom, setZoom],
  );

  const handleObjectDoubleClick = useCallback(
    (obj: SlideObject) => {
      if (readOnly) return;
      if (obj.kind === 'text' || (obj.kind === 'shape' && obj.text)) {
        setEditingTextId(obj.id);
      }
    },
    [readOnly],
  );

  if (!deck || !slide) {
    return (
      <div className='flex h-full items-center justify-center text-sm opacity-50'>
        No slide selected
      </div>
    );
  }

  const theme = deck.theme;
  const selectedSet = new Set(selectedObjectIds);
  const frame = frameOfObjects(resolveSelection(slide.objects, selectedObjectIds));
  const ordered = [...slide.objects].sort((a, b) => a.z - b.z);

  return (
    <div
      ref={containerRef}
      className='relative h-full w-full overflow-hidden bg-neutral-950'
      style={{
        touchAction: 'none',
        cursor: drawMode || marquee ? 'crosshair' : undefined,
      }}
      onPointerDown={handleContainerDown}
      onPointerMove={handleContainerMove}
      onPointerUp={handleContainerUp}
      onPointerCancel={handleContainerUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onWheel={handleWheel}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: deck.width * zoom,
          height: deck.height * zoom,
        }}>
        <div
          style={{
            width: deck.width,
            height: deck.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            backgroundColor: theme.colors.background,
            position: 'relative',
            overflow: 'hidden',
          }}>
          {slide.background &&
            slide.background.type === 'solid' &&
            slide.background.color !== theme.colors.background && (
              <div
                className='absolute inset-0'
                style={{
                  backgroundColor: slide.background.color,
                  opacity: slide.background.opacity,
                }}
              />
            )}
          {view.gridlines && (
            <div
              className='pointer-events-none absolute inset-0'
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          )}
          {ordered.map((o) => {
            const group = o.group
              ? (slide.objects.find((g) => g.id === o.group && g.kind === 'group') as
                  Extract<SlideObject, { kind: 'group' }> | undefined)
              : undefined;
            return (
              <div
                key={o.id}
                onPointerDown={(e) => {
                  if (drawMode) return;
                  e.stopPropagation();
                  startMove(e, o);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleObjectDoubleClick(o);
                }}
                style={{
                  position: 'absolute',
                  left: o.x,
                  top: o.y,
                  width: o.w,
                  height: o.h,
                  zIndex: o.z,
                  cursor: o.locked ? 'not-allowed' : readOnly ? 'default' : 'move',
                }}>
                <ObjectRenderer obj={o} parentGroup={group} editing={o.id === editingTextId} />
              </div>
            );
          })}

          {editingTextId &&
            (() => {
              const obj = slide.objects.find((o) => o.id === editingTextId);
              if (!obj) return null;
              return (
                <div
                  ref={editingRef}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={commitText}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      commitText();
                    }
                    if (e.key === 'Escape') setEditingTextId(null);
                    e.stopPropagation();
                  }}
                  className='absolute z-[9999] outline-none'
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.w,
                    minHeight: obj.h,
                    ...textStyleCss(obj.kind === 'text' ? obj.style : defaultTextStyle),
                    ...VerticalAlignStyle[obj.kind === 'text' ? obj.style.vertical : 'middle'],
                  }}
                />
              );
            })()}

          {liveStroke.length > 1 && (
            <svg
              className='pointer-events-none absolute inset-0'
              viewBox={`0 0 ${deck.width} ${deck.height}`}
              preserveAspectRatio='none'>
              <polyline
                points={liveStroke.map((p) => `${p.x},${p.y}`).join(' ')}
                fill='none'
                stroke={deck.theme.colors.accent}
                strokeWidth={6}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}

          <SelectionOverlay
            frame={frame}
            multiple={selectedObjectIds.length > 1}
            guides={guides}
            marquee={marquee}
            readOnly={readOnly}
            onHandleDown={startHandle}
            onRotateDown={startRotate}
          />
        </div>
      </div>
    </div>
  );
};

const defaultTextStyle = {
  fontFamily: 'sans' as const,
  fontSize: 18,
  color: '#ffffff',
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  lineHeight: 1.3,
  letterSpacing: 0,
  align: 'center' as const,
  bullet: false,
  numbered: false,
  vertical: 'middle' as const,
};
