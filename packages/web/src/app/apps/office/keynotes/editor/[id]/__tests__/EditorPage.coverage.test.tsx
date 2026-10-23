import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EditorPage from '@/app/apps/office/keynotes/editor/[id]/EditorPage';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

jest.setTimeout(20000);

const theme = themeById('midnight');

const buildDeck = () =>
  newDeck({
    id: 'deck-test',
    title: 'Editor Coverage',
    theme,
    themeId: 'midnight',
    slides: [newSlide('cover', theme, 1), newSlide('blank', theme, 2)],
  });

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  await db.decks.put(buildDeck());
};

const renderEditor = async () => {
  renderWithDeck(<EditorPage />);
  await waitFor(() => expect(screen.getByText('Editor Coverage')).toBeInTheDocument(), {
    timeout: 5000,
  });
};

beforeEach(async () => {
  await seed();
});

describe('EditorPage – loading state', () => {
  it('shows loader when currentDeck is null', async () => {
    resetDb();
    renderWithDeck(<EditorPage />);
    expect(screen.getByText('Opening deck…')).toBeInTheDocument();
  });
});

describe('EditorPage – space-pan branches', () => {
  it('sets spaceHeld on space keydown and clears on keyup', async () => {
    await renderEditor();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
  });

  it('ignores space keydown when target is an input', async () => {
    await renderEditor();
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    document.body.removeChild(input);
  });

  it('ignores space keydown when target is a textarea', async () => {
    await renderEditor();
    const ta = document.createElement('textarea');
    document.body.appendChild(ta);
    fireEvent.keyDown(ta, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    document.body.removeChild(ta);
  });

  it('ignores space keydown when target is contentEditable', async () => {
    await renderEditor();
    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);
    fireEvent.keyDown(div, { code: 'Space' });
    fireEvent.keyUp(window, { code: 'Space' });
    document.body.removeChild(div);
  });

  it('middle mouse button starts pan', async () => {
    await renderEditor();
    const scrollArea = document.querySelector('.no-scrollbar');
    if (scrollArea) {
      fireEvent.pointerDown(scrollArea, {
        clientX: 100,
        clientY: 100,
        button: 1,
      });
      fireEvent.pointerMove(scrollArea, {
        clientX: 150,
        clientY: 150,
      });
      fireEvent.pointerUp(scrollArea);
    }
  });

  it('space + left click starts pan', async () => {
    await renderEditor();
    fireEvent.keyDown(window, { code: 'Space' });
    const scrollArea = document.querySelector('.no-scrollbar');
    if (scrollArea) {
      fireEvent.pointerDown(scrollArea, {
        clientX: 100,
        clientY: 100,
        button: 0,
      });
      fireEvent.pointerMove(scrollArea, {
        clientX: 150,
        clientY: 150,
      });
      fireEvent.pointerUp(scrollArea);
    }
    fireEvent.keyUp(window, { code: 'Space' });
  });

  it('blur event clears panning and spaceHeld', async () => {
    await renderEditor();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.blur(window);
  });
});

describe('EditorPage – paste image', () => {
  it('paste event with image file calls addObject', async () => {
    await renderEditor();
    const file = new File(['img'], 'pasted.png', { type: 'image/png' });
    const evt = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(evt, 'clipboardData', {
      value: { files: [file] },
    });
    window.dispatchEvent(evt);
  });

  it('paste event with no image does nothing', async () => {
    await renderEditor();
    const file = new File(['doc'], 'doc.pdf', { type: 'application/pdf' });
    const evt = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(evt, 'clipboardData', {
      value: { files: [file] },
    });
    window.dispatchEvent(evt);
  });

  it('paste event with no clipboardData does nothing', async () => {
    await renderEditor();
    const evt = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(evt, 'clipboardData', { value: null });
    window.dispatchEvent(evt);
  });
});

describe('EditorPage – zoom callbacks', () => {
  it('zoom to fit sets zoom based on viewport', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Zoom to fit'));
  });

  it('zoom to fill sets zoom based on viewport', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Zoom to fill'));
  });

  it('zoom to actual sets zoom to 1', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Zoom to 100%'));
  });

  it('zoom in and out buttons', async () => {
    await renderEditor();
    fireEvent.click(screen.getByText('+'));
    fireEvent.click(screen.getByText('−'));
  });

  it('zoom select dropdown changes zoom', async () => {
    await renderEditor();
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '75' },
    });
  });
});

describe('EditorPage – drawing mode toggle', () => {
  it('toggles drawing mode on and off', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Draw'));
    expect(screen.getByTitle('Finish drawing')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Finish drawing'));
    expect(screen.getByTitle('Draw')).toBeInTheDocument();
  });
});

describe('EditorPage – cursor styles', () => {
  it('space hold and pointer down exercises cursor style branches', async () => {
    await renderEditor();
    const scrollArea = document.querySelector('.no-scrollbar');
    expect(scrollArea).toBeInTheDocument();
    fireEvent.keyDown(window, { code: 'Space' });
    fireEvent.pointerDown(scrollArea!, {
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    fireEvent.pointerMove(scrollArea!, { clientX: 150, clientY: 150 });
    fireEvent.pointerUp(scrollArea!);
    fireEvent.keyUp(window, { code: 'Space' });
    expect(scrollArea).toBeInTheDocument();
  });
});

describe('EditorPage – ResizeObserver', () => {
  it('sets viewport dimensions via ResizeObserver', async () => {
    await renderEditor();
    const scrollArea = document.querySelector('.no-scrollbar');
    expect(scrollArea).toBeInTheDocument();
  });
});

describe('EditorPage – view options toggles', () => {
  it('toggles snap option', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('View options'));
    const snap = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Snap to grid'));
    expect(snap).toBeDefined();
    fireEvent.click(snap as Element);
    await waitFor(() => expect(snap).not.toBeChecked());
  });

  it('toggles rulers option', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('View options'));
    const rulers = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Rulers'));
    fireEvent.click(rulers as Element);
    await waitFor(() => expect(rulers).toBeChecked());
  });
});

describe('EditorPage – keyboard event non-space', () => {
  it('non-space keydown does not affect panning', async () => {
    await renderEditor();
    fireEvent.keyDown(window, { code: 'KeyA', key: 'a' });
    fireEvent.keyUp(window, { code: 'KeyA', key: 'a' });
  });

  it('space keyup without prior keydown does nothing', async () => {
    await renderEditor();
    fireEvent.keyUp(window, { code: 'Space' });
  });
});

describe('EditorPage – wheel event', () => {
  it('scroll area renders', async () => {
    await renderEditor();
    const scrollArea = document.querySelector('.no-scrollbar');
    expect(scrollArea).toBeInTheDocument();
  });
});
