import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { SlidesPanel } from '@/components/office/keynotes/organisms/panels/SlidesPanel';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { db } from '@/lib/office/keynotes/db';

const resetDB = __resetIdbMock;
const theme = themeById('midnight');

jest.mock('@/components/office/keynotes/organisms/panels/SlideThumb', () => ({
  SlideThumb: ({
    slideId,
    index,
    active,
    onSelect,
    onDelete,
    onDuplicate,
    onMove,
    onToggleHidden,
  }: any) => (
    <div data-testid={`thumb-${slideId}`}>
      <span data-testid={`thumb-index-${slideId}`}>{index}</span>
      {active && <span data-testid='active-indicator' />}
      <button onClick={() => onSelect(slideId)}>select</button>
      <button onClick={() => onDelete(slideId)}>delete</button>
      <button onClick={() => onDuplicate(slideId)}>duplicate</button>
      <button onClick={() => onMove(slideId, 1)}>moveDown</button>
      <button onClick={() => onMove(slideId, -1)}>moveUp</button>
      <button onClick={() => onToggleHidden(slideId)}>toggleHidden</button>
    </div>
  ),
}));

jest.mock('@/components/office/keynotes/organisms/panels/SectionGroup', () => ({
  SectionGroup: ({ section }: any) => (
    <div data-testid={`section-${section.id}`}>
      <span>{section.title}</span>
    </div>
  ),
}));

jest.mock('@/components/office/keynotes/organisms/panels/ReuseSlidesModal', () => ({
  ReuseSlidesModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid='reuse-modal'>
      <button onClick={onClose}>close modal</button>
    </div>
  ),
}));

jest.mock('@/components/office/keynotes/organisms/SlidePreview', () => ({
  SlidePreview: () => <div data-testid='slide-preview' />,
}));

const Consumer: React.FC<{ deckId: string }> = ({ deckId }) => {
  const { currentDeck, openDeck } = useDeck();
  useEffect(() => {
    void openDeck(deckId);
  }, [deckId, openDeck]);
  return (
    <div>
      <span data-testid='slideCount'>{currentDeck?.slides.length ?? 0}</span>
    </div>
  );
};

const renderPanel = async (deckId: string) => {
  const result = render(
    <DeckProvider>
      <Consumer deckId={deckId} />
      <SlidesPanel />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('slideCount')).not.toHaveTextContent('0'));
  return result;
};

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const deck = newDeck({
    id: 'sp-deck',
    title: 'Slides Panel Deck',
    slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2), newSlide('title', theme, 3)],
  });
  await db.decks.put(deck);
});

describe('SlidesPanel', () => {
  it('renders slide thumbnails', async () => {
    await renderPanel('sp-deck');
    const thumbs = screen.getAllByText('select');
    expect(thumbs.length).toBeGreaterThanOrEqual(3);
  });

  it('returns null when no deck is open', () => {
    render(
      <DeckProvider>
        <SlidesPanel />
      </DeckProvider>,
    );
    expect(screen.queryByText('New slide')).not.toBeInTheDocument();
  });

  it('toggles the layout menu open/close', async () => {
    await renderPanel('sp-deck');
    fireEvent.click(screen.getByText('New slide'));
    await waitFor(() => expect(screen.getByText('Title & content')).toBeInTheDocument());
    fireEvent.click(screen.getByText('New slide'));
    await waitFor(() => expect(screen.queryByText('Title & content')).not.toBeInTheDocument());
  });

  it('adds a slide from layout menu', async () => {
    await renderPanel('sp-deck');
    fireEvent.click(screen.getByText('New slide'));
    await waitFor(() => expect(screen.getByText('Cover')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Cover'));
    await waitFor(() => expect(screen.getByTestId('slideCount')).toHaveTextContent('4'));
  });

  it('opens the reuse slides modal', async () => {
    await renderPanel('sp-deck');
    const reuseBtn = screen.getAllByTitle('Reuse slides from other decks')[0];
    fireEvent.click(reuseBtn);
    await waitFor(() => expect(screen.getByTestId('reuse-modal')).toBeInTheDocument());
  });

  it('closes the reuse slides modal', async () => {
    await renderPanel('sp-deck');
    const reuseBtn = screen.getAllByTitle('Reuse slides from other decks')[0];
    fireEvent.click(reuseBtn);
    await waitFor(() => expect(screen.getByTestId('reuse-modal')).toBeInTheDocument());
    fireEvent.click(screen.getByText('close modal'));
    await waitFor(() => expect(screen.queryByTestId('reuse-modal')).not.toBeInTheDocument());
  });

  it('adds a new section', async () => {
    await renderPanel('sp-deck');
    const sectionBtn = screen.getAllByTitle('New section')[0];
    fireEvent.click(sectionBtn);
    await waitFor(() => {
      const sections = screen.getAllByTestId(/^section-/);
      expect(sections.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('selects a slide', async () => {
    await renderPanel('sp-deck');
    const selectBtns = screen.getAllByText('select');
    fireEvent.click(selectBtns[1]);
    await waitFor(() => {
      const activeIndicators = screen.getAllByTestId('active-indicator');
      expect(activeIndicators.length).toBe(1);
    });
  });

  it('duplicates a slide', async () => {
    await renderPanel('sp-deck');
    const dupBtns = screen.getAllByText('duplicate');
    fireEvent.click(dupBtns[0]);
    await waitFor(() => expect(screen.getByTestId('slideCount')).toHaveTextContent('4'));
  });

  it('deletes a slide', async () => {
    await renderPanel('sp-deck');
    const delBtns = screen.getAllByText('delete');
    fireEvent.click(delBtns[1]);
    await waitFor(() => expect(screen.getByTestId('slideCount')).toHaveTextContent('2'));
  });

  it('moves a slide', async () => {
    await renderPanel('sp-deck');
    const moveBtns = screen.getAllByText('moveDown');
    fireEvent.click(moveBtns[0]);
    await waitFor(() => expect(screen.getByTestId('slideCount')).toHaveTextContent('3'));
  });

  it('toggles slide hidden', async () => {
    await renderPanel('sp-deck');
    const toggleBtns = screen.getAllByText('toggleHidden');
    fireEvent.click(toggleBtns[0]);
    await waitFor(() => expect(screen.getByTestId('slideCount')).toHaveTextContent('3'));
  });
});
