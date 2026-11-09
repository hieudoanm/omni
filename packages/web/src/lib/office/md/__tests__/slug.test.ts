import { createSlugger } from '@/lib/office/md/slug';

describe('createSlugger', () => {
  it('slugifies text and dedupes repeated slugs', () => {
    const slugger = createSlugger();
    expect(slugger.slug('Hello World')).toBe('hello-world');
    expect(slugger.slug('Hello World')).toBe('hello-world-2');
    expect(slugger.slug('hello world!')).toBe('hello-world-3');
  });

  it('falls back to "section" when the text has no safe characters', () => {
    const slugger = createSlugger();
    expect(slugger.slug('!!!')).toBe('section');
  });
});
