import {
  frameOfObjects,
  hitTest,
  moveSelection,
  normalizeAngle,
  resizeSelection,
  resolveSelection,
  rotateSelection,
} from '@/components/office/keynotes/organisms/canvasOps';
import { newShapeObject, newTextObject } from '@/lib/office/keynotes/deckFactory';
import type { GroupObject, SlideObject } from '@/types/keynotes/deck';

const rect = (id: string, x: number, y: number, w = 100, h = 80) => ({
  x,
  y,
  w,
  h,
});

const obj = (id: string, x: number, y: number): SlideObject => ({
  ...newShapeObject({ id, x, y, w: 100, h: 80 }),
});

const group = (id: string, x: number, y: number, w: number, h: number) =>
  ({
    ...newTextObject({ id, x, y, w, h }),
    kind: 'group',
  }) as unknown as GroupObject;

describe('canvasOps', () => {
  it('normalizes angles to [0, 360)', () => {
    expect(normalizeAngle(400)).toBe(40);
    expect(normalizeAngle(-90)).toBe(270);
  });

  it('hit-tests points inside an object', () => {
    expect(hitTest(rect('a', 10, 10, 50, 50), { x: 20, y: 20 })).toBe(true);
    expect(hitTest(rect('a', 10, 10, 50, 50), { x: 0, y: 0 })).toBe(false);
  });

  it('builds a frame from objects', () => {
    expect(frameOfObjects([])).toBeNull();
    expect(frameOfObjects([obj('a', 10, 20)])).toEqual(
      expect.objectContaining({ x: 10, y: 20, w: 100, h: 80, rotation: 0 }),
    );
    const [a, b] = [obj('a', 10, 20), obj('b', 200, 100)];
    expect(frameOfObjects([a, b])).toEqual(
      expect.objectContaining({ w: 290, h: 160, rotation: 0 }),
    );
  });

  it('resolves a selection through groups', () => {
    const g = group('g', 0, 0, 200, 160);
    const child = { ...obj('c', 10, 10), group: 'g' };
    const other = obj('o', 300, 300);
    const resolved = resolveSelection([g, child, other], ['c', 'missing', 'c']);
    expect(resolved.map((o) => o.id)).toEqual(['g']);
  });

  it('moves a selection with snapping and grid', () => {
    const a = obj('a', 0, 0);
    const b = obj('b', 400, 400);
    const moved = moveSelection([a, b], [a], [], 10, 10, 1280, 720);
    expect(moved.objects.find((o) => o.id === 'a')).toMatchObject({
      x: 10,
      y: 10,
    });

    const movedGrid = moveSelection([a, b], [a], [], 17, 13, 1280, 720, {
      snap: false,
      grid: 20,
    });
    expect(movedGrid.objects.find((o) => o.id === 'a')).toMatchObject({
      x: 20,
      y: 20,
    });
  });

  it('returns objects unchanged when selection is empty or unmoved', () => {
    const a = obj('a', 10, 10);
    const arr = [a];
    expect(moveSelection(arr, [], [], 0, 0, 1280, 720).objects).toBe(arr);
    expect(moveSelection(arr, [a], [], 0, 0, 1280, 720, { snap: false }).objects).toBe(arr);
  });

  it('resizes a non-group selection', () => {
    const a = obj('a', 10, 10);
    const b = obj('b', 300, 300);
    const resized = resizeSelection([a, b], [a], 'se', 20, 10);
    expect(resized.find((o) => o.id === 'a')).toMatchObject({ w: 120, h: 90 });
  });

  it('resizes a group and scales children', () => {
    const g = group('g', 10, 10, 200, 160);
    const child = { ...obj('c', 10, 10), group: 'g' };
    const resized = resizeSelection([g, child], [g], 'se', 40, 40);
    const groupRes = resized.find((o) => o.id === 'g');
    expect(groupRes).toMatchObject({ w: 240, h: 200 });
    expect(resized.find((o) => o.id === 'c')).toMatchObject({ w: 120, h: 100 });
  });

  it('returns objects unchanged when resize has no primary', () => {
    const a = obj('a', 10, 10);
    const arr = [a];
    expect(resizeSelection(arr, [], 'se', 20, 10)).toBe(arr);
  });

  it('rotates the primary object only', () => {
    const a = obj('a', 10, 10);
    const b = obj('b', 300, 300);
    const rotated = rotateSelection([a, b], [a], 370);
    expect(rotated.find((o) => o.id === 'a')).toMatchObject({ rotation: 10 });
    expect(rotated.find((o) => o.id === 'b')).toMatchObject({ rotation: 0 });
    const arr = [a];
    expect(rotateSelection(arr, [], 45)).toBe(arr);
  });
});
