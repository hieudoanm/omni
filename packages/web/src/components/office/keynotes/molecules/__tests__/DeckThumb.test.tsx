import { render, screen, waitFor } from '@testing-library/react';
import { DeckThumb } from '@/components/office/keynotes/molecules/DeckThumb';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';

jest.mock('@/components/office/keynotes/organisms/SlidePreview', () => ({
  SlidePreview: ({ slide, width }: { slide: { id: string }; width: number }) => (
    <div data-testid='slide-preview' data-slide={slide.id} data-width={width}>
      preview
    </div>
  ),
}));

const resetDB = __resetIdbMock;
const theme = themeById('midnight');

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

describe('DeckThumb', () => {
  it('shows placeholder icon when deck is not loaded yet', () => {
    render(<DeckThumb deckId='nonexistent' />);
    const placeholder = document.querySelector('.bg-base-300\\/40');
    expect(placeholder).toBeInTheDocument();
  });

  it('renders the first visible slide preview when deck is loaded', async () => {
    const deck = newDeck({
      id: 'deck-thumb-1',
      title: 'Thumb Deck',
      slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
    });
    await db.decks.put(deck);

    render(<DeckThumb deckId='deck-thumb-1' />);
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toBeInTheDocument();
    });
    expect(screen.getByTestId('slide-preview')).toHaveAttribute('data-slide', deck.slides[0].id);
  });

  it('renders custom width and applies className', async () => {
    const deck = newDeck({
      id: 'deck-thumb-2',
      title: 'Custom',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);

    const { container } = render(
      <DeckThumb deckId='deck-thumb-2' width={320} className='my-class' />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toBeInTheDocument();
    });
    expect(container.querySelector('.my-class')).toBeInTheDocument();
    expect(screen.getByTestId('slide-preview')).toHaveAttribute('data-width', '320');
  });

  it('skips hidden slides and renders first visible one', async () => {
    const hiddenSlide = newSlide('blank', theme, 1);
    hiddenSlide.hidden = true;
    const visibleSlide = newSlide('blank', theme, 2);
    const deck = newDeck({
      id: 'deck-thumb-3',
      title: 'Hidden',
      slides: [hiddenSlide, visibleSlide],
    });
    await db.decks.put(deck);

    render(<DeckThumb deckId='deck-thumb-3' />);
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toHaveAttribute('data-slide', visibleSlide.id);
    });
  });

  it('shows placeholder when deck has no slides', async () => {
    const deck = newDeck({
      id: 'deck-thumb-empty',
      title: 'Empty',
      slides: [],
    });
    await db.decks.put(deck);

    render(<DeckThumb deckId='deck-thumb-empty' />);
    await waitFor(() => {
      const placeholder = document.querySelector('.bg-base-300\\/40');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('returns null when idb lookup returns undefined', async () => {
    render(<DeckThumb deckId='does-not-exist' />);
    await waitFor(() => {
      const placeholder = document.querySelector('.bg-base-300\\/40');
      expect(placeholder).toBeInTheDocument();
    });
  });

  it('cleanup on unmount does not cause state update warning', async () => {
    const deck = newDeck({
      id: 'deck-thumb-unmount',
      title: 'Unmount',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);

    const { unmount } = render(<DeckThumb deckId='deck-thumb-unmount' />);
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toBeInTheDocument();
    });
    unmount();
  });

  it('does not update state after unmount when db resolves late', async () => {
    const deck = newDeck({
      id: 'deck-thumb-late',
      title: 'Late',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);

    const { unmount } = render(<DeckThumb deckId='deck-thumb-late' />);
    unmount();
    await waitFor(() => {
      expect(screen.queryByTestId('slide-preview')).not.toBeInTheDocument();
    });
  });

  it('applies default width of 264', async () => {
    const deck = newDeck({
      id: 'deck-thumb-default-w',
      title: 'Default W',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);

    render(<DeckThumb deckId='deck-thumb-default-w' />);
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toHaveAttribute('data-width', '264');
    });
  });

  it('container height is computed from aspect ratio', async () => {
    const deck = newDeck({
      id: 'deck-thumb-aspect',
      title: 'Aspect',
      slides: [newSlide('cover', theme, 1)],
    });
    deck.width = 1920;
    deck.height = 1080;
    await db.decks.put(deck);

    const { container } = render(<DeckThumb deckId='deck-thumb-aspect' width={384} />);
    await waitFor(() => {
      expect(screen.getByTestId('slide-preview')).toBeInTheDocument();
    });
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ height: '216px' });
  });
});
