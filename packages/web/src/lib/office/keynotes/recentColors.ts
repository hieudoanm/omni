const KEY = 'keynotes:recent-colors';

export const getRecentColors = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((c) => typeof c === 'string') : [];
  } catch {
    return [];
  }
};

export const recordRecentColor = (color: string): void => {
  if (!/^#[0-9a-fA-F]{6}$/.test(color) || typeof window === 'undefined') return;
  try {
    const next = [
      color,
      ...getRecentColors().filter((c) => c.toLowerCase() !== color.toLowerCase()),
    ].slice(0, 8);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
};
