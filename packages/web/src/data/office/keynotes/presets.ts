import type { FillStyle, ShadowStyle, ShapeEffect, StrokeStyle } from '@/types/keynotes/deck';

export interface ShapePreset {
  label: string;
  fill: FillStyle;
  stroke?: StrokeStyle;
  shadow?: ShadowStyle;
  effect?: ShapeEffect;
}

export const SHAPE_PRESETS: ShapePreset[] = [
  {
    label: 'Indigo',
    fill: { type: 'solid', color: '#6366f1', opacity: 1 },
    shadow: {
      enabled: true,
      color: 'rgba(99,102,241,0.5)',
      blur: 16,
      offsetX: 0,
      offsetY: 6,
    },
  },
  {
    label: 'Cyan fade',
    fill: {
      type: 'gradient',
      from: '#06b6d4',
      to: '#3b82f6',
      angle: 135,
      opacity: 1,
    },
    shadow: {
      enabled: true,
      color: 'rgba(6,182,212,0.4)',
      blur: 14,
      offsetX: 0,
      offsetY: 4,
    },
  },
  {
    label: 'Sunset',
    fill: {
      type: 'gradient',
      from: '#f97316',
      to: '#ec4899',
      angle: 90,
      opacity: 1,
    },
  },
  {
    label: 'Glow',
    fill: { type: 'solid', color: '#22c55e', opacity: 1 },
    effect: { glowColor: '#22c55e', glowBlur: 18 },
  },
  {
    label: 'Outline',
    fill: { type: 'none' },
    stroke: { color: '#e2e8f0', width: 2, dash: 'solid' },
  },
  {
    label: 'Soft',
    fill: { type: 'solid', color: '#8b5cf6', opacity: 1 },
    effect: { softEdges: 10 },
  },
];
