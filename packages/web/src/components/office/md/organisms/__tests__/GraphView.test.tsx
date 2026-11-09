import { fireEvent, render, screen } from '@testing-library/react';
import { GraphView } from '@/components/office/md/organisms/GraphView';
import { seedNotes } from '@/data/office/md/seed';

const chainable = (): Record<string, jest.Mock> => {
  const self: Record<string, jest.Mock> = {};
  self.id = jest.fn(() => self);
  self.distance = jest.fn(() => self);
  self.strength = jest.fn(() => self);
  return self;
};

jest.mock('d3-force', () => ({
  forceSimulation: jest.fn(() => {
    const sim: Record<string, jest.Mock> = {
      tick: jest.fn(),
      stop: jest.fn(),
      force: jest.fn(),
    };
    sim.force.mockReturnValue(sim);
    sim.stop.mockReturnValue(sim);
    return sim;
  }),
  forceLink: jest.fn(() => chainable()),
  forceManyBody: jest.fn(() => chainable()),
  forceCenter: jest.fn(() => ({})),
  forceCollide: jest.fn(() => ({})),
}));

const resizeObserver = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

class MockResizeObserver {
  observe(...args: unknown[]): void {
    resizeObserver.observe(...args);
  }
  disconnect(...args: unknown[]): void {
    resizeObserver.disconnect(...args);
  }
}

const createCtx = (): Record<string, unknown> => ({
  setTransform: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  strokeStyle: '',
  lineWidth: 1,
  fillStyle: '',
});

const rect = {
  width: 100,
  height: 80,
  left: 0,
  top: 0,
  right: 100,
  bottom: 80,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

describe('GraphView', () => {
  const notes = seedNotes();

  afterEach(() => {
    jest.restoreAllMocks();
    resizeObserver.observe.mockClear();
    resizeObserver.disconnect.mockClear();
    delete (global as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it('renders with the graph summary and canvas 2d drawing', () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(createCtx() as unknown as CanvasRenderingContext2D);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const onSelectNote = jest.fn();
    const onClose = jest.fn();
    render(<GraphView notes={notes} onSelectNote={onSelectNote} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: 'Graph' })).toBeInTheDocument();
    expect(screen.getByText(/notes · \d+ links/)).toBeInTheDocument();
    expect(screen.getByLabelText('Notes graph')).toBeInTheDocument();
    expect(resizeObserver.observe).toHaveBeenCalled();
  });

  it('shows the hovered note and clears it on mouse leave', () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(createCtx() as unknown as CanvasRenderingContext2D);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    render(<GraphView notes={notes} onSelectNote={jest.fn()} onClose={jest.fn()} />);

    const canvas = screen.getByLabelText('Notes graph');
    fireEvent.mouseMove(canvas, { clientX: 50, clientY: 40 });
    expect(screen.getByText('click to open')).toBeInTheDocument();

    fireEvent.mouseLeave(canvas);
    expect(screen.queryByText('click to open')).not.toBeInTheDocument();
  });

  it('selects a note when a node is clicked and ignores empty space', () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(createCtx() as unknown as CanvasRenderingContext2D);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const onSelectNote = jest.fn();
    render(<GraphView notes={notes} onSelectNote={onSelectNote} onClose={jest.fn()} />);

    const canvas = screen.getByLabelText('Notes graph');
    fireEvent.click(canvas, { clientX: 50, clientY: 40 });
    expect(onSelectNote).toHaveBeenCalledTimes(1);
    expect(onSelectNote).toHaveBeenCalledWith(expect.any(String));

    fireEvent.click(canvas, { clientX: 500, clientY: 500 });
    expect(onSelectNote).toHaveBeenCalledTimes(1);
  });

  it('closes the graph via the close button', () => {
    (global as { ResizeObserver?: unknown }).ResizeObserver = MockResizeObserver;
    jest.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    jest
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(createCtx() as unknown as CanvasRenderingContext2D);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const onClose = jest.fn();
    render(<GraphView notes={notes} onSelectNote={jest.fn()} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText('Close graph'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mounts safely when there is no canvas 2d context', () => {
    render(<GraphView notes={notes} onSelectNote={jest.fn()} onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Graph' })).toBeInTheDocument();
  });
});
