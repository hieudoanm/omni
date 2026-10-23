import { formatRelativeTime } from '@/lib/office/md/date';

describe('date', () => {
  const now = Date.now();

  it('returns "just now" for timestamps under 45 seconds old', () => {
    expect(formatRelativeTime(now - 10_000)).toBe('just now');
  });

  it('returns minutes for timestamps under an hour old', () => {
    expect(formatRelativeTime(now - 120_000)).toBe('2 min ago');
  });

  it('returns singular and plural hours', () => {
    expect(formatRelativeTime(now - 3_600_000)).toBe('1 hour ago');
    expect(formatRelativeTime(now - 2 * 3_600_000)).toBe('2 hours ago');
  });

  it('returns singular and plural days', () => {
    expect(formatRelativeTime(now - 24 * 3_600_000)).toBe('1 day ago');
    expect(formatRelativeTime(now - 48 * 3_600_000)).toBe('2 days ago');
  });

  it('formats timestamps older than 30 days as a date', () => {
    const ts = now - 40 * 24 * 3_600_000;
    expect(formatRelativeTime(ts)).toBe(
      new Date(ts).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  });
});
