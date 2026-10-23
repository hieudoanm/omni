import type { Note } from '@/lib/office/md/types';
import { seedNotes } from '@/data/office/md/seed';

export const STORAGE_KEY = 'markdown.vault.v2';

const isBrowser = (): boolean => typeof window !== 'undefined';

export const loadNotes = (): Note[] => {
  if (!isBrowser()) return seedNotes();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedNotes();

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return seedNotes();

    const notes = parsed.filter(
      (item): item is Note =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Note).id === 'string' &&
        typeof (item as Note).content === 'string',
    );
    return notes.length > 0 ? notes : seedNotes();
  } catch (err) {
    console.warn('[Storage] failed to load vault, seeding', err);
    return seedNotes();
  }
};

export const saveNotes = (notes: Note[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn('[Storage] failed to save vault', err);
  }
};

export const loadUiPreference = (key: string, fallback: boolean): boolean => {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : raw === 'true';
  } catch {
    return fallback;
  }
};

export const saveUiPreference = (key: string, value: boolean): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage unavailable — preference simply not persisted.
  }
};
