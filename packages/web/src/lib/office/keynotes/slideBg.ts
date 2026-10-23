import type { CSSProperties } from 'react';
import type { SlideBackground } from '@/types/keynotes/deck';

const gradientCss = (bg: Extract<SlideBackground, { type: 'gradient' }>): string => {
  const stops = bg.stops ?? [
    { color: bg.from, offset: 0 },
    { color: bg.to, offset: 1 },
  ];
  const spec = stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
  return `linear-gradient(${bg.angle}deg, ${spec})`;
};

const patternCss = (bg: Extract<SlideBackground, { type: 'pattern' }>): CSSProperties => {
  const image =
    bg.pattern === 'dots'
      ? `radial-gradient(circle, ${bg.color} 2px, transparent 2px)`
      : bg.pattern === 'grid'
        ? `linear-gradient(${bg.color} 1px, transparent 1px), linear-gradient(90deg, ${bg.color} 1px, transparent 1px)`
        : `repeating-linear-gradient(45deg, ${bg.color} 0 6px, transparent 6px 12px)`;
  return {
    backgroundColor: 'transparent',
    backgroundImage: image,
    backgroundSize: bg.pattern === 'dots' ? '12px 12px' : '24px 24px',
  };
};

export const slideBackgroundCss = (
  bg: SlideBackground | undefined,
  fallback: string,
): CSSProperties => {
  if (!bg || bg.type === 'none') return { backgroundColor: fallback };
  if (bg.type === 'solid') return { backgroundColor: bg.color, opacity: bg.opacity };
  if (bg.type === 'gradient') return { backgroundImage: gradientCss(bg), opacity: bg.opacity };
  if (bg.type === 'image')
    return {
      backgroundImage: `url("${bg.imageUrl}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: bg.opacity,
    };
  return patternCss(bg);
};
