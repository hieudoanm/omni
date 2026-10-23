import { describe, expect, it } from 'vitest';

import {
  claudeColor,
  claudePercent,
  formatReset,
  type ClaudeLimitData,
} from './claude';

const makeData = (
  daily: { used: number; limit: number },
  weekly: { used: number; limit: number }
): ClaudeLimitData => ({
  daily: { ...daily, resetAt: null },
  weekly: { ...weekly, resetAt: null },
  updatedAt: 0,
});

describe('claudePercent', () => {
  it('returns percentages for both periods', () => {
    const data = makeData({ used: 50, limit: 100 }, { used: 25, limit: 200 });
    expect(claudePercent(data)).toEqual({ daily: 50, weekly: 13 });
  });

  it('caps at 100 when usage exceeds the limit', () => {
    const data = makeData({ used: 150, limit: 100 }, { used: 0, limit: 0 });
    expect(claudePercent(data)).toEqual({ daily: 100, weekly: null });
  });

  it('returns null for non-positive limits', () => {
    const data = makeData({ used: 10, limit: 0 }, { used: 10, limit: -5 });
    expect(claudePercent(data)).toEqual({ daily: null, weekly: null });
  });
});

describe('claudeColor', () => {
  it('uses red at 90% and above', () => {
    expect(claudeColor(90)).toBe('#e53e3e');
    expect(claudeColor(100)).toBe('#e53e3e');
  });

  it('uses amber between 60 and 89', () => {
    expect(claudeColor(60)).toBe('#d69e2e');
    expect(claudeColor(89)).toBe('#d69e2e');
  });

  it('uses green below 60', () => {
    expect(claudeColor(0)).toBe('#38a169');
    expect(claudeColor(59)).toBe('#38a169');
  });
});

describe('formatReset', () => {
  it('returns ? for null', () => {
    expect(formatReset(null)).toBe('?');
  });

  it('returns now for past timestamps', () => {
    expect(formatReset(Date.now() - 1000)).toBe('now');
  });

  it('formats minutes', () => {
    expect(formatReset(Date.now() + 30 * 60_000)).toBe('30m');
  });

  it('formats hours and minutes', () => {
    expect(formatReset(Date.now() + 90 * 60_000)).toBe('1h 30m');
  });

  it('formats whole hours', () => {
    expect(formatReset(Date.now() + 2 * 60 * 60_000)).toBe('2h');
  });

  it('formats days', () => {
    expect(formatReset(Date.now() + 3 * 24 * 60 * 60_000)).toBe('3d');
  });

  it('formats days with remaining hours', () => {
    expect(formatReset(Date.now() + 26 * 60 * 60_000)).toBe('1d 2h');
  });
});
