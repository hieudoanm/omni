import { Fields, Preset } from './types';

export const FIELD_KEYS: (keyof Fields)[] = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];

export const FIELD_LABELS: Record<keyof Fields, string> = {
  minute: 'Min',
  hour: 'Hour',
  dayOfMonth: 'Day',
  month: 'Month',
  dayOfWeek: 'DOW',
};

export const FIELD_RANGES: Record<keyof Fields, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 7],
};

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PRESETS: Preset[] = [
  { label: 'Every min', value: '* * * * *' },
  { label: 'Every 5m', value: '*/5 * * * *' },
  { label: 'Every 30m', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day', value: '0 0 * * *' },
  { label: 'Every week', value: '0 0 * * 0' },
  { label: 'Every month', value: '0 0 1 * *' },
];
