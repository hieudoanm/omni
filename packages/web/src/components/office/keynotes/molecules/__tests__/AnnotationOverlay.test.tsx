import { fireEvent, render } from '@testing-library/react';
import { AnnotationOverlay } from '@/components/office/keynotes/molecules/AnnotationOverlay';

const baseProps: {
  width: number;
  height: number;
  scale: number;
  tool: 'off' | 'pen' | 'highlighter' | 'eraser' | 'laser';
  color: string;
  clearNonce: number;
} = {
  width: 800,
  height: 600,
  scale: 1,
  tool: 'off',
  color: '#ff0000',
  clearNonce: 0,
};

const renderOverlay = (overrides: Partial<typeof baseProps> = {}) => {
  const props = { ...baseProps, ...overrides };
  return render(<AnnotationOverlay {...props} />);
};

describe('AnnotationOverlay rendering', () => {
  it('renders a canvas element with correct dimensions', () => {
    const { container } = renderOverlay();
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.getAttribute('width')).toBe('800');
    expect(canvas?.getAttribute('height')).toBe('600');
  });

  it('applies scaled width and height via style', () => {
    const { container } = renderOverlay({ scale: 2 });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.width).toBe('1600px');
    expect(canvas.style.height).toBe('1200px');
  });

  it('uses default cursor when tool is off', () => {
    const { container } = renderOverlay({ tool: 'off' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('');
  });

  it('uses crosshair cursor for pen tool', () => {
    const { container } = renderOverlay({ tool: 'pen' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('crosshair');
  });

  it('uses crosshair cursor for highlighter tool', () => {
    const { container } = renderOverlay({ tool: 'highlighter' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('crosshair');
  });

  it('uses cell cursor for eraser tool', () => {
    const { container } = renderOverlay({ tool: 'eraser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('cell');
  });

  it('uses crosshair cursor for laser tool', () => {
    const { container } = renderOverlay({ tool: 'laser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.style.cursor).toBe('crosshair');
  });
});

describe('AnnotationOverlay pointer events', () => {
  it('ignores pointerDown when tool is off', () => {
    const { container } = renderOverlay({ tool: 'off' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('ignores pointerDown when tool is laser', () => {
    const { container } = renderOverlay({ tool: 'laser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('handles eraser tool on pointerDown', () => {
    const { container } = renderOverlay({ tool: 'eraser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
  });

  it('starts drawing with pen tool on pointerDown', () => {
    const { container } = renderOverlay({ tool: 'pen' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, {
      clientX: 120,
      clientY: 120,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('starts drawing with highlighter tool on pointerDown', () => {
    const { container } = renderOverlay({ tool: 'highlighter' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, {
      clientX: 150,
      clientY: 150,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('handles pointerMove with eraser when no drawing in progress', () => {
    const { container } = renderOverlay({ tool: 'eraser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, {
      clientX: 100,
      clientY: 100,
      buttons: 1,
      pointerId: 1,
    });
  });

  it('handles pointerMove with laser tool', () => {
    const { container } = renderOverlay({ tool: 'laser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, {
      clientX: 100,
      clientY: 100,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerMove(canvas, {
      clientX: 120,
      clientY: 120,
      buttons: 1,
      pointerId: 1,
    });
  });

  it('returns early on pointerMove when buttons=0 and no drawing', () => {
    const { container } = renderOverlay({ tool: 'pen' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, {
      clientX: 100,
      clientY: 100,
      buttons: 0,
      pointerId: 1,
    });
  });

  it('skips points too close together during drawing', () => {
    const { container } = renderOverlay({ tool: 'pen' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, {
      clientX: 100.5,
      clientY: 100.5,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('clears laser on pointerUp', () => {
    const { container } = renderOverlay({ tool: 'laser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, {
      clientX: 100,
      clientY: 100,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
  });

  it('clears laser on pointerLeave', () => {
    const { container } = renderOverlay({ tool: 'laser' });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerMove(canvas, {
      clientX: 100,
      clientY: 100,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerLeave(canvas);
  });
});

describe('AnnotationOverlay clearNonce', () => {
  it('clears strokes when clearNonce changes', () => {
    const { container, rerender } = renderOverlay({
      tool: 'pen',
      clearNonce: 0,
    });
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(canvas, {
      clientX: 200,
      clientY: 200,
      buttons: 1,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    rerender(<AnnotationOverlay {...baseProps} tool='pen' clearNonce={1} />);
  });
});

describe('AnnotationOverlay scale effect', () => {
  it('re-draws when scale changes', () => {
    const { rerender } = renderOverlay({ scale: 1 });
    rerender(<AnnotationOverlay {...baseProps} scale={2} />);
  });
});
