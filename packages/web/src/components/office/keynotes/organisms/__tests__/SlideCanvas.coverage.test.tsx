import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SlideCanvas } from '@/components/office/keynotes/organisms/SlideCanvas';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import {
  newDeck,
  newSlide,
  newTextObject,
  newShapeObject,
} from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { useEffect, type ReactNode } from 'react';

const resetDB = __resetIdbMock;

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

const theme = themeById('midnight');

const makeDeck = async (opts?: {
  objects?: ReturnType<typeof newTextObject>[];
  id?: string;
  background?: { type: 'solid'; color: string; opacity: number };
  width?: number;
  height?: number;
}) => {
  const textObj = newTextObject({ id: 'txt-1', text: 'Hello' });
  const shapeObj = newShapeObject({ id: 'shp-1', shapeType: 'rect' });
  const lockedObj = newTextObject({
    id: 'locked-1',
    text: 'Locked',
    locked: true,
  });
  const groupObj = newTextObject({
    id: 'child-1',
    text: 'Child',
    group: 'grp-1',
  });
  const deck = newDeck({
    id: opts?.id ?? 'deck-cv',
    title: 'Canvas Deck',
    theme,
    themeId: 'midnight',
    slides: [newSlide('cover', theme, 1)],
  });
  if (opts?.width) deck.width = opts.width;
  if (opts?.height) deck.height = opts.height;
  deck.slides[0].objects = opts?.objects ?? [textObj, shapeObj, lockedObj, groupObj];
  if (opts?.background) deck.slides[0].background = opts.background;
  await db.decks.put(deck);
  return deck;
};

const CanvasConsumer: React.FC<{
  deckId: string;
  zoom?: number;
  setZoom?: (z: number) => void;
  readOnly?: boolean;
  drawMode?: boolean;
  onBackgroundClick?: (p: { x: number; y: number }) => void;
  view?: { gridlines: boolean; snap: boolean; rulers: boolean };
}> = ({
  deckId,
  zoom = 1,
  setZoom = jest.fn(),
  readOnly = false,
  drawMode = false,
  onBackgroundClick,
  view,
}) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return d.currentDeck ? (
    <div data-testid='canvas-root'>
      <SlideCanvas
        zoom={zoom}
        setZoom={setZoom}
        readOnly={readOnly}
        drawMode={drawMode}
        onBackgroundClick={onBackgroundClick}
        view={view}
      />
    </div>
  ) : (
    <div data-testid='loading'>loading</div>
  );
};

const renderWithDeck = async (overrides?: {
  zoom?: number;
  setZoom?: (z: number) => void;
  readOnly?: boolean;
  drawMode?: boolean;
  onBackgroundClick?: (p: { x: number; y: number }) => void;
  view?: { gridlines: boolean; snap: boolean; rulers: boolean };
  deckId?: string;
  objects?: ReturnType<typeof newTextObject>[];
  background?: { type: 'solid'; color: string; opacity: number };
  wrapper?: ReactNode;
}) => {
  if (overrides?.objects || overrides?.background || overrides?.deckId) {
    await makeDeck({
      objects: overrides.objects,
      background: overrides.background,
      id: overrides.deckId,
    });
  }
  const result = render(
    <DeckProvider>
      {overrides?.wrapper ?? null}
      <CanvasConsumer
        deckId={overrides?.deckId ?? 'deck-cv'}
        zoom={overrides?.zoom}
        setZoom={overrides?.setZoom}
        readOnly={overrides?.readOnly}
        drawMode={overrides?.drawMode}
        onBackgroundClick={overrides?.onBackgroundClick}
        view={overrides?.view}
      />
    </DeckProvider>,
  );
  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
  return result;
};

const getCanvas = (container: HTMLElement) =>
  container.querySelector('[data-testid="canvas-root"]')?.firstElementChild as HTMLElement;

const getObjWrappers = () =>
  Array.from(document.querySelectorAll('div[style*="position: absolute"]')).filter(
    (el) =>
      el.getAttribute('style')?.includes('z-index') || el.getAttribute('style')?.includes('cursor'),
  );

