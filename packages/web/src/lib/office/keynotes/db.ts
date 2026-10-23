import { openDB, type IDBPDatabase } from '@/lib/office/keynotes/idb';
import type { Deck, DeckSnapshot, AppSettings } from '@/types/keynotes/deck';

const DB_NAME = 'office-keynotes-db';
const DB_VERSION = 1;

const getMockDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  const delay = process.env.NEXT_PUBLIC_MOCK_DELAY;
  return delay ? parseInt(delay, 10) : 800;
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const getDB = (): Promise<IDBPDatabase> =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('decks')) db.createObjectStore('decks', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('versions'))
        db.createObjectStore('versions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings'))
        db.createObjectStore('settings', { keyPath: 'id' });
    },
  });

const mockDelay = async (): Promise<void> => {
  await delay(getMockDelay());
};

export const db = {
  decks: {
    getAll: async (): Promise<Deck[]> => {
      await mockDelay();
      return (await getDB()).getAll('decks');
    },
    get: async (id: string): Promise<Deck | undefined> => {
      await mockDelay();
      return (await getDB()).get('decks', id);
    },
    put: async (deck: Deck): Promise<void> => {
      await mockDelay();
      await (await getDB()).put('decks', { ...deck, updatedAt: Date.now() });
    },
    delete: async (id: string): Promise<void> => {
      await mockDelay();
      const dbConn = await getDB();
      await dbConn.delete('decks', id);
      const versions = await dbConn.getAll('versions');
      const tx = dbConn.transaction('versions', 'readwrite');
      for (const v of versions) {
        if (v.deckId === id) tx.store.delete(v.id);
      }
      await tx.done;
    },
  },
  versions: {
    getAll: async (deckId: string): Promise<DeckSnapshot[]> => {
      await mockDelay();
      const all = await (await getDB()).getAll('versions');
      return all.filter((v) => v.deckId === deckId).sort((a, b) => b.createdAt - a.createdAt);
    },
    put: async (snapshot: DeckSnapshot): Promise<void> => {
      await mockDelay();
      await (await getDB()).put('versions', snapshot);
    },
    delete: async (id: string): Promise<void> => {
      await mockDelay();
      await (await getDB()).delete('versions', id);
    },
  },
  settings: {
    get: async (): Promise<AppSettings | undefined> => {
      await mockDelay();
      return (await getDB()).get('settings', 'app');
    },
    put: async (settings: AppSettings): Promise<void> => {
      await mockDelay();
      await (await getDB()).put('settings', settings);
    },
  },
};
