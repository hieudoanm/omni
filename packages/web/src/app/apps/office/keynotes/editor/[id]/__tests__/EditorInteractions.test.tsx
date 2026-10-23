import { fireEvent, screen, waitFor } from '@testing-library/react';
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

const buildDeck = () => {
  const theme = themeById('midnight');
  const slide = newSlide('blank', theme, 1);
  slide.objects = [
    { ...newTextObject({ x: 40, y: 40, w: 300, h: 80 }), z: 0 },
    { ...newShapeObject({ x: 120, y: 160, w: 200, h: 120 }), z: 1 },
  ];
  return newDeck({
    id: 'deck-test',
    title: 'Interaction Deck',
    theme,
    themeId: 'midnight',
    slides: [slide],
  });
};

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  await db.decks.put(buildDeck());
};

const getObjects = async () => (await db.decks.get('deck-test'))?.slides[0].objects ?? [];

const waitForObjects = (fn: () => Promise<void>) => waitFor(fn, { timeout: 4000 });

const renderEditor = async () => {
  renderWithDeck(<EditorPage />);
  await waitFor(() => expect(screen.getByText('Interaction Deck')).toBeInTheDocument(), {
    timeout: 5000,
  });
};

const canvasContainer = (): Element =>
  document.querySelector('.bg-neutral-950 .bg-neutral-950') as Element;

const pointer = (target: Element, type: string, init: MouseEventInit = {}) => {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
};

const toolbarBtn = (title: string): HTMLButtonElement => {
  const tb = document.querySelector('div[class*="h-11 shrink-0"]') as Element;
  return tb.querySelector(`[title="${title}"]`) as HTMLButtonElement;
};

const objectWrappers = (): Element[] => {
  const wraps = canvasContainer().querySelectorAll('div[style*="cursor: move"]');
  return Array.from(wraps);
};

beforeEach(async () => {
  await seed();
});

describe('EditorPage canvas interactions', () => {
  it('selects, moves and reorders objects', async () => {
    await renderEditor();
    const [textEl] = objectWrappers();
    const container = canvasContainer();

    pointer(textEl, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
    pointer(container, 'pointermove', { clientX: 150, clientY: 150 });
    pointer(container, 'pointerup', {});
    await waitForObjects(async () => {
      const o = (await getObjects())[0];
      expect(o.x).toBe(140);
      expect(o.y).toBe(140);
    });
  });

  it('edits text on double click and commits on blur', async () => {
    await renderEditor();
    const [textEl] = objectWrappers();
    fireEvent.doubleClick(textEl);
    const editable = document.querySelector('[contenteditable="true"]');
    expect(editable).not.toBeNull();
    (editable as HTMLElement).innerText = 'Hello Editor';
    fireEvent.blur(editable as Element);
    await waitForObjects(async () => {
      const o = (await getObjects())[0];
      expect(o.kind === 'text' ? o.text : null).toBe('Hello Editor');
    });
  });

  it('deselects on background click and marquee-selects multiple', async () => {
    await renderEditor();
    const container = canvasContainer();
    const [textEl] = objectWrappers();

    pointer(textEl, 'pointerdown', { clientX: 60, clientY: 60, button: 0 });
    pointer(container, 'pointerup', {});
    await waitFor(() => expect(screen.getByTitle('Duplicate (Ctrl+D)')).not.toBeDisabled());

    pointer(container, 'pointerdown', { clientX: 0, clientY: 0, button: 0 });
    pointer(container, 'pointerup', {});
    await waitFor(() => expect(screen.getByTitle('Duplicate (Ctrl+D)')).toBeDisabled());

    const [a, b] = objectWrappers();
    pointer(a, 'pointerdown', { clientX: 60, clientY: 60, button: 0 });
    pointer(container, 'pointerup', {});
    pointer(b, 'pointerdown', {
      clientX: 220,
      clientY: 220,
      button: 0,
      shiftKey: true,
    });
    pointer(container, 'pointerup', {});
    await waitFor(() =>
      expect(screen.getAllByTitle('Align left').some((el) => !el.hasAttribute('disabled'))).toBe(
        true,
      ),
    );
  });

  it('draws a stroke and creates a drawing object', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('Draw'));
    const container = canvasContainer();
    pointer(container, 'pointerdown', {
      clientX: 100,
      clientY: 100,
      button: 0,
    });
    pointer(container, 'pointermove', { clientX: 200, clientY: 200 });
    pointer(container, 'pointermove', { clientX: 300, clientY: 200 });
    pointer(container, 'pointerup', { clientX: 300, clientY: 200 });
    await waitForObjects(async () => {
      const objs = await getObjects();
      expect(objs.some((o) => o.kind === 'drawing')).toBe(true);
    });
  });
});

