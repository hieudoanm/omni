import { fireEvent, screen, waitFor } from '@testing-library/react';
import PrintPage from '@/app/apps/office/keynotes/print/[id]/PrintPage';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const theme = themeById('midnight');
  const first = newSlide('cover', theme, 1);
  first.notes = 'Speaker note';
  await db.decks.put(
    newDeck({
      id: 'deck-test',
      title: 'Print Deck',
      theme,
      themeId: 'midnight',
      slides: [first, newSlide('section', theme, 2)],
    }),
  );
};

const renderPrint = async () => {
  renderWithDeck(<PrintPage />);
  await waitFor(() => expect(screen.getByText('Print Deck')).toBeInTheDocument());
};

beforeEach(seed);

describe('PrintPage', () => {
  it('renders slides with notes and prints', async () => {
    await renderPrint();
    expect(screen.getByText('2 slides · 16:9')).toBeInTheDocument();
    expect(screen.getByText('Speaker note')).toBeInTheDocument();
    window.print = jest.fn();
    fireEvent.click(screen.getByRole('button', { name: /Print \/ Save as PDF/ }));
    expect(window.print).toHaveBeenCalled();
  });

  it('exports deck formats', async () => {
    await renderPrint();
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
  });
});