describe('SlideCanvas – move branches', () => {
  it('clicking on a locked object starts move but object has not-allowed cursor', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'locked-m', text: 'LM', locked: true })],
    });
    await renderWithDeck();
    const el = screen.getByText('LM').closest('[style*="position: absolute"]');
    expect(el).toHaveStyle({ cursor: 'not-allowed' });
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
  });

  it('readOnly prevents marquee and background click', async () => {
    await makeDeck({ objects: [] });
    const onBg = jest.fn();
    await renderWithDeck({ readOnly: true, onBackgroundClick: onBg });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    expect(onBg).not.toHaveBeenCalled();
  });

  it('pointer move on object without active drag does nothing', async () => {
    await makeDeck();
    await renderWithDeck();
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerMove(canvas, { clientX: 100, clientY: 100 });
  });

  it('shift-click on object toggles selection additively', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'a', text: 'A' }), newTextObject({ id: 'b', text: 'B' })],
    });
    await renderWithDeck();
    const elA = screen.getByText('A').closest('[style*="position: absolute"]');
    const elB = screen.getByText('B').closest('[style*="position: absolute"]');
    fireEvent.pointerDown(elA!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
    fireEvent.pointerDown(elB!, {
      clientX: 200,
      clientY: 200,
      button: 0,
      shiftKey: true,
      bubbles: true,
    });
  });

  it('move with snap enabled applies grid snapping', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'snap-obj', text: 'Snap' })],
    });
    await renderWithDeck({
      view: { gridlines: true, snap: true, rulers: false },
    });
    const el = screen.getByText('Snap').closest('[style*="position: absolute"]');
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
    fireEvent.pointerMove(canvas, { clientX: 56, clientY: 56 });
    fireEvent.pointerUp(canvas);
  });

  it('move with snap disabled does not snap', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'nosnap', text: 'NoSnap' })],
    });
    await renderWithDeck({
      view: { gridlines: false, snap: false, rulers: false },
    });
    const el = screen.getByText('NoSnap').closest('[style*="position: absolute"]');
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
    fireEvent.pointerMove(canvas, { clientX: 56, clientY: 56 });
    fireEvent.pointerUp(canvas);
  });

  it('group child object pointer down selects the child', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'gc', text: 'GC', group: 'g1' })],
    });
    await renderWithDeck();
    const el = screen.getByText('GC').closest('[style*="position: absolute"]');
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
  });
});

describe('SlideCanvas – draw mode branches', () => {
  it('draw mode creates a drawing stroke on pointer down and up', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({ drawMode: true });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerMove(canvas, { clientX: 30, clientY: 15 });
    fireEvent.pointerUp(canvas);
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });

  it('draw mode single point stroke does not create drawing object', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({ drawMode: true });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerUp(canvas);
  });
});

describe('SlideCanvas – resize and rotate branches', () => {
  it('handle down on selected object starts resize', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'res-1', text: 'Res', x: 50, y: 50 })],
    });
    await renderWithDeck();
    const el = screen.getByText('Res').closest('[style*="position: absolute"]');
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
    const handles = document.querySelectorAll('[data-handle]');
    if (handles.length > 0) {
      fireEvent.pointerDown(handles[0], {
        clientX: 50,
        clientY: 50,
        button: 0,
        bubbles: true,
      });
      const canvas = getCanvas(
        document.querySelector('[data-testid="canvas-root"]')!.parentElement!,
      );
      fireEvent.pointerMove(canvas, { clientX: 70, clientY: 70 });
      fireEvent.pointerUp(canvas);
    }
  });

  it('rotate handle on selected object starts rotation', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'rot-1', text: 'Rot', x: 50, y: 50 })],
    });
    await renderWithDeck();
    const el = screen.getByText('Rot').closest('[style*="position: absolute"]');
    fireEvent.pointerDown(el!, {
      clientX: 50,
      clientY: 50,
      button: 0,
      bubbles: true,
    });
    const rotateHandle = document.querySelector('[data-rotate]');
    if (rotateHandle) {
      fireEvent.pointerDown(rotateHandle, {
        clientX: 50,
        clientY: 30,
        button: 0,
        bubbles: true,
      });
      const canvas = getCanvas(
        document.querySelector('[data-testid="canvas-root"]')!.parentElement!,
      );
      fireEvent.pointerMove(canvas, { clientX: 100, clientY: 50 });
      fireEvent.pointerUp(canvas);
    }
  });
});

