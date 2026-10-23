export interface Slugger {
  slug(text: string): string;
}

export const createSlugger = (): Slugger => {
  const counts = new Map<string, number>();

  return {
    slug(text: string): string {
      const base =
        text
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || 'section';
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      return count === 1 ? base : `${base}-${count}`;
    },
  };
};
