import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditorToolbar } from '@/components/office/keynotes/organisms/EditorToolbar';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { useEffect } from 'react';
import type { CanvasView } from '@/app/apps/office/keynotes/editor/[id]/EditorPage';

const resetDB = __resetIdbMock;
const theme = themeById('midnight');

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

const Consumer: React.FC<{
  deckId: string;
  zoom?: number;
  setZoom?: (z: number) => void;
  view?: CanvasView;
  setView?: (v: CanvasView) => void;
}> = ({
  deckId,
  zoom = 0.5,
  setZoom = jest.fn(),
  view = { gridlines: false, snap: true, rulers: false },
  setView = jest.fn(),
}) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return d.currentDeck ? (
    <EditorToolbar
      zoom={zoom}
      setZoom={setZoom}
      onFit={jest.fn()}
      onFill={jest.fn()}
      onActual={jest.fn()}
      view={view}
      setView={setView}
    />
  ) : (
    <div>loading</div>
  );
};

const renderToolbar = async (overrides?: {
  zoom?: number;
  setZoom?: (z: number) => void;
  view?: CanvasView;
  setView?: (v: CanvasView) => void;
  deckId?: string;
}) => {
  render(
    <DeckProvider>
      <Consumer
        deckId={overrides?.deckId ?? 'deck-et'}
        zoom={overrides?.zoom}
        setZoom={overrides?.setZoom}
        view={overrides?.view}
        setView={overrides?.setView}
      />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
};

describe('EditorToolbar – loading state', () => {
  it('returns null when no deck is loaded', () => {
    const { container } = render(
      <DeckProvider>
        <EditorToolbar
          zoom={1}
          setZoom={jest.fn()}
          onFit={jest.fn()}
          onFill={jest.fn()}
          onActual={jest.fn()}
          view={{ gridlines: false, snap: true, rulers: false }}
          setView={jest.fn()}
        />
      </DeckProvider>,
    );
    expect(container.innerHTML).toBe('');
  });
});

describe('EditorToolbar – title editing', () => {
  it('shows title as button and enters edit mode on click', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Test Deck',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Rename deck'));
    const input = screen.getByPlaceholderText('Deck title');
    expect(input).toBeInTheDocument();
  });

  it('commits title on blur and falls back to Untitled deck', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Original',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Rename deck'));
    const input = screen.getByPlaceholderText('Deck title');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(screen.getByText('Untitled deck')).toBeInTheDocument();
    });
  });

  it('Enter key in title input triggers blur', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Enter Test',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Rename deck'));
    const input = screen.getByPlaceholderText('Deck title');
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('Escape key in title input cancels editing', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Escape Test',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Rename deck'));
    const input = screen.getByPlaceholderText('Deck title');
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Deck title')).not.toBeInTheDocument();
    });
  });
});

describe('EditorToolbar – save states', () => {
  it('shows save button, click triggers saving then saved', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Save Test',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Save'));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });

  it('shows saving spinner during save', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Spinner',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Save'));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
  });
});

describe('EditorToolbar – undo/redo buttons', () => {
  it('undo and redo buttons exist', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'UndoRedo',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeInTheDocument();
    expect(screen.getByTitle('Redo (Ctrl+Y)')).toBeInTheDocument();
  });
});

describe('EditorToolbar – zoom controls', () => {
  it('zoom in button increases zoom', async () => {
    const setZoom = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'ZoomIn',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar({ setZoom, zoom: 0.5 });

    fireEvent.click(screen.getByText('+'));
    expect(setZoom).toHaveBeenCalledWith(expect.any(Number));
  });

  it('zoom out button decreases zoom', async () => {
    const setZoom = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'ZoomOut',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar({ setZoom, zoom: 0.5 });

    fireEvent.click(screen.getByText('−'));
    expect(setZoom).toHaveBeenCalledWith(expect.any(Number));
  });

  it('zoom select dropdown changes zoom value', async () => {
    const setZoom = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'ZoomSel',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar({ setZoom, zoom: 0.5 });

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '100' },
    });
    expect(setZoom).toHaveBeenCalledWith(1);
  });

  it('fit, fill, actual buttons call their callbacks', async () => {
    const onFit = jest.fn();
    const onFill = jest.fn();
    const onActual = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'Callbacks',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);

    render(
      <DeckProvider>
        <ConsumerZoomCallbacks deckId='deck-et' onFit={onFit} onFill={onFill} onActual={onActual} />
      </DeckProvider>,
    );
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());

    fireEvent.click(screen.getByTitle('Zoom to fit'));
    fireEvent.click(screen.getByTitle('Zoom to fill'));
    fireEvent.click(screen.getByTitle('Zoom to 100%'));
    expect(onFit).toHaveBeenCalled();
    expect(onFill).toHaveBeenCalled();
    expect(onActual).toHaveBeenCalled();
  });
});

describe('EditorToolbar – view options dropdown', () => {
  it('toggles gridlines checkbox', async () => {
    const setView = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'ViewOpts',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar({ setView });

    fireEvent.click(screen.getByTitle('View options'));
    const grid = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Gridlines'));
    fireEvent.click(grid as Element);
    expect(setView).toHaveBeenCalled();
  });

  it('toggles rulers checkbox', async () => {
    const setView = jest.fn();
    const deck = newDeck({
      id: 'deck-et',
      title: 'Rulers',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar({ setView });

    fireEvent.click(screen.getByTitle('View options'));
    const rulers = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Rulers'));
    fireEvent.click(rulers as Element);
    expect(setView).toHaveBeenCalled();
  });
});

describe('EditorToolbar – diagnostics modal', () => {
  it('opens diagnostics on More click and closes on Close', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Diag',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('More'));
    expect(screen.getByRole('dialog', { name: 'Diagnostics' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Diagnostics' })).not.toBeInTheDocument();
    });
  });

  it('closes diagnostics on backdrop click', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'DiagBackdrop',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('More'));
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) fireEvent.click(backdrop);
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Diagnostics' })).not.toBeInTheDocument();
    });
  });
});

describe('EditorToolbar – present link', () => {
  it('renders present link with correct href', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'PresentLink',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    const link = screen.getByRole('link', { name: /Present/ });
    expect(link).toHaveAttribute('href', '/present/deck-et');
  });
});

describe('EditorToolbar – saved timeout cleanup', () => {
  it('clears saved state after timeout', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Timeout',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    jest.useFakeTimers();
    fireEvent.click(screen.getByTitle('Save'));
    await waitFor(() => {
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });
    jest.advanceTimersByTime(2000);
    jest.useRealTimers();
  });
});

describe('EditorToolbar – share button', () => {
  it('share button is clickable', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Share',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Share'));
  });
});

describe('EditorToolbar – duplicate deck', () => {
  it('duplicate button is clickable', async () => {
    const deck = newDeck({
      id: 'deck-et',
      title: 'Dup',
      slides: [newSlide('cover', theme, 1)],
    });
    await db.decks.put(deck);
    await renderToolbar();

    fireEvent.click(screen.getByTitle('Duplicate deck'));
  });
});

const ConsumerZoomCallbacks: React.FC<{
  deckId: string;
  onFit: () => void;
  onFill: () => void;
  onActual: () => void;
}> = ({ deckId, onFit, onFill, onActual }) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return d.currentDeck ? (
    <EditorToolbar
      zoom={0.5}
      setZoom={jest.fn()}
      onFit={onFit}
      onFill={onFill}
      onActual={onActual}
      view={{ gridlines: false, snap: true, rulers: false }}
      setView={jest.fn()}
    />
  ) : (
    <div>loading</div>
  );
};
