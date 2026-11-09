'use client';

import type { Point, SlideObject } from '@/types/keynotes/deck';
import {
  buildSnapTargets,
  clamp,
  resizeObject,
  snapRect,
  type Snapped,
} from '@/lib/office/keynotes/geometry';
import type {
  HandleName,
  SelectionFrame,
  SnapGuides,
} from '@/components/office/keynotes/organisms/SelectionOverlay';

export const normalizeAngle = (deg: number): number => ((deg % 360) + 360) % 360;

export const hitTest = (o: { x: number; y: number; w: number; h: number }, p: Point): boolean =>
  p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h;

export const frameOfObjects = (objects: SlideObject[]): SelectionFrame | null => {
  if (objects.length === 0) return null;
  const minX = Math.min(...objects.map((o) => o.x));
  const minY = Math.min(...objects.map((o) => o.y));
  const maxX = Math.max(...objects.map((o) => o.x + o.w));
  const maxY = Math.max(...objects.map((o) => o.y + o.h));
  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
    rotation: objects.length === 1 ? objects[0].rotation : 0,
    locked: objects.some((o) => o.locked),
  };
};

export const resolveSelection = (objects: SlideObject[], ids: string[]): SlideObject[] => {
  const byId = new Map(objects.map((o) => [o.id, o]));
  const seen = new Set<string>();
  const out: SlideObject[] = [];
  for (const id of ids) {
    const o = byId.get(id);
    if (!o) continue;
    const target = o.group ? byId.get(o.group) : o;
    if (target && !seen.has(target.id)) {
      seen.add(target.id);
      out.push(target);
    }
  }
  return out;
};

export const moveSelection = (
  objects: SlideObject[],
  originals: SlideObject[],
  others: Array<{ x: number; y: number; w: number; h: number }>,
  dx: number,
  dy: number,
  width: number,
  height: number,
  opts: { snap?: boolean; grid?: number } = {},
): { objects: SlideObject[]; guides: SnapGuides } => {
  const { snap = true, grid } = opts;
  if (originals.length === 0) return { objects, guides: { xs: [], ys: [] } };
  const primary = originals[0];
  const target = {
    x: primary.x + dx,
    y: primary.y + dy,
    w: primary.w,
    h: primary.h,
  };
  let snapped: Snapped = {
    x: target.x,
    y: target.y,
    snappedX: false,
    snappedY: false,
  };
  if (snap) {
    const targets = buildSnapTargets(width, height, others);
    snapped = snapRect(target, targets, width, height);
  }
  if (grid && grid > 1) {
    snapped.x = clamp(Math.round(snapped.x / grid) * grid, 0, Math.max(0, width - primary.w));
    snapped.y = clamp(Math.round(snapped.y / grid) * grid, 0, Math.max(0, height - primary.h));
  }
  const ndx = snapped.x - primary.x;
  const ndy = snapped.y - primary.y;
  if (ndx === 0 && ndy === 0) return { objects, guides: { xs: [], ys: [] } };
  const ids = new Set(originals.map((o) => o.id));
  const groupIds = new Set(originals.filter((o) => o.kind === 'group').map((o) => o.id));
  return {
    objects: objects.map((o) => {
      if (ids.has(o.id) || (o.group && groupIds.has(o.group))) {
        return { ...o, x: o.x + ndx, y: o.y + ndy };
      }
      return o;
    }),
    guides: {
      xs: snapped.snappedX ? [snapped.x] : [],
      ys: snapped.snappedY ? [snapped.y] : [],
    },
  };
};

export const resizeSelection = (
  objects: SlideObject[],
  originals: SlideObject[],
  handle: HandleName,
  dx: number,
  dy: number,
): SlideObject[] => {
  const primary = originals[0];
  if (!primary) return objects;
  const aspect =
    primary.aspectLock && primary.w > 0 && primary.h > 0 ? primary.w / primary.h : undefined;
  const newRect = resizeObject(primary, handle, dx, dy, 8, 8, aspect);
  const ids = new Set(originals.map((o) => o.id));
  if (primary.kind === 'group') {
    const sx = newRect.w / primary.w;
    const sy = newRect.h / primary.h;
    return objects.map((o) => {
      if (o.id === primary.id) {
        return { ...o, x: newRect.x, y: newRect.y, w: newRect.w, h: newRect.h };
      }
      if (o.group === primary.id) {
        return {
          ...o,
          x: primary.x + (o.x - primary.x) * sx,
          y: primary.y + (o.y - primary.y) * sy,
          w: o.w * sx,
          h: o.h * sy,
        };
      }
      return o;
    });
  }
  return objects.map((o) => (ids.has(o.id) ? { ...o, ...newRect } : o));
};

export const rotateSelection = (
  objects: SlideObject[],
  originals: SlideObject[],
  angle: number,
): SlideObject[] => {
  const primary = originals[0];
  if (!primary) return objects;
  const rot = normalizeAngle(angle);
  return objects.map((o) => (o.id === primary.id ? { ...o, rotation: rot } : o));
};
