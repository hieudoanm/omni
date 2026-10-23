import { CharClass } from '../types';

export const classifyChar = (c: string): CharClass | null => {
  if (/[0-9]/.test(c)) return '\\d';
  if (/[a-z]/.test(c)) return '[a-z]';
  if (/[A-Z]/.test(c)) return '[A-Z]';
  return null;
};

export const classifySegment = (seg: string): string | null => {
  if (seg.length === 0) return '';
  if (/^\d+$/.test(seg)) return `\\d{${seg.length}}`;
  if (/^[a-z]+$/.test(seg)) return `[a-z]{${seg.length}}`;
  if (/^[A-Z]+$/.test(seg)) return `[A-Z]{${seg.length}}`;
  if (/^[a-zA-Z]+$/.test(seg)) return `[a-zA-Z]{${seg.length}}`;
  if (/^[a-zA-Z0-9]+$/.test(seg)) return `\\w{${seg.length}}`;
  return null;
};

export const escapeLit = (s: string): string => s.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');

const SEP_PATTERN = /[-_.\s/|~]+/;

export const splitParts = (s: string): string[] => s.split(SEP_PATTERN).filter(Boolean);

export const generateRegex = (strings: string[]): string | null => {
  if (strings.length < 2) return null;
  const clean = strings.filter((s) => s.length > 0);
  if (clean.length < 2) return null;

  const allSame = clean.every((s) => s === clean[0]);
  if (allSame) return escapeLit(clean[0]);

  const bySep = clean.map(splitParts);
  const allSamePartsCount = bySep.every((parts) => parts.length === bySep[0].length);

  if (allSamePartsCount) {
    const result: string[] = [];
    for (let i = 0; i < bySep[0].length; i++) {
      const parts = bySep.map((p) => p[i]);
      const first = parts[0];

      if (parts.every((p) => p === first)) {
        result.push(i > 0 ? '[-_.\\s/|~]' : '', escapeLit(first));
        continue;
      }

      const allSameLen = parts.every((p) => p.length === first.length);
      if (allSameLen) {
        let pattern = '';
        for (let j = 0; j < first.length; j++) {
          const chars = parts.map((p) => p[j]);
          const uniq = [...new Set(chars)];
          if (uniq.length === 1) {
            const cls = classifyChar(uniq[0]);
            pattern += cls ?? escapeLit(uniq[0]);
          } else {
            const classes = uniq.map((c) => classifyChar(c));
            const allSameClass = classes.every((c, _, arr) => c && c === arr[0]);
            if (allSameClass) {
              pattern += classes[0];
            } else {
              const printable = uniq
                .map((c) => escapeLit(c))
                .sort()
                .join('');
              pattern += `[${printable}]`;
            }
          }
        }
        result.push(i > 0 ? '[-_.\\s/|~]' : '', pattern);
      } else {
        const segClass = classifySegment(first);
        if (segClass && parts.every((p) => classifySegment(p))) {
          const lengths = [...new Set(parts.map((p) => p.length))];
          if (lengths.length === 1) {
            result.push(i > 0 ? '[-_.\\s/|~]' : '', segClass);
          } else {
            const min = Math.min(...lengths);
            const max = Math.max(...lengths);
            const base = segClass.replace(/\{\d+\}$/, '');
            result.push(i > 0 ? '[-_.\\s/|~]' : '', `${base}{${min},${max}}`);
          }
        } else {
          result.push(
            i > 0 ? '[-_.\\s/|~]' : '',
            `(?:(?:${parts.map((p) => escapeLit(p)).join('|')}))`,
          );
        }
      }
    }
    return result.join('');
  }

  const prefix = (() => {
    let i = 0;
    while (i < clean[0].length && clean.every((s) => s[i] === clean[0][i])) i++;
    return clean[0].slice(0, i);
  })();

  const suffix = (() => {
    let i = 0;
    while (
      i < clean[0].length &&
      clean.every((s) => s[s.length - 1 - i] === clean[0][clean[0].length - 1 - i])
    )
      i++;
    return clean[0].slice(clean[0].length - i);
  })();

  if (prefix || suffix) {
    const mid = clean.map((s) => s.slice(prefix.length, s.length - suffix.length || s.length));
    const uniqMid = [...new Set(mid)];
    if (uniqMid.length === 1 && uniqMid[0] === '')
      return `${escapeLit(prefix)}${escapeLit(suffix)}`;
    const escaped = uniqMid.map((m) => escapeLit(m));
    return `${escapeLit(prefix)}(?:${escaped.join('|')})${escapeLit(suffix)}`;
  }

  const escaped = clean.map((s) => escapeLit(s));
  return `(?:${escaped.join('|')})`;
};

export const testRegex = (pattern: string, flags: string, tests: string[]): boolean[] => {
  try {
    const re = new RegExp(pattern, flags);
    return tests.map((t) => re.test(t));
  } catch {
    return tests.map(() => false);
  }
};
