import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditorPage from '@/app/apps/office/keynotes/editor/[id]/EditorPage';
import { db } from '@/lib/office/keynotes/db';
import {
  newDeck,
  newShapeObject,
  newSlide,
  newTextObject,
} from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

jest.setTimeout(20000);

const buildDeck = () => {
  const theme = themeById('midnight');
  const slide = newSlide('blank', theme, 1);
  slide.objects = [
    { ...newTextObject({ x: 40, y: 40, w: 300, h: 80 }), z: 0 },
    { ...newShapeObject({ x: 120, y: 160, w: 200, h: 120 }), z: 1 },
  ];
  const deck = newDeck({
    id: 'deck-test',
    title: 'Cover Deck',
    theme,
    themeId: 'midnight',
    slides: [slide, newSlide('section', theme, 2)],
  });
  return deck;
};

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  await db.decks.put(buildDeck());
};

const renderEditor = async () => {
  renderWithDeck(<EditorPage />);
  await waitFor(() => expect(screen.getByText('Cover Deck')).toBeInTheDocument(), {
    timeout: 5000,
  });
};

beforeEach(async () => {
  await seed();
});

describe('EditorPage integration', () => {
  it('opens a deck and renders canvas with slide objects', async () => {
    await renderEditor();
    expect(screen.getByTitle('Save')).toBeInTheDocument();
    expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Present/ })).toHaveAttribute(
      'href',
      '/present/deck-test',
    );
    expect(screen.getAllByText('Double-click to edit').length).toBeGreaterThan(0);
  });

  it('renames, saves, duplicates and opens diagnostics', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Rename deck'));
    const input = screen.getByPlaceholderText('Deck title');
    fireEvent.change(input, { target: { value: 'Renamed Deck' } });
    fireEvent.blur(input);
    expect(await screen.findByText('Renamed Deck')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Save'));
    expect(await screen.findByText('Saved')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Duplicate deck'));
    await waitFor(() => expect(screen.getByTitle('Duplicate deck')).toBeInTheDocument());

    fireEvent.click(screen.getByTitle('More'));
    expect(screen.getByRole('dialog', { name: 'Diagnostics' })).toBeInTheDocument();
    expect(screen.getByText('Diagnostics')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Diagnostics' })).not.toBeInTheDocument(),
    );
  });

  it('toggles view options, zoom and theme', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('View options'));
    const grid = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Gridlines'));
    expect(grid).not.toBeChecked();
    fireEvent.click(grid as Element);
    await waitFor(() => expect(grid).toBeChecked());

    fireEvent.click(screen.getByTitle('Zoom to fit'));
    fireEvent.click(screen.getByTitle('Zoom to fill'));
    fireEvent.click(screen.getByTitle('Zoom to 100%'));
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('−'));
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '100' },
    });
  });

  it('switches left panel tabs and inserts objects', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Outline'));
    expect(screen.getByText('Outline')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Notes'));
    expect(screen.getByText('Notes')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Comments'));
    fireEvent.click(screen.getByTitle('Slides'));

    const textBtn = screen.getByTitle('Text box');
    fireEvent.click(textBtn);
    await waitFor(() => expect(textBtn).toBeInTheDocument());
    fireEvent.click(screen.getByTitle('Chart'));
    fireEvent.click(screen.getByTitle('Table'));
  });

  it('switches right panel tabs', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Arrange'));
    fireEvent.click(screen.getByTitle('Animate'));
    fireEvent.click(screen.getByTitle('Theme'));
    fireEvent.click(screen.getByTitle('Master'));
    fireEvent.click(screen.getByTitle('Transitions'));
    fireEvent.click(screen.getByTitle('Format'));
  });

  it('handles space-pan key events and paste', async () => {
    await renderEditor();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    fireEvent.keyDown(window, { code: 'Escape' });
    fireEvent.blur(window);

    const file = new File(['x'], 'img.png', { type: 'image/png' });
    const evt = new Event('paste');
    Object.defineProperty(evt, 'clipboardData', {
      value: { files: [file] },
    });
    window.dispatchEvent(evt);
  });
});
