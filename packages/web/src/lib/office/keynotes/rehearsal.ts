export type Pace = 'fast' | 'good' | 'slow';

export const pace = (seconds: number): Pace =>
  seconds < 30 ? 'fast' : seconds <= 90 ? 'good' : 'slow';

export const PACE_LABEL: Record<Pace, string> = {
  fast: 'Good pace',
  good: 'On target',
  slow: 'Slow down',
};

export const PACE_NOTE: Record<Pace, string> = {
  fast: 'Under 30s — keep it up.',
  good: '30s–90s — solid timing.',
  slow: 'Over 90s — trim this slide.',
};

export const averageTime = (seconds: number[]): number =>
  seconds.length === 0 ? 0 : Math.round(seconds.reduce((a, b) => a + b, 0) / seconds.length);
