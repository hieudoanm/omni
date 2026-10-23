export interface TimeBlock {
  label: string;
  start: number;
  end: number;
}

export const TIME_BLOCKS: TimeBlock[] = [
  { label: 'Sleep', start: 0, end: 8 },
  { label: 'Breakfast', start: 8, end: 9 },
  { label: 'Morning work', start: 9, end: 12 },
  { label: 'Lunch', start: 12, end: 13 },
  { label: 'Afternoon work', start: 13, end: 18 },
  { label: 'Dinner', start: 18, end: 19 },
  { label: 'Exercise', start: 19, end: 21 },
  { label: 'Relaxation', start: 21, end: 24 },
];
