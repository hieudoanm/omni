import { DUE_OPTIONS, PRIORITY_OPTIONS } from '@/lib/office/tasks/types';

describe('tasks option lists', () => {
  it('exposes an option per due filter value in a stable order', () => {
    expect(DUE_OPTIONS.map((o) => o.value)).toEqual(['all', 'overdue', 'today', 'week', 'none']);
    expect(DUE_OPTIONS.every((o) => o.label.length > 0)).toBe(true);
  });

  it('exposes an option per priority filter value', () => {
    expect(PRIORITY_OPTIONS.map((o) => o.value)).toEqual([
      'all',
      'urgent',
      'high',
      'medium',
      'low',
    ]);
    expect(PRIORITY_OPTIONS.every((o) => o.label.length > 0)).toBe(true);
  });
});
