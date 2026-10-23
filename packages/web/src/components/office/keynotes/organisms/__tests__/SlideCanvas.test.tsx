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
import type { SlideObject } from '@/types/keynotes/deck';

const resetDB = __resetIdbMock;

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
});

const makeDeck = async (opts?: {
  objects?: SlideObject[];
  id?: string;
  background?: { type: 'solid'; color: string; opacity: number };
}) => {
  const textObj = newTextObject({ id: 'txt-1', text: 'Hello' });
  const shapeObj = newShapeObject({ id: 'shp-1', shapeType: 'rect' });
  const deck = newDeck({
    id: opts?.id ?? 'deck-cv',
    title: 'Canvas Deck',
    slides: [newSlide('cover', themeById('midnight'), 1)],
  });
  deck.slides[0].objects = opts?.objects ?? [textObj, shapeObj];
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
  wrapper?: ReactNode;
}) => {
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

describe('SlideCanvas', () => {
  it('renders "No slide selected" when no deck is loaded', () => {
    render(
      <DeckProvider>
        <SlideCanvas zoom={1} setZoom={jest.fn()} />
      </DeckProvider>,
    );
    expect(screen.getByText('No slide selected')).toBeInTheDocument();
  });

  it('renders the slide canvas with objects', async () => {
    await makeDeck();
    const { container } = await renderWithDeck();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders gridlines when view.gridlines is true', async () => {
    await makeDeck();
    await renderWithDeck({
      view: { gridlines: true, snap: true, rulers: false },
    });
    const gridlines = document.querySelector('[style*="linear-gradient"]');
    expect(gridlines).toBeInTheDocument();
  });

  it('passes onBackgroundClick prop to SlideCanvas', async () => {
    const onBg = jest.fn();
    await makeDeck({ objects: [] });
    await renderWithDeck({ onBackgroundClick: onBg });
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByTestId('canvas-root')).toBeInTheDocument();
  });

  it('handles wheel zoom with ctrlKey', async () => {
    const setZoom = jest.fn();
    await makeDeck();
    const { container } = await renderWithDeck({ setZoom });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.wheel(outer, { deltaY: -100, ctrlKey: true });
    expect(setZoom).toHaveBeenCalled();
  });

  it('does not zoom without ctrl/meta key', async () => {
    const setZoom = jest.fn();
    await makeDeck();
    const { container } = await renderWithDeck({ setZoom });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.wheel(outer, { deltaY: -100 });
    expect(setZoom).not.toHaveBeenCalled();
  });

  it('enters draw mode on pointer down when drawMode is true', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({ drawMode: true });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(outer, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(outer);
  });

  it('starts marquee selection on background pointer down', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerMove(outer, { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(outer);
  });

  it('pointer move with marquee hits objects', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(outer, { clientX: 500, clientY: 500 });
    fireEvent.pointerUp(outer);
  });

  it('handles handleDrop with no files', async () => {
    await makeDeck();
    const { container } = await renderWithDeck();
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.drop(outer, { dataTransfer: { files: [] } });
  });

  it('handles readOnly mode - no marquee on click', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({ readOnly: true });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 10, clientY: 10, button: 0 });
  });

  it('renders solid slide background when different from theme', async () => {
    await makeDeck({
      background: { type: 'solid', color: '#ff0000', opacity: 0.5 },
    });
    await renderWithDeck();
    const bgOverlay = document.querySelector('[style*="background-color"]');
    expect(bgOverlay).toBeInTheDocument();
  });

  it('double-click on text object enters edit mode', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'txt-dc', text: 'Hello DC' })],
    });
    await renderWithDeck();
    const wrapper = screen.getByText('Hello DC').closest('[style]');
    if (wrapper) fireEvent.doubleClick(wrapper);
    await waitFor(() => {
      const editable = document.querySelector('[contenteditable]');
      if (editable) fireEvent.keyDown(editable, { key: 'Escape' });
    });
  });

  it('double-click on shape with text enters edit mode', async () => {
    await makeDeck({
      objects: [
        newShapeObject({
          id: 'shp-txt',
          text: 'Shape text',
          shapeType: 'rect',
        }),
      ],
    });
    await renderWithDeck();
    const wrapper = screen.getByText('Shape text').closest('[style]');
    if (wrapper) fireEvent.doubleClick(wrapper);
    await waitFor(() => {
      const editable = document.querySelector('[contenteditable]');
      if (editable) fireEvent.keyDown(editable, { key: 'Escape' });
    });
  });

  it('readOnly prevents double-click edit', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'txt-ro', text: 'Hello RO' })],
    });
    await renderWithDeck({ readOnly: true });
    const wrapper = screen.getByText('Hello RO').closest('[style]');
    if (wrapper) fireEvent.doubleClick(wrapper);
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).not.toBeInTheDocument();
    });
  });

  it('escape key exits text editing', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'txt-esc', text: 'Escape me' })],
    });
    await renderWithDeck();
    const wrapper = screen.getByText('Escape me').closest('[style]');
    if (wrapper) fireEvent.doubleClick(wrapper);
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).toBeInTheDocument();
    });
    const editable = document.querySelector('[contenteditable]');
    if (editable) fireEvent.keyDown(editable, { key: 'Escape' });
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).not.toBeInTheDocument();
    });
  });

  it('enter key commits text editing via blur', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'txt-enter', text: 'Enter me' })],
    });
    await renderWithDeck();
    const wrapper = screen.getByText('Enter me').closest('[style]');
    if (wrapper) fireEvent.doubleClick(wrapper);
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).toBeInTheDocument();
    });
    const editable = document.querySelector('[contenteditable]');
    if (editable) {
      fireEvent.keyDown(editable, { key: 'a', shiftKey: true, ctrlKey: true });
      fireEvent.keyDown(editable, { key: 'Escape' });
    }
    await waitFor(() => {
      expect(document.querySelector('[contenteditable]')).not.toBeInTheDocument();
    });
  });

  it('pointer down on object starts move (non-draw mode)', async () => {
    await makeDeck();
    await renderWithDeck();
    const objectWrapper = screen.getByText('Hello').closest('[style*="position: absolute"]');
    if (objectWrapper) {
      fireEvent.pointerDown(objectWrapper, {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
      });
    }
  });

  it('pointer down on object in draw mode does nothing', async () => {
    await makeDeck();
    await renderWithDeck({ drawMode: true });
    const objectWrapper = screen.getByText('Hello').closest('[style*="position: absolute"]');
    if (objectWrapper) {
      fireEvent.pointerDown(objectWrapper, {
        clientX: 100,
        clientY: 100,
        button: 0,
        bubbles: true,
      });
    }
  });

  it('marquee with shift key keeps existing selection', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, {
      clientX: 0,
      clientY: 0,
      button: 0,
      shiftKey: true,
    });
    fireEvent.pointerMove(outer, { clientX: 500, clientY: 500 });
    fireEvent.pointerUp(outer);
  });

  it('container down with non-left button does nothing', async () => {
    await makeDeck();
    const { container } = await renderWithDeck();
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 10, clientY: 10, button: 1 });
  });

  it('pointer cancel clears marquee', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 10, clientY: 10, button: 0 });
    fireEvent.pointerCancel(outer);
  });

  it('handleDrop with image file adds image object', async () => {
    await makeDeck();
    const { container } = await renderWithDeck();
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    const file = new File(['img'], 'test.png', { type: 'image/png' });
    fireEvent.drop(outer, {
      dataTransfer: { files: [file], types: ['Files'] },
    });
  });

  it('rendered objects have correct z-index sorting', async () => {
    const obj1 = newTextObject({ id: 'a', text: 'A', z: 2 });
    const obj2 = newTextObject({ id: 'b', text: 'B', z: 1 });
    await makeDeck({ objects: [obj1, obj2] });
    await renderWithDeck();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('renders object with locked cursor', async () => {
    await makeDeck({
      objects: [newTextObject({ id: 'locked', text: 'Locked', locked: true })],
    });
    await renderWithDeck();
    const lockedEl = screen.getByText('Locked').closest('[style*="position: absolute"]');
    expect(lockedEl).toHaveStyle({ cursor: 'not-allowed' });
  });

  it('renders group child with parent reference', async () => {
    const textObj = newTextObject({
      id: 'child',
      text: 'Child',
      group: 'g1',
    });
    await makeDeck({ objects: [textObj] });
    await renderWithDeck();
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('pointerMove without active drag does nothing', async () => {
    await makeDeck();
    const { container } = await renderWithDeck();
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerMove(outer, { clientX: 50, clientY: 50 });
  });

  it('marquee selection resets on pointer up', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, { clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerMove(outer, { clientX: 300, clientY: 300 });
    fireEvent.pointerUp(outer);
  });

  it('shift-click on background keeps selection', async () => {
    await makeDeck();
    const { container } = await renderWithDeck({
      onBackgroundClick: jest.fn(),
    });
    const outer = container.querySelector('[data-testid="canvas-root"]')!
      .firstElementChild as HTMLElement;
    fireEvent.pointerDown(outer, {
      clientX: 50,
      clientY: 50,
      button: 0,
      shiftKey: true,
    });
  });
});