describe('EditorPage toolbar and panels', () => {
  it('inserts every object kind', async () => {
    await renderEditor();
    const before = (await getObjects()).length;
    fireEvent.click(screen.getByTitle('Text box'));
    fireEvent.click(screen.getByTitle('Shape'));
    fireEvent.click(screen.getByTitle('Chart'));
    fireEvent.click(screen.getByTitle('Table'));
    fireEvent.click(screen.getByTitle('Diagram'));
    fireEvent.click(screen.getByTitle('Icon'));
    fireEvent.click(screen.getByTitle('Equation'));
    await waitForObjects(async () => {
      const objs = await getObjects();
      expect(objs.length).toBeGreaterThan(before);
      expect(objs.some((o) => o.kind === 'chart')).toBe(true);
      expect(objs.some((o) => o.kind === 'table')).toBe(true);
      expect(objs.some((o) => o.kind === 'icon')).toBe(true);
      expect(objs.some((o) => o.kind === 'equation')).toBe(true);
    });
  });

  it('adds shapes and icons from dropdowns and alerts on screenshot', async () => {
    await renderEditor();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(screen.getByText('Shapes'));
    fireEvent.click(screen.getByTitle('triangle'));
    fireEvent.click(screen.getByText('Icons'));
    fireEvent.click(screen.getByTitle('Star'));
    fireEvent.click(screen.getByTitle('Screenshot'));
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    await waitForObjects(async () => {
      const objs = await getObjects();
      expect(objs.some((o) => o.kind === 'shape' && o.shapeType === 'triangle')).toBe(true);
      expect(objs.some((o) => o.kind === 'icon')).toBe(true);
    });
    alertSpy.mockRestore();
  });

  it('applies selection actions on grouped objects', async () => {
    await renderEditor();
    const container = canvasContainer();
    const [a, b] = objectWrappers();
    pointer(a, 'pointerdown', { clientX: 60, clientY: 60, button: 0 });
    pointer(container, 'pointerup', {});
    pointer(b, 'pointerdown', {
      clientX: 220,
      clientY: 220,
      button: 0,
      shiftKey: true,
    });
    pointer(container, 'pointerup', {});
    await waitFor(() => expect(screen.getByTitle('Group (Ctrl+G)')).not.toBeDisabled());

    fireEvent.click(toolbarBtn('Align left'));
    fireEvent.click(toolbarBtn('Distribute horizontally'));
    fireEvent.click(toolbarBtn('Bring to front'));
    fireEvent.click(toolbarBtn('Send to back'));
    fireEvent.click(toolbarBtn('Bring forward'));
    fireEvent.click(toolbarBtn('Send backward'));
    fireEvent.click(toolbarBtn('Group (Ctrl+G)'));
    await waitForObjects(async () => {
      const objs = await getObjects();
      expect(objs.some((o) => o.kind === 'group')).toBe(true);
    });
    const wrappers = objectWrappers();
    const groupEl = wrappers[wrappers.length - 1];
    pointer(groupEl, 'pointerdown', { clientX: 160, clientY: 160, button: 0 });
    pointer(canvasContainer(), 'pointerup', {});
    await waitFor(() => expect(toolbarBtn('Ungroup')).not.toBeDisabled(), {
      timeout: 4000,
    });
    fireEvent.click(toolbarBtn('Ungroup'));
    await waitForObjects(async () => {
      const objs = await getObjects();
      expect(objs.some((o) => o.kind === 'group')).toBe(false);
    });
  });

  it('edits format panel numbers and rotate buttons', async () => {
    await renderEditor();
    const [textEl] = objectWrappers();
    pointer(textEl, 'pointerdown', { clientX: 60, clientY: 60, button: 0 });
    pointer(canvasContainer(), 'pointerup', {});
    fireEvent.click(screen.getByTitle('Format'));
    await waitFor(() => expect(screen.getByLabelText('Rotate')).toBeInTheDocument(), {
      timeout: 4000,
    });

    fireEvent.change(screen.getByLabelText('Rotate'), {
      target: { value: '45' },
    });
    fireEvent.click(screen.getByTitle('Rotate 90° CW'));
    await waitForObjects(async () => {
      const o = (await getObjects())[0];
      expect(o.rotation).toBe(135);
    });
    fireEvent.click(screen.getByTitle('Rotate 90° CCW'));
    await waitForObjects(async () => {
      const o = (await getObjects())[0];
      expect(o.rotation).toBe(45);
    });
  });

  it('toggles rulers and gridlines from view options', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('View options'));
    const ruler = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Rulers'));
    const grid = screen
      .getAllByRole('checkbox')
      .find((c) => c.closest('label')?.textContent?.includes('Gridlines'));
    fireEvent.click(ruler as Element);
    await waitFor(() => expect(ruler).toBeChecked());
    expect(document.querySelectorAll('svg text').length).toBeGreaterThan(0);
    fireEvent.click(grid as Element);
    await waitFor(() => expect(grid).toBeChecked());
  });

  it('creates sections and opens the reuse modal', async () => {
    await renderEditor();
    fireEvent.click(screen.getByTitle('New section'));
    await waitFor(() => expect(screen.getByText('New section')).toBeInTheDocument(), {
      timeout: 4000,
    });
    fireEvent.click(screen.getByTitle('Reuse slides from other decks'));
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Reuse slides from other decks' }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  });
});
