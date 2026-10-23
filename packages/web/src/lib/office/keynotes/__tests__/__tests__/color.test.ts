import {
  darken,
  hexToRgb,
  lighten,
  randomColor,
  readableTextColor,
  relativeLuminance,
  rgbToHex,
  withAlpha,
} from '@/lib/office/keynotes/color';

describe('hexToRgb', () => {
  it('parses shorthand hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });
  it('parses full hex', () => {
    expect(hexToRgb('#336699')).toEqual({ r: 51, g: 102, b: 153, a: 1 });
  });
  it('is case-insensitive', () => {
    expect(hexToRgb('#A1B2C3')).toEqual({ r: 161, g: 178, b: 195, a: 1 });
  });
});

describe('rgbToHex', () => {
  it('converts rgb components to hex', () => {
    expect(rgbToHex({ r: 51, g: 102, b: 153 })).toBe('#336699');
  });
});

describe('withAlpha', () => {
  it('returns rgba for a hex color', () => {
    expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });
});

describe('lighten/darken', () => {
  it('lightens and darkens colors by an amount', () => {
    const light = lighten('#808080', 0.5);
    const dark = darken('#808080', 0.5);
    expect(light).not.toBe('#808080');
    expect(dark).not.toBe('#808080');
  });
});

describe('relativeLuminance', () => {
  it('returns 0 for black and ~1 for white', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1);
  });
});

describe('readableTextColor', () => {
  it('returns light text on dark backgrounds and dark text on light', () => {
    expect(readableTextColor('#000000')).toBe('#f9fafb');
    expect(readableTextColor('#ffffff')).toBe('#111827');
  });
});

describe('randomColor', () => {
  it('returns a valid hex color from the palette', () => {
    expect(randomColor()).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
