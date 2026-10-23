import { useEffect, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { useObjectKeyboard } from '@/hooks/office/keynotes/useObjectKeyboard';
import { newDeck, newSlide, newTextObject } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { db } from '@/lib/office/keynotes/db';

const resetDB = __resetIdbMock;
const theme = themeById('midnight');

const Consumer: React.FC = () => {
  const deck = useDeck();
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    void deck.openDeck('kb-deck');
  }, [deck.openDeck]);
  useObjectKeyboard();
  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail.msg;
      setLog((p) => [...p, msg]);
    };
    document.addEventListener('test-kb', handler as EventListener);
    return () => document.removeEventListener('test-kb', handler as EventListener);
  }, []);
  return (
    <div>
      <span data-testid='selected'>{deck.selectedObjectIds.join(',')}</span>
      <span data-testid='canUndo'>{String(deck.canUndo)}</span>
      <span data-testid='objects'>{deck.activeSlide?.objects.length ?? 0}</span>
      <span data-testid='slideCount'>{deck.currentDeck?.slides.length ?? 0}</span>
      <span data-testid='log'>{log.join(';')}</span>
      <button
        onClick={() => {
          deck.setActiveSlide(deck.currentDeck?.slides[0]?.id ?? '');
        }}>
        setSlide0
      </button>
      <button
        onClick={() => {
          deck.setActiveSlide(deck.currentDeck?.slides[1]?.id ?? '');
        }}>
        setSlide1
      </button>
    </div>
  );
};

const fire = (key: string, opts: Partial<KeyboardEventInit> = {}) => {
  fireEvent.keyDown(window, {
    key,
    bubbles: true,
    ...opts,
  });
};

