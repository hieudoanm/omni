import { fireEvent, screen, waitFor } from '@testing-library/react';
import HandoutsPage from '@/app/apps/office/keynotes/handouts/[id]/HandoutsPage';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const theme = themeById('midnight');
  const first = newSlide('cover', theme, 1);
  first.notes = 'Handout note';
  await db.decks.put(
    newDeck({
      id: 'deck-test',
      title: 'Handouts Deck',
      theme,
      themeId: 'midnight',
      slides: [first, newSlide('section', theme, 2)],
    }),
  );
};

const renderHandouts = async () => {
  renderWithDeck(<HandoutsPage />);
  await waitFor(() => expect(screen.getByText('Handouts Deck')).toBeInTheDocument());
};

beforeEach(seed);

describe('HandoutsPage', () => {
  it('renders slides with notes and prints', async () => {
    await renderHandouts();
    expect(screen.getByText('2 slides · handouts')).toBeInTheDocument();
    expect(screen.getByText('Handout note')).toBeInTheDocument();
    window.print = jest.fn();
    fireEvent.click(screen.getByRole('button', { name: 'Print handouts' }));
    expect(window.print).toHaveBeenCalled();
  });

  it('switches slides per page layouts', async () => {
    await renderHandouts();
    fireEvent.click(screen.getByTitle('2 slides per page'));
    fireEvent.click(screen.getByTitle('3 slides per page'));
    fireEvent.click(screen.getByTitle('6 slides per page'));
    fireEvent.click(screen.getByTitle('1 slide per page'));
  });
});