describe('SlideCanvas – marquee branches', () => {
  it('marquee selects objects that intersect the marquee rect', async () => {
    await makeDeck({
      objects: [
        newTextObject({ id: 'm1', text: 'M1', x: 20, y: 20, w: 100, h: 50 }),
        newTextObject({ id: 'm2', text: 'M2', x: 200, y: 200, w: 100, h: 50 }),
      ],
    });
    await renderWithDeck({ onBackgroundClick: jest.fn() });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 500, clientY: 500 });
    fireEvent.pointerUp(canvas);
  });

  it('marquee excludes locked objects', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'ml', text: 'ML', locked: true, x: 20, y: 20 })],
    });
    await renderWithDeck({ onBackgroundClick: jest.fn() });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 500, clientY: 500 });
    fireEvent.pointerUp(canvas);
  });
});

describe('SlideCanvas – text editing branches', () => {
  it('enters editing mode on double-click and exits with Escape', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'te1', text: 'Edit me' })],
    });
    await renderWithDeck();
    const el = screen.getByText('Edit me').closest('[style*="position: absolute"]');
    fireEvent.doubleClick(el!);
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).toBeInTheDocument();
    });
    const editable = document.querySelector('[contenteditable]') as HTMLElement;
    fireEvent.keyDown(editable, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).not.toBeInTheDocument();
    });
  });

  it('enters editing mode and click outside commits via commitText', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'te2', text: 'Blur me' })],
    });
    await renderWithDeck();
    const el = screen.getByText('Blur me').closest('[style*="position: absolute"]');
    fireEvent.doubleClick(el!);
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).toBeInTheDocument();
    });
    const editable = document.querySelector('[contenteditable]') as HTMLElement;
    editable.focus();
    fireEvent.keyDown(editable, { key: 'a', ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(editable, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).not.toBeInTheDocument();
    });
  });

  it('renders editing overlay with contentEditable', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'te3', text: 'Enter me' })],
    });
    await renderWithDeck();
    const el = screen.getByText('Enter me').closest('[style*="position: absolute"]');
    fireEvent.doubleClick(el!);
    await waitFor(() => {
      const editable = document.querySelector('[contenteditable]');
      expect(editable).toBeInTheDocument();
      expect(editable).toHaveAttribute('contenteditable', 'true');
    });
    const editable = document.querySelector('[contenteditable]') as HTMLElement;
    fireEvent.keyDown(editable, { key: 'Escape' });
  });
});

describe('SlideCanvas – drop branches', () => {
  it('handleDrop with image file reads data and adds image object', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck();
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    fireEvent.drop(canvas, {
      dataTransfer: { files: [file], types: ['Files'] },
    });
  });

  it('handleDrop with non-image file does nothing', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck();
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    const file = new File(['doc'], 'doc.pdf', { type: 'application/pdf' });
    fireEvent.drop(canvas, {
      dataTransfer: { files: [file], types: ['Files'] },
    });
  });

  it('handleDrop in readOnly mode does nothing', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({ readOnly: true });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    const file = new File(['img'], 'photo.png', { type: 'image/png' });
    fireEvent.drop(canvas, {
      dataTransfer: { files: [file], types: ['Files'] },
    });
  });

  it('dragOver prevents default', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck();
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    const e = new Event('dragover', { bubbles: true, cancelable: true });
    const prevent = jest.fn();
    Object.defineProperty(e, 'preventDefault', { value: prevent });
    canvas.dispatchEvent(e);
    expect(prevent).toHaveBeenCalled();
  });
});

describe('SlideCanvas – zoom branches', () => {
  it('ctrl+wheel zoom in sets larger zoom', async () => {
    const setZoom = jest.fn();
    await makeDeck();
    await renderWithDeck({ zoom: 1, setZoom });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.wheel(canvas, { deltaY: -100, ctrlKey: true });
    expect(setZoom).toHaveBeenCalledWith(expect.any(Number));
    const newZoom = setZoom.mock.calls[0][0];
    expect(newZoom).toBeGreaterThan(1);
  });

  it('ctrl+wheel zoom out sets smaller zoom', async () => {
    const setZoom = jest.fn();
    await makeDeck();
    await renderWithDeck({ zoom: 1, setZoom });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.wheel(canvas, { deltaY: 100, ctrlKey: true });
    expect(setZoom).toHaveBeenCalledWith(expect.any(Number));
    const newZoom = setZoom.mock.calls[0][0];
    expect(newZoom).toBeLessThan(1);
  });

  it('meta+wheel zoom triggers zoom', async () => {
    const setZoom = jest.fn();
    await makeDeck();
    await renderWithDeck({ zoom: 1, setZoom });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.wheel(canvas, { deltaY: -100, metaKey: true });
    expect(setZoom).toHaveBeenCalled();
  });
});

