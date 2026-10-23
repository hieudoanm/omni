import {
  alignObjects,
  buildSnapTargets,
  clamp,
  rectCenter,
  resizeObject,
  snapRect,
  snapValue,
} from '@/lib/office/keynotes/geometry';
import type { SlideObject } from '@/types/keynotes/deck';

const obj = (id: string, x: number, y: number, w = 10, h = 10): SlideObject => ({
  id,
  kind: 'shape',
  x,
  y,
  w,
  h,
  z: 0,
  rotation: 0,
  opacity: 1,
  hidden: false,
  locked: false,
  flipH: false,
  flipV: false,
  name: id,
  shapeType: 'rect',
  fill: { type: 'solid', color: '#fff', opacity: 1 },
  stroke: { color: 'transparent', width: 0, dash: 'solid' },
  cornerRadius: 0,
  shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
  text: '',
});

describe('clamp', () => {
  it('clamps values into the given range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('rectCenter', () => {
  it('returns the center point of a rect', () => {
    expect(rectCenter({ x: 0, y: 0, w: 100, h: 50 })).toEqual({ x: 50, y: 25 });
  });
});

describe('snapValue', () => {
  it('returns null when nothing is close', () => {
    expect(snapValue(50, [0, 100])).toBeNull();
  });
  it('returns the nearest target within the threshold', () => {
    expect(snapValue(3, [0, 100])).toBe(0);
  });
});

describe('snapRect', () => {
  it('snaps edges and clamps to the slide bounds', () => {
    const targets = { xs: [0, 100], ys: [0, 100] };
    const snapped = snapRect({ x: 2, y: -5, w: 20, h: 20 }, targets, 200, 200);
    expect(snapped.snappedX).toBe(true);
    expect(snapped.x).toBe(0);
    expect(snapped.y).toBe(0);
  });
  it('snaps centers', () => {
    const targets = { xs: [50], ys: [50] };
    const snapped = snapRect({ x: 43, y: 43, w: 20, h: 20 }, targets, 200, 200);
    expect(snapped.snappedX).toBe(true);
    expect(snapped.x).toBe(40);
  });
});

describe('buildSnapTargets', () => {
  it('includes slide edges/center and object edges/centers', () => {
    const targets = buildSnapTargets(200, 100, [{ x: 10, y: 10, w: 20, h: 20 }]);
    expect(targets.xs).toContain(0);
    expect(targets.xs).toContain(100);
    expect(targets.xs).toContain(200);
    expect(targets.xs).toContain(10);
    expect(targets.xs).toContain(20);
    expect(targets.xs).toContain(30);
  });
});

describe('alignObjects', () => {
  it('aligns to the left edge of the selection', () => {
    const aligned = alignObjects([obj('a', 10, 0), obj('b', 50, 0)], 'left', 200, 200);
    expect(aligned.every((o) => o.x === 10)).toBe(true);
  });
  it('centers horizontally in the slide', () => {
    const aligned = alignObjects([obj('a', 0, 0, 20, 10)], 'center-h', 200, 200);
    expect(aligned[0].x).toBe(90);
  });
  it('distributes horizontally with equal gaps', () => {
    const aligned = alignObjects(
      [obj('a', 0, 0, 10, 10), obj('b', 30, 0, 10, 10), obj('c', 60, 0, 10, 10)],
      'distribute-h',
      200,
      200,
    );
    expect(aligned.map((o) => o.x)).toEqual([0, 30, 60]);
  });
  it('returns empty input untouched', () => {
    expect(alignObjects([], 'left', 200, 200)).toEqual([]);
  });
});

describe('resizeObject', () => {
  it('resizes from the south-east corner keeping x/y fixed', () => {
    const resized = resizeObject(obj('a', 10, 10, 20, 20), 'se', 5, 5);
    expect(resized).toMatchObject({ x: 10, y: 10, w: 25, h: 25 });
  });
  it('resizes from the north-west corner adjusting x/y', () => {
    const resized = resizeObject(obj('a', 10, 10, 20, 20), 'nw', 5, 5);
    expect(resized).toMatchObject({ x: 15, y: 15, w: 15, h: 15 });
  });
  it('enforces minimum dimensions', () => {
    const resized = resizeObject(obj('a', 10, 10, 20, 20), 'nw', 50, 50);
    expect(resized.w).toBe(8);
    expect(resized.h).toBe(8);
  });
  it('honours aspect ratio when provided', () => {
    const resized = resizeObject(obj('a', 10, 10, 20, 10), 'se', 20, 5, 8, 8, 2);
    expect(resized.w).toBe(40);
    expect(resized.h).toBe(20);
  });
});
