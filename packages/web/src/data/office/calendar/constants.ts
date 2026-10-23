export const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

export const daysOfMonths: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const months: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const monthsShort: string[] = [
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

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HOURS = Array.from({ length: 24 }, (_, i) => i);

export const START_YEAR = 1970;
export const END_YEAR = 2100;
export const years = new Array(END_YEAR - START_YEAR + 1).fill(0).map((_, i) => START_YEAR + i);

export enum View {
  DAY = 'day',
  THREE_DAY = '3-day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTERLY = 'quarterly',
  HALFLY = 'halfly',
  YEARLY = 'yearly',
}

export const getDaysInMonth = (year: number, month: number): number => {
  if (month === 1 && isLeapYear(year)) return 29;
  return daysOfMonths[month];
};

export const getFirstDayOfMonth = (year: number, month: number): number =>
  new Date(year, month, 1).getDay();

export const isToday = (year: number, month: number, day: number): boolean => {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day;
};

export const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};