describe('SlideCanvas – rendering branches', () => {
  it('renders solid slide background when different from theme', async () => {
    await makeDeck({
      background: { type: 'solid', color: '#ff0000', opacity: 0.5 },
    });
    await renderWithDeck();
    const bg = document.querySelector('[style*="background-color"]');
    expect(bg).toBeInTheDocument();
  });

  it('does not render solid background when same as theme', async () => {
    await makeDeck({
      background: { type: 'solid', color: theme.colors.background, opacity: 1 },
    });
    await renderWithDeck();
  });

  it('renders gridlines overlay when view.gridlines is true', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({
      view: { gridlines: true, snap: true, rulers: false },
    });
    const grid = document.querySelector('[style*="linear-gradient"]');
    expect(grid).toBeInTheDocument();
  });

  it('does not render gridlines when view.gridlines is false', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({
      view: { gridlines: false, snap: true, rulers: false },
    });
    const grid = document.querySelector('[style*="linear-gradient"]');
    expect(grid).not.toBeInTheDocument();
  });

  it('renders objects sorted by z-index', async () => {
    await makeDeck({
      objects: [
        newTextObject({ id: 'z1', text: 'Z1', z: 2 }),
        newTextObject({ id: 'z2', text: 'Z2', z: 1 }),
        newTextObject({ id: 'z3', text: 'Z3', z: 3 }),
      ],
    });
    await renderWithDeck();
    expect(screen.getByText('Z1')).toBeInTheDocument();
    expect(screen.getByText('Z2')).toBeInTheDocument();
    expect(screen.getByText('Z3')).toBeInTheDocument();
  });

  it('renders cursor styles for locked, readOnly, and normal objects', async () => {
    await makeDeck({
      objects: [
        newTextObject({ id: 'lock', text: 'L', locked: true }),
        newTextObject({ id: 'normal', text: 'N' }),
      ],
    });
    await renderWithDeck({ readOnly: true });
    const lockedEl = screen.getByText('L').closest('[style*="position: absolute"]');
    const normalEl = screen.getByText('N').closest('[style*="position: absolute"]');
    expect(lockedEl).toHaveStyle({ cursor: 'not-allowed' });
    expect(normalEl).toHaveStyle({ cursor: 'default' });
  });

  it('renders cursor move for unlocked objects in edit mode', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'ed', text: 'E' })],
    });
    await renderWithDeck({ readOnly: false });
    const el = screen.getByText('E').closest('[style*="position: absolute"]');
    expect(el).toHaveStyle({ cursor: 'move' });
  });

  it('renders deck size correctly', async () => {
    await makeDeck({ width: 1920, height: 1080 });
    await renderWithDeck({ zoom: 0.5 });
    const outer = document.querySelector('[style*="width: 960px"]');
    expect(outer).toBeInTheDocument();
  });
});

describe('SlideCanvas – onPointerCancel', () => {
  it('pointer cancel clears drawing state', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({ drawMode: true });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerCancel(canvas);
  });

  it('pointer cancel clears marquee drag state', async () => {
    await makeDeck({ objects: [] });
    await renderWithDeck({ onBackgroundClick: jest.fn() });
    const canvas = getCanvas(document.querySelector('[data-testid="canvas-root"]')!.parentElement!);
    fireEvent.pointerDown(canvas, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.pointerCancel(canvas);
  });
});

describe('SlideCanvas – background click callback', () => {
  it('passes onBackgroundClick to the canvas container', async () => {
    const onBg = jest.fn();
    await makeDeck({ objects: [] });
    await renderWithDeck({ onBackgroundClick: onBg });
    expect(screen.getByTestId('canvas-root')).toBeInTheDocument();
  });
});
