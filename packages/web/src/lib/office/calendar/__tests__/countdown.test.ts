import { diffParts, calcProgress, toDateInputValue } from '@/lib/office/calendar/countdown';

describe('diffParts', () => {
  it('returns zeros for same date', () => {
    const d = new Date('2024-06-15');
    expect(diffParts(d, d)).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('calculates days correctly', () => {
    const result = diffParts(new Date('2024-01-01'), new Date('2024-01-04'));
    expect(result.days).toBe(3);
  });

  it('calculates months and days', () => {
    const result = diffParts(new Date('2024-01-15'), new Date('2024-03-20'));
    expect(result.months).toBe(2);
    expect(result.days).toBe(5);
  });

  it('calculates years, months, days', () => {
    const result = diffParts(new Date('2020-01-15'), new Date('2024-06-20'));
    expect(result.years).toBe(4);
    expect(result.months).toBe(5);
    expect(result.days).toBe(5);
  });

  it('handles year boundary', () => {
    const result = diffParts(new Date('2023-12-31'), new Date('2024-01-01'));
    expect(result.days).toBe(1);
  });
});

describe('calcProgress', () => {
  it('returns 0 before start', () => {
    const future = new Date(Date.now() + 86400000);
    expect(calcProgress(future, new Date(Date.now() + 172800000))).toBe(0);
  });

  it('returns 100 after end', () => {
    const past = new Date(Date.now() - 86400000);
    expect(calcProgress(new Date(Date.now() - 172800000), past)).toBe(100);
  });

  it('returns value between 0 and 100 during interval', () => {
    const start = new Date(Date.now() - 86400000);
    const end = new Date(Date.now() + 86400000);
    const progress = calcProgress(start, end);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });
});

describe('toDateInputValue', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(toDateInputValue(new Date('2024-06-15T10:30:00'))).toBe('2024-06-15');
  });
});
