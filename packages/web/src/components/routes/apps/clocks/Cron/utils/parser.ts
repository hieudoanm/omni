import { Fields } from '../types';

const parseField = (raw: string, min: number, max: number): Set<number> => {
  const values = new Set<number>();
  for (const token of raw.split(',')) {
    const t = token.trim();
    if (!t) continue;
    const step = t.match(/^(\*|\d+(?:-\d+)?)\/(\d+)$/);
    if (step) {
      let lo = min,
        hi = max;
      if (step[1] !== '*') {
        const parts = step[1].split('-').map(Number);
        lo = parts[0];
        hi = parts.length === 2 ? parts[1] : max;
      }
      for (let i = lo; i <= hi; i += parseInt(step[2], 10)) values.add(i);
      continue;
    }
    const range = t.match(/^(\d+)-(\d+)$/);
    if (range) {
      for (let i = parseInt(range[1], 10); i <= parseInt(range[2], 10); i++) values.add(i);
      continue;
    }
    const n = parseInt(t, 10);
    if (!isNaN(n) && n >= min && n <= max) values.add(n);
  }
  return values;
};

export const parse = (expr: string): Fields | null => {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  try {
    return {
      minute: parseField(parts[0], 0, 59),
      hour: parseField(parts[1], 0, 23),
      dayOfMonth: parseField(parts[2], 1, 31),
      month: parseField(parts[3], 1, 12),
      dayOfWeek: parseField(parts[4], 0, 7),
    };
  } catch {
    return null;
  }
};

export const matches = (f: Fields, d: Date): boolean => {
  if (!f.minute.has(d.getMinutes())) return false;
  if (!f.hour.has(d.getHours())) return false;
  const domWild = f.dayOfMonth.size >= 31;
  const dowWild = f.dayOfWeek.size >= 8;
  if (!domWild && !dowWild)
    return f.dayOfMonth.has(d.getDate()) || f.dayOfWeek.has(d.getDay()) || f.dayOfWeek.has(7);
  if (!domWild && !f.dayOfMonth.has(d.getDate())) return false;
  if (!dowWild && !(f.dayOfWeek.has(d.getDay()) || f.dayOfWeek.has(7))) return false;
  if (!f.month.has(d.getMonth() + 1)) return false;
  return true;
};

export const nextTimes = (expr: string, count = 5): Date[] => {
  const f = parse(expr);
  if (!f) return [];
  const result: Date[] = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  let guard = 0;
  while (result.length < count && guard < 525_600) {
    if (matches(f, cursor)) result.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + 1);
    guard++;
  }
  return result;
};
