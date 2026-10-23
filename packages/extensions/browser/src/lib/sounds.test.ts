import { describe, expect, it } from 'vitest';

import { toHostname, toSoundTabInfo } from './sounds';

describe('toHostname', () => {
  it('extracts the hostname from a URL', () => {
    expect(toHostname('https://www.example.com/path?q=1')).toBe(
      'www.example.com'
    );
  });

  it('returns empty string for missing or invalid URLs', () => {
    expect(toHostname(undefined)).toBe('');
    expect(toHostname('')).toBe('');
    expect(toHostname('not a url')).toBe('');
  });
});

describe('toSoundTabInfo', () => {
  it('returns null when the tab has no id', () => {
    expect(toSoundTabInfo({} as chrome.tabs.Tab)).toBeNull();
  });

  it('maps tab fields into sound info', () => {
    const info = toSoundTabInfo({
      id: 7,
      title: 'Example',
      url: 'https://example.com/',
      favIconUrl: 'https://example.com/favicon.ico',
      audible: true,
      mutedInfo: { muted: true },
    } as chrome.tabs.Tab);

    expect(info).toEqual({
      tabId: 7,
      title: 'Example',
      hostname: 'example.com',
      favIconUrl: 'https://example.com/favicon.ico',
      audible: true,
      muted: true,
    });
  });

  it('applies defaults for missing fields', () => {
    const info = toSoundTabInfo({ id: 1 } as chrome.tabs.Tab);

    expect(info).toEqual({
      tabId: 1,
      title: 'Untitled',
      hostname: '',
      favIconUrl: '',
      audible: false,
      muted: false,
    });
  });
});
