import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReuseSlidesModal } from '@/components/office/keynotes/organisms/panels/ReuseSlidesModal';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { useEffect } from 'react';

jest.mock('@/components/office/keynotes/organisms/SlidePreview', () => ({
  SlidePreview: () => <div data-testid='slide-preview' />,
}));

const resetDB = __resetIdbMock;
const theme = themeById('midnight');

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

const Consumer: React.FC<{
  deckId: string;
  onClose: () => void;
}> = ({ deckId, onClose }) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return d.currentDeck ? <ReuseSlidesModal onClose={onClose} /> : <div>loading</div>;
};

const renderModal = async (opts?: {
  deckId?: string;
  onClose?: () => void;
  otherDecks?: ReturnType<typeof newDeck>[];
}) => {
  const onClose = opts?.onClose ?? jest.fn();
  const current = newDeck({
    id: opts?.deckId ?? 'deck-reuse',
    title: 'Current',
    slides: [newSlide('cover', theme, 1)],
  });
  await db.decks.put(current);
  if (opts?.otherDecks) {
    for (const d of opts.otherDecks) await db.decks.put(d);
  }
  render(
    <DeckProvider>
      <Consumer deckId={opts?.deckId ?? 'deck-reuse'} onClose={onClose} />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
  return onClose;
};

describe('ReuseSlidesModal', () => {
  it('returns null when currentDeck is not loaded', () => {
    const { container } = render(
      <DeckProvider>
        <ReuseSlidesModal onClose={jest.fn()} />
      </DeckProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows empty decks message when no other decks exist', async () => {
    await renderModal();
    expect(
      screen.getByText('No other decks found. Create another deck first.'),
    ).toBeInTheDocument();
  });

  it('lists other decks and toggles expand/collapse', async () => {
    const other = newDeck({
      id: 'deck-other',
      title: 'Other Deck',
      slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
    });
    const onClose = await renderModal({ otherDecks: [other] });

    await waitFor(() => {
      expect(screen.getByText('Other Deck')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Other Deck'));
    await waitFor(() => {
      expect(screen.getAllByTestId('slide-preview').length).toBe(2);
    });

    fireEvent.click(screen.getByText('Other Deck'));
    await waitFor(() => {
      expect(screen.queryAllByTestId('slide-preview').length).toBe(0);
    });
  });

  it('inserts slide from another deck and closes', async () => {
    const other = newDeck({
      id: 'deck-other',
      title: 'Other',
      slides: [newSlide('cover', theme, 1)],
    });
    const onClose = await renderModal({ otherDecks: [other] });

    await waitFor(() => {
      expect(screen.getByText('Other')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Other'));
    await waitFor(() => {
      expect(screen.getByTitle(/Insert/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle(/Insert/));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on backdrop click', async () => {
    const onClose = await renderModal();
    const backdrop = document.querySelector('.fixed.inset-0');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on close button click', async () => {
    const onClose = await renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('dialog stops propagation on inner click', async () => {
    const onClose = await renderModal();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows "no slides" for expanded deck with 0 slides', async () => {
    const empty = newDeck({
      id: 'deck-empty',
      title: 'Empty Deck',
      slides: [],
    });
    await renderModal({ otherDecks: [empty] });

    await waitFor(() => {
      expect(screen.getByText('Empty Deck')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Empty Deck'));
    await waitFor(() => {
      expect(screen.getByText('This deck has no slides.')).toBeInTheDocument();
    });
  });

  it('cleanup on unmount does not cause state update warning', async () => {
    const deck = newDeck({
      id: 'deck-reuse',
      title: 'Cleanup',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    const { unmount } = render(
      <DeckProvider>
        <Consumer deckId='deck-reuse' onClose={jest.fn()} />
      </DeckProvider>,
    );
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
    unmount();
  });

  it('insert uses appendSlides when activeSlideId is null', async () => {
    const current = newDeck({
      id: 'deck-reuse',
      title: 'Current',
      slides: [newSlide('cover', theme, 1)],
    });
    const other = newDeck({
      id: 'deck-other',
      title: 'Other',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(current);
    await db.decks.put(other);
    const onClose = jest.fn();

    render(
      <DeckProvider>
        <Consumer deckId='deck-reuse' onClose={onClose} />
      </DeckProvider>,
    );
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
  });

  it('shows slide count per other deck', async () => {
    const other = newDeck({
      id: 'deck-count',
      title: 'Count Deck',
      slides: [
        newSlide('cover', theme, 1),
        newSlide('blank', theme, 2),
        newSlide('title', theme, 3),
      ],
    });
    await renderModal({ otherDecks: [other] });

    await waitFor(() => {
      expect(screen.getByText('Count Deck')).toBeInTheDocument();
    });

    expect(screen.getByText('3 slides')).toBeInTheDocument();
  });
});
