import type { SlideObject, Point } from '@/types/keynotes/deck';

export const SNAP_THRESHOLD = 6;

export const rectCenter = (o: Pick<SlideObject, 'x' | 'y' | 'w' | 'h'>): Point => ({
  x: o.x + o.w / 2,
  y: o.y + o.h / 2,
});

export interface Snapped {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, v));

export const snapValue = (value: number, targets: number[]): number | null => {
  let best: number | null = null;
  let bestDist = SNAP_THRESHOLD;
  for (const t of targets) {
    const d = Math.abs(value - t);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return best;
};

export const snapRect = (
  rect: { x: number; y: number; w: number; h: number },
  targets: {
    xs: number[];
    ys: number[];
  },
  width: number,
  height: number,
): Snapped => {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const sx = snapValue(rect.x, targets.xs);
  const scx = snapValue(cx, targets.xs);
  const sy = snapValue(rect.y, targets.ys);
  const scy = snapValue(cy, targets.ys);

  let x = rect.x;
  let snappedX = false;
  if (sx !== null) {
    x = sx;
    snappedX = true;
  } else if (scx !== null) {
    x = scx - rect.w / 2;
    snappedX = true;
  }
  x = clamp(x, 0, Math.max(0, width - rect.w));

  let y = rect.y;
  let snappedY = false;
  if (sy !== null) {
    y = sy;
    snappedY = true;
  } else if (scy !== null) {
    y = scy - rect.h / 2;
    snappedY = true;
  }
  y = clamp(y, 0, Math.max(0, height - rect.h));

  return { x, y, snappedX, snappedY };
};

export const buildSnapTargets = (
  width: number,
  height: number,
  others: Array<{ x: number; y: number; w: number; h: number }>,
): { xs: number[]; ys: number[] } => {
  const xs = [0, width / 2, width];
  const ys = [0, height / 2, height];
  for (const o of others) {
    xs.push(o.x, o.x + o.w / 2, o.x + o.w);
    ys.push(o.y, o.y + o.h / 2, o.y + o.h);
  }
  return { xs, ys };
};

export type AlignAction =
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom'
  | 'center-h'
  | 'center-v'
  | 'distribute-h'
  | 'distribute-v';

export const alignObjects = (
  objects: SlideObject[],
  action: AlignAction,
  width: number,
  height: number,
): SlideObject[] => {
  if (objects.length === 0) return objects;
  const minX = Math.min(...objects.map((o) => o.x));
  const maxX = Math.max(...objects.map((o) => o.x + o.w));
  const minY = Math.min(...objects.map((o) => o.y));
  const maxY = Math.max(...objects.map((o) => o.y + o.h));

  const next = objects.map((o) => ({ ...o }));
  const assign = (fn: (o: SlideObject) => SlideObject): SlideObject[] => next.map((o) => fn(o));

  switch (action) {
    case 'left':
      return assign((o) => ({ ...o, x: minX }));
    case 'center':
      return assign((o) => ({ ...o, x: minX + (maxX - minX) / 2 - o.w / 2 }));
    case 'right':
      return assign((o) => ({ ...o, x: maxX - o.w }));
    case 'top':
      return assign((o) => ({ ...o, y: minY }));
    case 'middle':
      return assign((o) => ({ ...o, y: minY + (maxY - minY) / 2 - o.h / 2 }));
    case 'bottom':
      return assign((o) => ({ ...o, y: maxY - o.h }));
    case 'center-h':
      return assign((o) => ({ ...o, x: width / 2 - o.w / 2 }));
    case 'center-v':
      return assign((o) => ({ ...o, y: height / 2 - o.h / 2 }));
    case 'distribute-h': {
      const sorted = [...next].sort((a, b) => a.x - b.x);
      const total = maxX - minX;
      const gap =
        sorted.length > 1 ? (total - sorted.reduce((s, o) => s + o.w, 0)) / (sorted.length - 1) : 0;
      let cursor = minX;
      const map = new Map<string, number>();
      for (const o of sorted) {
        map.set(o.id, cursor);
        cursor += o.w + gap;
      }
      return next.map((o) => ({ ...o, x: map.get(o.id) ?? o.x }));
    }
    case 'distribute-v': {
      const sorted = [...next].sort((a, b) => a.y - b.y);
      const total = maxY - minY;
      const gap =
        sorted.length > 1 ? (total - sorted.reduce((s, o) => s + o.h, 0)) / (sorted.length - 1) : 0;
      let cursor = minY;
      const map = new Map<string, number>();
      for (const o of sorted) {
        map.set(o.id, cursor);
        cursor += o.h + gap;
      }
      return next.map((o) => ({ ...o, y: map.get(o.id) ?? o.y }));
    }
    default:
      return next;
  }
};

export const resizeObject = (
  o: SlideObject,
  anchor: string,
  dx: number,
  dy: number,
  minW = 8,
  minH = 8,
  aspect?: number,
): SlideObject => {
  const { x, y, w, h } = o;
  const isLeft = anchor.includes('w');
  const isTop = anchor.includes('n');
  const isX = anchor.includes('e') || anchor.includes('w');
  const isY = anchor.includes('s') || anchor.includes('n');

  let newW = w;
  let newH = h;
  if (isX) newW = Math.max(minW, w + (isLeft ? -dx : dx));
  if (isY) newH = Math.max(minH, h + (isTop ? -dy : dy));
  if (aspect) {
    const sx = newW / w;
    const sy = newH / h;
    const s = Math.max(sx, sy);
    newW = w * s;
    newH = h * s;
  }
  const nextX = isLeft ? x + w - newW : x;
  const nextY = isTop ? y + h - newH : y;
  return { ...o, x: nextX, y: nextY, w: newW, h: newH };
};
