import { fireEvent, screen, waitFor } from '@testing-library/react';
import PresenterView from '@/app/apps/office/keynotes/presenter/[id]/PresenterView';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide, newTextObject } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

const buildDeck = () => {
  const theme = themeById('midnight');
  const first = newSlide('blank', theme, 1);
  first.objects = [{ ...newTextObject({ x: 40, y: 40, w: 300, h: 80 }), z: 0 }];
  first.notes = '# Note title\nSome note';
  return newDeck({
    id: 'deck-test',
    title: 'Presenter Deck',
    theme,
    themeId: 'midnight',
    slides: [first, newSlide('section', theme, 2)],
  });
};

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  await db.decks.put(buildDeck());
};

const renderViewer = async () => {
  renderWithDeck(<PresenterView />);
  await waitFor(() => expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument());
};

beforeEach(async () => {
  await seed();
});

describe('PresenterView', () => {
  it('renders speaker notes and navigates', async () => {
    await renderViewer();
    expect(screen.getByText('Some note')).toBeInTheDocument();
    expect(screen.getByText('Up next:')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enter present mode' }));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument());
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('rehearses and shows the summary', async () => {
    await renderViewer();
    fireEvent.click(screen.getByTitle(/Track time per slide/));
    expect(screen.getByText('Rehearsing')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Finish & view summary'));
    expect(screen.getByText('Rehearsal summary')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  });

  it('shows end of deck state', async () => {
    await renderViewer();
    fireEvent.click(screen.getByText('1 / 2'));
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByText('End of deck')).toBeInTheDocument());
  });
});
