import {
  dist,
  reducePoints,
  removeStrokesNear,
  strokeNear,
  type AnnotationStroke,
} from '@/lib/office/keynotes/annotations';

const stroke = (over: Partial<AnnotationStroke> = {}): AnnotationStroke => ({
  id: 's1',
  tool: 'pen',
  color: '#fff',
  width: 3,
  points: [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 0 },
  ],
  ...over,
});

describe('annotations', () => {
  it('computes the distance between two points', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('detects when a stroke passes near a point', () => {
    const s = stroke();
    expect(strokeNear(s, { x: 10, y: 10 }, 1)).toBe(true);
    expect(strokeNear(s, { x: 100, y: 100 }, 1)).toBe(false);
  });

  it('removes strokes near an eraser point', () => {
    const a = stroke({ id: 'a' });
    const b = stroke({ id: 'b', points: [{ x: 500, y: 500 }] });
    const result = removeStrokesNear([a, b], { x: 10, y: 10 }, 5);
    expect(result.map((s) => s.id)).toEqual(['b']);
  });

  it('keeps strokes when the eraser misses them', () => {
    const a = stroke();
    expect(removeStrokesNear([a], { x: 999, y: 999 }, 5)).toHaveLength(1);
  });

  it('thins out redundant points but keeps the endpoints', () => {
    const points = reducePoints([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 10, y: 10 },
    ]);
    expect(points).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
      { x: 10, y: 10 },
    ]);
  });
});
