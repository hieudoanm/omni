import type { Note } from '@/lib/office/md/types';
import seedJson from './seed.gen.json';

export const seedNotes = (): Note[] => seedJson.map((note) => ({ ...note }));
