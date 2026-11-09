'use client';

import type { Point } from '@/types/keynotes/deck';

export type HandleName = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export interface SelectionFrame {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  locked?: boolean;
}

export interface SnapGuides {
  xs: number[];
  ys: number[];
}

const HANDLE_POS: Record<HandleName, (f: SelectionFrame) => Point> = {
  nw: (f) => ({ x: f.x, y: f.y }),
  n: (f) => ({ x: f.x + f.w / 2, y: f.y }),
  ne: (f) => ({ x: f.x + f.w, y: f.y }),
  e: (f) => ({ x: f.x + f.w, y: f.y + f.h / 2 }),
  se: (f) => ({ x: f.x + f.w, y: f.y + f.h }),
  s: (f) => ({ x: f.x + f.w / 2, y: f.y + f.h }),
  sw: (f) => ({ x: f.x, y: f.y + f.h }),
  w: (f) => ({ x: f.x, y: f.y + f.h / 2 }),
};

const CURSOR: Record<HandleName, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
};

const HANDLES: HandleName[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const SIZE = 11;

export const SelectionOverlay = ({
  frame,
  multiple,
  guides,
  marquee,
  onHandleDown,
  onRotateDown,
  readOnly,
}: {
  frame: SelectionFrame | null;
  multiple: boolean;
  guides: SnapGuides;
  marquee: { x0: number; y0: number; x1: number; y1: number } | null;
  onHandleDown: (handle: HandleName, e: React.PointerEvent) => void;
  onRotateDown: (e: React.PointerEvent) => void;
  readOnly: boolean;
}) => (
  <div className='pointer-events-none absolute inset-0'>
    {guides.xs.map((x, i) => (
      <div
        key={`vx-${i}`}
        className='absolute top-0 h-full w-px bg-fuchsia-400'
        style={{ left: x }}
      />
    ))}
    {guides.ys.map((y, i) => (
      <div
        key={`hy-${i}`}
        className='absolute left-0 h-px w-full bg-fuchsia-400'
        style={{ top: y }}
      />
    ))}
    {marquee && (
      <div
        className='border-primary/70 bg-primary/10 absolute border border-dashed'
        style={{
          left: Math.min(marquee.x0, marquee.x1),
          top: Math.min(marquee.y0, marquee.y1),
          width: Math.abs(marquee.x1 - marquee.x0),
          height: Math.abs(marquee.y1 - marquee.y0),
        }}
      />
    )}
    {frame && !readOnly && (
      <>
        <div
          className='border-primary absolute border'
          style={{
            left: frame.x - 1,
            top: frame.y - 1,
            width: frame.w + 2,
            height: frame.h + 2,
            transform: `rotate(${frame.rotation}deg)`,
            transformOrigin: 'center',
          }}
        />
        <div
          className='pointer-events-auto absolute cursor-grab touch-none rounded-full border border-white'
          style={{
            left: frame.x + frame.w / 2 - 6,
            top: frame.y - 26,
            width: 12,
            height: 12,
            backgroundColor: 'var(--color-primary)',
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (frame.locked) return;
            onRotateDown(e);
          }}
        />
        {HANDLES.map((h) => {
          const p = HANDLE_POS[h](frame);
          return (
            <div
              key={h}
              className='pointer-events-auto absolute touch-none'
              style={{
                left: p.x - SIZE / 2,
                top: p.y - SIZE / 2,
                width: SIZE,
                height: SIZE,
                cursor: CURSOR[h],
                backgroundColor: frame.locked ? 'transparent' : 'var(--color-primary)',
                border: '1px solid white',
                borderRadius: 2,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                if (frame.locked) return;
                onHandleDown(h, e);
              }}
            />
          );
        })}
      </>
    )}
    {multiple && frame && (
      <div
        className='border-primary absolute border'
        style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
      />
    )}
  </div>
);
