/**
 * @jest-environment node
 */

import { loadNotes, saveNotes } from '@/lib/office/md/storage';
import { seedNotes } from '@/data/office/md/seed';

describe('storage (server)', () => {
  it('seeds and no-ops when running outside a browser', () => {
    expect(typeof window).toBe('undefined');
    expect(loadNotes()).toEqual(seedNotes());
    expect(() => saveNotes([])).not.toThrow();
  });
});
