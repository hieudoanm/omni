import { BANNER, BLOCK, SMALL, STANDARD } from '../constants';
import { FigletFont } from '../types';

const FONTS: Record<string, FigletFont> = {
  Standard: STANDARD,
  Block: BLOCK,
  Small: SMALL,
  Banner: BANNER,
};

export const renderFiglet = (text: string, fontName: string): string => {
  const font = FONTS[fontName] ?? FONTS.Standard;
  const chars = text.toUpperCase().split('');
  const fallback = font[' '] ?? ['   ', '   ', '   ', '   ', '   '];
  const rows = fallback.length;
  const lines: string[] = Array(rows).fill('');
  for (const ch of chars) {
    const glyph = font[ch] ?? font['?'] ?? fallback;
    const h = glyph.length;
    for (let r = 0; r < rows; r++) {
      lines[r] += r < h ? glyph[r] : ' '.repeat((glyph[0] ?? '').length);
    }
  }
  return lines.join('\n');
};

export const FONT_NAMES = Object.keys(FONTS);
