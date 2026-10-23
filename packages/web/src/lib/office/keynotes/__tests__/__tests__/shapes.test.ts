import { SHAPE_TYPES, shapeLabel, shapePath } from '@/lib/office/keynotes/shapes';

describe('shapePath', () => {
  it.each(SHAPE_TYPES)('returns a path for %s', (type) => {
    expect(shapePath(type).length).toBeGreaterThan(0);
  });

  it('falls back to a rect for unknown types', () => {
    expect(shapePath('rect' as (typeof SHAPE_TYPES)[number])).toBe('M0 0 H100 V100 H0 Z');
  });
});

describe('shapeLabel', () => {
  it.each([
    ['rect', 'Rect'],
    ['rounded-rect', 'Rounded Rect'],
    ['arrow-right', 'Arrow Right'],
    ['hexagon-stacked', 'Hexagon Stacked'],
  ])('labels %s as %s', (type, expected) => {
    expect(shapeLabel(type as (typeof SHAPE_TYPES)[number])).toBe(expected);
  });
});
