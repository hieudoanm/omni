import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import HomePage from '@/app/apps/office/keynotes/page';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
};

const seedDeck = async (id: string, title: string) => {
  const theme = themeById('midnight');
  await db.decks.put(
    newDeck({
      id,
      title,
      theme,
      themeId: 'midnight',
      slides: [newSlide('cover', theme, 1)],
    }),
  );
};

const renderHome = async () => {
  renderWithDeck(<HomePage />);
  await waitFor(() => expect(screen.getByText('Keynotes')).toBeInTheDocument());
  await waitFor(() => expect(screen.queryByLabelText('Loading decks')).not.toBeInTheDocument());
};

beforeEach(seed);

describe('HomePage', () => {
  it('shows the empty state when there are no decks', async () => {
    await renderHome();
    expect(screen.getByText('No decks yet. Create your first presentation.')).toBeInTheDocument();
  });

  it('lists decks and deletes one', async () => {
    await seedDeck('deck1', 'My Deck');
    await renderHome();
    expect(screen.getByText('My Deck')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Delete deck'));
    await waitFor(() =>
      expect(screen.getByText('No decks yet. Create your first presentation.')).toBeInTheDocument(),
    );
  });

  it('creates a new deck and navigates to the editor', async () => {
    await renderHome();
    fireEvent.click(screen.getByRole('button', { name: /New deck/ }));
    await waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith(expect.stringMatching(/^\/editor\//)),
    );
  });

  it('creates a deck from a template', async () => {
    await renderHome();
    fireEvent.click(screen.getByText('Pitch'));
    await waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith(expect.stringMatching(/^\/editor\//)),
    );
  });

  it('imports a deck from a Google Slides URL', async () => {
    await renderHome();
    fireEvent.click(screen.getByRole('button', { name: /^Import$/ }));
    fireEvent.click(screen.getByText(/Import from Google Slides/));
    const dialog = screen.getByRole('dialog', {
      name: 'Import from Google Slides',
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText('https://docs.google.com/presentation/d/…/edit'),
      { target: { value: 'https://docs.google.com/presentation/d/abc/edit' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Import' }));
    await waitFor(() =>
      expect(useRouter().push).toHaveBeenCalledWith(expect.stringMatching(/^\/editor\//)),
    );
  });

  it('shows an error for a non-Google URL', async () => {
    await renderHome();
    fireEvent.click(screen.getByRole('button', { name: /^Import$/ }));
    fireEvent.click(screen.getByText(/Import from Google Slides/));
    const dialog = screen.getByRole('dialog', {
      name: 'Import from Google Slides',
    });
    fireEvent.change(
      within(dialog).getByPlaceholderText('https://docs.google.com/presentation/d/…/edit'),
      { target: { value: 'https://example.com/foo' } },
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Import' }));
    expect(await screen.findByText('Not a Google Slides URL')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  });
});
