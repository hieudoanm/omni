export interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const hexToRgb = (hex: string): Rgb => {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  if (h.length !== 6) return { r: 0, g: 0, b: 0, a: 1 };
  const num = parseInt(h, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    a: 1,
  };
};

export const rgbToHex = ({ r, g, b }: Pick<Rgb, 'r' | 'g' | 'b'>): string => {
  const to2 = (n: number): string =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${to2(r)}${to2(g)}${to2(b)}`;
};

export const withAlpha = (color: string, opacity: number): string => {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, opacity))})`;
};

export const lighten = (color: string, amount: number): string => {
  const { r, g, b } = hexToRgb(color);
  const mix = (c: number, a: number): number => Math.round(c + (255 - c) * a);
  return rgbToHex({ r: mix(r, amount), g: mix(g, amount), b: mix(b, amount) });
};

export const darken = (color: string, amount: number): string => {
  const { r, g, b } = hexToRgb(color);
  const mix = (c: number, a: number): number => Math.round(c * (1 - a));
  return rgbToHex({ r: mix(r, amount), g: mix(g, amount), b: mix(b, amount) });
};

export const relativeLuminance = ({ r, g, b }: Pick<Rgb, 'r' | 'g' | 'b'>): number => {
  const lin = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const readableTextColor = (background: string): string =>
  relativeLuminance(hexToRgb(background)) > 0.45 ? '#111827' : '#f9fafb';

export const PALETTE = [
  '#111827',
  '#6b7280',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#ffffff',
];

export const randomColor = (): string => PALETTE[Math.floor(Math.random() * (PALETTE.length - 1))];
