import { MONTH_NAMES, DAY_NAMES } from '../constants';
import { parse } from './parser';

export const cronToDescription = (expr: string): string => {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid expression';
  if (parts.every((p) => p === '*')) return 'Every minute';
  if (parts[0].startsWith('*/') && parts.slice(1).every((p) => p === '*'))
    return `Every ${parts[0].slice(2)} minutes`;
  if (parts[0] === '0' && parts.slice(2).every((p) => p === '*')) return 'Every hour';
  if (
    parts[0] === '0' &&
    parts[1] === '0' &&
    parts[2] === '*' &&
    parts[3] === '*' &&
    parts[4] === '*'
  )
    return 'At midnight';
  if (parts[0] === '0' && parts[1] === '0' && parts[2] === '*' && parts[3] === '*') {
    const dow = parts[4];
    if (dow === '0' || dow === '7') return 'At midnight, only on Sunday';
    if (dow === '1') return 'At midnight, only on Monday';
    if (dow === '2') return 'At midnight, only on Tuesday';
    if (dow === '3') return 'At midnight, only on Wednesday';
    if (dow === '4') return 'At midnight, only on Thursday';
    if (dow === '5') return 'At midnight, only on Friday';
    if (dow === '6') return 'At midnight, only on Saturday';
    if (dow.includes(','))
      return `At midnight, only on ${dow
        .split(',')
        .map(Number)
        .sort()
        .map((d: number) => DAY_NAMES[d])
        .join(', ')}`;
    return `At midnight, on day ${dow}`;
  }
  const fields = parse(expr);
  if (!fields) return expr;
  const parts_: string[] = [];
  if (fields.minute.size < 60 && fields.minute.size > 0) {
    const sorted = [...fields.minute].sort((a, b) => a - b);
    if (fields.hour.size > 0 && fields.hour.size < 24) {
      parts_.push(`At ${sorted.map((m) => `:${String(m).padStart(2, '0')}`).join(',')}`);
    } else {
      if (sorted.length === 1) parts_.push(`At minute ${sorted[0]}`);
      else {
        const d = sorted[1] - sorted[0];
        parts_.push(
          sorted.every((v, i) => i === 0 || v - sorted[i - 1] === d) && d > 1
            ? `Every ${d} minutes`
            : `At minutes ${sorted.join(',')}`,
        );
      }
    }
  }
  if (fields.hour.size < 24 && fields.hour.size > 0) {
    const sorted = [...fields.hour].sort((a, b) => a - b);
    if (sorted.length === 1) parts_.push(`past hour ${sorted[0]}`);
    else {
      const d = sorted[1] - sorted[0];
      parts_.push(
        sorted.every((v, i) => i === 0 || v - sorted[i - 1] === d) && d > 1
          ? `every ${d} hours`
          : `past hours ${sorted.join(',')}`,
      );
    }
  }
  if (fields.dayOfMonth.size < 31 && fields.dayOfMonth.size > 0) {
    const sorted = [...fields.dayOfMonth].sort((a, b) => a - b);
    parts_.push(sorted.length === 1 ? `on day ${sorted[0]}` : `on days ${sorted.join(',')}`);
  }
  if (fields.month.size < 12 && fields.month.size > 0) {
    const sorted = [...fields.month].sort((a, b) => a - b);
    parts_.push(
      sorted.length === 1
        ? `in ${MONTH_NAMES[sorted[0] - 1]}`
        : `in ${sorted.map((m) => MONTH_NAMES[m - 1]).join(',')}`,
    );
  }
  if (fields.dayOfWeek.size < 8 && fields.dayOfWeek.size > 0) {
    const dowSet = new Set<number>();
    for (const d of fields.dayOfWeek) dowSet.add(d === 7 ? 0 : d);
    if (dowSet.size < 7) {
      const sorted = [...dowSet].sort();
      parts_.push(
        sorted.length === 1
          ? `on ${DAY_NAMES[sorted[0]]}`
          : `on ${sorted.map((d) => DAY_NAMES[d]).join(',')}`,
      );
    }
  }
  return parts_.length ? parts_.join(' ') : expr;
};

export const formatNext = (d: Date): string => {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
