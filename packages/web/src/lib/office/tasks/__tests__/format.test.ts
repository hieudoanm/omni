import { copyToClipboard, formatDate, formatRelativeTime } from '@/lib/office/tasks/format';

describe('formatRelativeTime', () => {
  it('returns "just now" for timestamps under a minute old', () => {
    expect(formatRelativeTime(Date.now() - 1000)).toBe('just now');
  });

  it('returns minutes ago within the hour', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60000)).toBe('5m ago');
  });

  it('returns hours ago within the day', () => {
    expect(formatRelativeTime(Date.now() - 3 * 3600000)).toBe('3h ago');
  });

  it('returns days ago beyond a day', () => {
    expect(formatRelativeTime(Date.now() - 4 * 86400000)).toBe('4d ago');
  });
});

describe('formatDate', () => {
  it('formats a timestamp as a short en-US date', () => {
    const ts = new Date(2024, 3, 15, 12, 0, 0).getTime();
    expect(formatDate(ts)).toMatch(/Apr/i);
    expect(formatDate(ts)).toContain('2024');
  });
});

describe('copyToClipboard', () => {
  it('resolves true when the clipboard write succeeds', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('resolves false when the clipboard write throws', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('denied')),
      },
    });
    await expect(copyToClipboard('hello')).resolves.toBe(false);
  });
});
