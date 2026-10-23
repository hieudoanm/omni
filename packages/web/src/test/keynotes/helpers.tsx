import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { DeckProvider } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import type { Deck } from '@/types/keynotes/deck';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';

export const resetDb = (): void => {
  __resetIdbMock();
  (globalThis as unknown as { __resetRouterMock: () => void }).__resetRouterMock();
};

export const seedDeck = async (deck: Deck): Promise<void> => {
  await db.decks.put(deck);
};

export const renderWithDeck = (ui: ReactElement) => render(<DeckProvider>{ui}</DeckProvider>);
