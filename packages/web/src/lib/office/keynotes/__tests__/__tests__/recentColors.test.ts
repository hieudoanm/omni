import { getRecentColors, recordRecentColor } from '@/lib/office/keynotes/recentColors';

describe('recentColors', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts empty', () => {
    expect(getRecentColors()).toEqual([]);
  });

  it('records a color and returns it', () => {
    recordRecentColor('#112233');
    expect(getRecentColors()).toEqual(['#112233']);
  });

  it('dedupes case-insensitively and moves to front', () => {
    recordRecentColor('#112233');
    recordRecentColor('#445566');
    recordRecentColor('#112233');
    expect(getRecentColors()).toEqual(['#112233', '#445566']);
  });

  it('caps the list at 8 entries', () => {
    for (let i = 0; i < 10; i++) {
      recordRecentColor(`#00000${i}`);
    }
    expect(getRecentColors()).toHaveLength(8);
  });

  it('ignores invalid colors', () => {
    recordRecentColor('not-a-color');
    recordRecentColor('#fff');
    expect(getRecentColors()).toEqual([]);
  });
});
