import { columnLabels, columnToLabel } from '@/lib/office/csv/columns';

describe('columnToLabel', () => {
  it.each([
    [0, 'A'],
    [1, 'B'],
    [25, 'Z'],
    [26, 'AA'],
    [27, 'AB'],
    [51, 'AZ'],
    [52, 'BA'],
    [701, 'ZZ'],
    [702, 'AAA'],
  ])('maps index %i to %s', (index, label) => {
    expect(columnToLabel(index)).toBe(label);
  });
});

describe('columnLabels', () => {
  it('builds sequential labels', () => {
    expect(columnLabels(3)).toEqual(['A', 'B', 'C']);
  });

  it('returns no labels for zero columns', () => {
    expect(columnLabels(0)).toEqual([]);
  });
});
