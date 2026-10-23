import { describe, expect, it } from 'vitest';

import { isBlockedHostname } from './block';

describe('isBlockedHostname', () => {
  it('matches exact domains', () => {
    expect(isBlockedHostname('youtube.com')).toBe(true);
    expect(isBlockedHostname('netflix.com')).toBe(true);
  });

  it('matches subdomains', () => {
    expect(isBlockedHostname('m.youtube.com')).toBe(true);
    expect(isBlockedHostname('www.reddit.com')).toBe(true);
  });

  it('strips the www prefix', () => {
    expect(isBlockedHostname('www.youtube.com')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isBlockedHostname('YouTube.COM')).toBe(true);
  });

  it('does not match unrelated or lookalike hosts', () => {
    expect(isBlockedHostname('example.com')).toBe(false);
    expect(isBlockedHostname('notyoutube.com')).toBe(false);
    expect(isBlockedHostname('youtube.com.evil.com')).toBe(false);
    expect(isBlockedHostname('')).toBe(false);
  });
});
