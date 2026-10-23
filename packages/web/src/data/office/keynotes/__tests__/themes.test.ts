import { FONT_OPTIONS, THEMES, themeById } from '@/data/office/keynotes/themes';

describe('themes', () => {
  it('exports a non-empty list of themes', () => {
    expect(THEMES.length).toBeGreaterThan(0);
    expect(THEMES[0].id).toBe('midnight');
  });

  it('looks up a theme by id', () => {
    expect(themeById('slate').name).toBe('Slate');
    expect(themeById('unknown').id).toBe('midnight');
  });

  it('exposes font options', () => {
    expect(FONT_OPTIONS.map((f) => f.id)).toEqual(
      expect.arrayContaining(['sans', 'serif', 'mono', 'playfair', 'space-grotesk']),
    );
  });
});
