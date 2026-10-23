import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { db } from '@/lib/office/keynotes/db';
import { newDeck } from '@/lib/office/keynotes/deckFactory';

beforeEach(() => {
  __resetIdbMock();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '0';
});

describe('db.decks', () => {
  it('stores and retrieves decks', async () => {
    const deck = newDeck({ title: 'DB Deck' });
    await db.decks.put(deck);
    const found = await db.decks.get(deck.id);
    expect(found?.title).toBe('DB Deck');
    expect(found?.updatedAt).toBeGreaterThanOrEqual(deck.updatedAt);
  });

  it('lists all decks', async () => {
    await db.decks.put(newDeck());
    await db.decks.put(newDeck());
    const all = await db.decks.getAll();
    expect(all.length).toBe(2);
  });

  it('deletes a deck and its versions', async () => {
    const deck = newDeck();
    await db.decks.put(deck);
    await db.versions.put({
      id: 'v1',
      deckId: deck.id,
      createdAt: Date.now(),
      deck: deck,
      label: 'v1',
    });
    await db.decks.delete(deck.id);
    expect(await db.decks.get(deck.id)).toBeUndefined();
    expect(await db.versions.getAll(deck.id)).toEqual([]);
  });
});

describe('db.versions', () => {
  it('returns versions for a deck sorted newest first', async () => {
    await db.versions.put({
      id: 'v1',
      deckId: 'd',
      createdAt: 100,
      deck: newDeck(),
      label: 'v1',
    });
    await db.versions.put({
      id: 'v2',
      deckId: 'd',
      createdAt: 200,
      deck: newDeck(),
      label: 'v2',
    });
    await db.versions.put({
      id: 'other',
      deckId: 'x',
      createdAt: 300,
      deck: newDeck(),
      label: 'other',
    });
    const versions = await db.versions.getAll('d');
    expect(versions.map((v) => v.id)).toEqual(['v2', 'v1']);
  });

  it('deletes a single version', async () => {
    await db.versions.put({
      id: 'v1',
      deckId: 'd',
      createdAt: 100,
      deck: newDeck(),
      label: 'v1',
    });
    await db.versions.delete('v1');
    expect(await db.versions.getAll('d')).toEqual([]);
  });
});

describe('db.settings', () => {
  it('round-trips app settings', async () => {
    expect(await db.settings.get()).toBeUndefined();
    const settings = {
      id: 'app',
      theme: 'dark' as const,
      defaultSlideSize: '16-9' as const,
      defaultTheme: 'midnight',
      autosave: true,
    };
    await db.settings.put(settings);
    expect(await db.settings.get()).toEqual(settings);
  });
});