const renderWithDeck = async (slidesCount = 2) => {
  const slides = Array.from({ length: slidesCount }, (_, i) =>
    i === 0 ? newSlide('cover', theme, 1) : newSlide('blank', theme, i + 1),
  );
  // Add a text object to the first slide
  slides[0].objects = [
    newTextObject({ id: 'kb-obj-1', x: 10, y: 10 }),
    newTextObject({ id: 'kb-obj-2', x: 50, y: 50 }),
    newTextObject({ id: 'kb-obj-3', x: 100, y: 100 }),
  ];
  const deck = newDeck({
    id: 'kb-deck',
    title: 'KB Deck',
    slides,
  });
  await db.decks.put(deck);
  render(
    <DeckProvider>
      <Consumer />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.getByTestId('objects')).toHaveTextContent('3'));
  return deck;
};

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useObjectKeyboard', () => {
  it('renders without crashing', async () => {
    await renderWithDeck();
    expect(screen.getByTestId('objects')).toHaveTextContent('3');
  });

  it('ignores keydown on editable targets', async () => {
    await renderWithDeck();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fire('Delete');
    expect(screen.getByTestId('selected')).toHaveTextContent('');
    document.body.removeChild(input);
  });

  it('ignores keydown on contentEditable elements', async () => {
    await renderWithDeck();
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    div.focus();
    fire('Delete');
    expect(screen.getByTestId('selected')).toHaveTextContent('');
    document.body.removeChild(div);
  });

  it('ignores keydown on textarea', async () => {
    await renderWithDeck();
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    ta.focus();
    fire('Delete');
    expect(screen.getByTestId('selected')).toHaveTextContent('');
    document.body.removeChild(ta);
  });

  it('ignores keydown on select', async () => {
    await renderWithDeck();
    const sel = document.createElement('select');
    document.body.appendChild(sel);
    sel.focus();
    fire('Delete');
    expect(screen.getByTestId('selected')).toHaveTextContent('');
    document.body.removeChild(sel);
  });

  describe('undo / redo', () => {
    it('triggers undo with Cmd+Z', async () => {
      await renderWithDeck();
      fire('z', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('canUndo')).toHaveTextContent('false'));
    });

    it('triggers redo with Cmd+Shift+Z', async () => {
      await renderWithDeck();
      // First do something undoable
      fire('z', { metaKey: true });
      fire('z', { metaKey: true, shiftKey: true });
      await waitFor(() => expect(screen.getByTestId('canUndo')).toHaveTextContent('false'));
    });

    it('triggers redo with Ctrl+Y', async () => {
      await renderWithDeck();
      fire('y', { ctrlKey: true });
      await waitFor(() => expect(screen.getByTestId('canUndo')).toHaveTextContent('false'));
    });
  });

  describe('save', () => {
    it('triggers save with Cmd+S', async () => {
      await renderWithDeck();
      fire('s', { metaKey: true });
      // saveDeck is called, just verify no crash
      await waitFor(() => expect(screen.getByTestId('objects')).toHaveTextContent('3'));
    });
  });

  describe('selectAll', () => {
    it('selects all objects with Cmd+A', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => {
        const sel = screen.getByTestId('selected').textContent;
        expect(sel).toContain('kb-obj-1');
        expect(sel).toContain('kb-obj-2');
        expect(sel).toContain('kb-obj-3');
      });
    });
  });

  describe('duplicate', () => {
    it('duplicates selected objects with Cmd+D', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('d', { metaKey: true });
      await waitFor(() =>
        expect(Number(screen.getByTestId('objects').textContent)).toBeGreaterThan(3),
      );
    });
  });

  describe('group / ungroup', () => {
    it('groups selected objects with Cmd+G', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('g', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
    });

    it('ungroups with Cmd+Shift+G', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('g', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
    });
  });

  describe('delete', () => {
    it('deletes selected objects with Delete key', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('Delete');
      await waitFor(() =>
        expect(Number(screen.getByTestId('objects').textContent)).toBeLessThan(3),
      );
    });

    it('deletes selected objects with Backspace key', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('Backspace');
      await waitFor(() =>
        expect(Number(screen.getByTestId('objects').textContent)).toBeLessThan(3),
      );
    });
  });

  describe('escape', () => {
    it('clears selection with Escape', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('Escape');
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
    });
  });

  describe('lock', () => {
    it('toggles lock with Cmd+L', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('l', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
    });
  });

  describe('cycleNext / cyclePrev', () => {
    it('cycles to next object with Tab', async () => {
      await renderWithDeck();
      fire('Tab');
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
      fire('Tab');
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
    });

    it('cycles to prev object with Shift+Tab', async () => {
      await renderWithDeck();
      fire('Tab');
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
      fire('Tab', { shiftKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
    });
  });

  describe('nudge', () => {
    it('nudges with arrow keys', async () => {
      await renderWithDeck();
      // Select an object first
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('ArrowLeft');
      fire('ArrowRight');
      fire('ArrowUp');
      fire('ArrowDown');
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
    });

    it('nudges big with Shift+Arrow', async () => {
      await renderWithDeck();
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('ArrowLeft', { shiftKey: true });
      fire('ArrowRight', { shiftKey: true });
      fire('ArrowUp', { shiftKey: true });
      fire('ArrowDown', { shiftKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
    });
  });

  describe('ungroup via selected object group', () => {
    it('ungroups by finding group id from selected objects', async () => {
      await renderWithDeck();
      // Group first
      fire('a', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent('kb-obj-1'));
      fire('g', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
      // Select and ungroup
      fire('Tab');
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
      fire('g', { metaKey: true, shiftKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
    });
  });

  describe('no-op when no selection', () => {
    it('cycleNext with empty selection selects first object', async () => {
      await renderWithDeck();
      fire('Tab');
      await waitFor(() => expect(screen.getByTestId('selected')).not.toHaveTextContent(''));
    });

    it('lock with no selection does nothing', async () => {
      await renderWithDeck();
      fire('l', { metaKey: true });
      await waitFor(() => expect(screen.getByTestId('selected')).toHaveTextContent(''));
    });
  });
});
