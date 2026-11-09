import { daysBetween } from '@/lib/office/calendar/daysBetween';

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    const d = new Date('2024-06-15');
    expect(daysBetween(d, d)).toEqual({
      totalDays: 0,
      years: 0,
      months: 0,
      days: 0,
    });
  });

  it('counts consecutive days', () => {
    const result = daysBetween(new Date('2024-01-01'), new Date('2024-01-02'));
    expect(result.totalDays).toBe(1);
    expect(result.days).toBe(1);
  });

  it('counts across month boundary', () => {
    const result = daysBetween(new Date('2024-01-31'), new Date('2024-02-01'));
    expect(result.totalDays).toBe(1);
    expect(result.days).toBe(1);
  });

  it('counts across year boundary', () => {
    const result = daysBetween(new Date('2023-12-31'), new Date('2024-01-01'));
    expect(result.totalDays).toBe(1);
    expect(result.days).toBe(1);
  });

  it('calculates exactly one year', () => {
    const result = daysBetween(new Date('2023-01-01'), new Date('2024-01-01'));
    expect(result.totalDays).toBe(365);
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('handles leap year Feb 28 to Mar 1', () => {
    const result = daysBetween(new Date('2024-02-28'), new Date('2024-03-01'));
    expect(result.totalDays).toBe(2);
    expect(result.days).toBe(2);
  });

  it('handles non-leap year Feb 28 to Mar 1', () => {
    const result = daysBetween(new Date('2023-02-28'), new Date('2023-03-01'));
    expect(result.totalDays).toBe(1);
    expect(result.days).toBe(1);
  });

  it('swaps from and to when from > to', () => {
    const result = daysBetween(new Date('2024-06-20'), new Date('2024-06-15'));
    expect(result.totalDays).toBe(5);
    expect(result.days).toBe(5);
  });

  it('returns years, months, and days for large range', () => {
    const result = daysBetween(new Date('2020-01-15'), new Date('2024-06-23'));
    expect(result.years).toBe(4);
    expect(result.months).toBe(5);
    expect(result.days).toBe(8);
    expect(result.totalDays).toBeGreaterThan(0);
  });

  it('handles end-of-month edge case Jan 31 to Feb 28 non-leap', () => {
    const result = daysBetween(new Date('2023-01-31'), new Date('2023-02-28'));
    expect(result.totalDays).toBe(28);
    expect(result.months).toBe(0);
    expect(result.days).toBe(28);
  });

  it('handles NaN dates', () => {
    const result = daysBetween(new Date('invalid'), new Date('2024-01-01'));
    expect(result.totalDays).toBeNaN();
  });
});
