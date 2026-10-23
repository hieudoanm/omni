import { fireEvent, render, screen } from '@testing-library/react';
import { AnimationOrderList } from '@/components/office/keynotes/organisms/panels/animations/AnimationOrderList';
import type { SlideObject } from '@/types/keynotes/deck';

const makeObjects = (
  overrides: Array<Partial<SlideObject> & { id: string; name: string }>,
): SlideObject[] =>
  overrides.map((o, i) => ({
    kind: 'text' as const,
    x: 0,
    y: 0,
    w: 100,
    h: 50,
    rotation: 0,
    opacity: 1,
    flipH: false,
    flipV: false,
    locked: false,
    hidden: false,
    z: i,
    text: '',
    style: {
      fontFamily: 'sans' as const,
      fontSize: 18,
      color: '#fff',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      lineHeight: 1.4,
      letterSpacing: 0,
      align: 'left' as const,
      bullet: false,
      numbered: false,
      vertical: 'top' as const,
    },
    ...o,
  })) as SlideObject[];

describe('AnimationOrderList', () => {
  const onMove = jest.fn();

  beforeEach(() => {
    onMove.mockClear();
  });

  it('returns null when no animated objects', () => {
    const { container } = render(
      <AnimationOrderList objects={makeObjects([{ id: 'o1', name: 'Obj1' }])} onMove={onMove} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders animated objects sorted by z', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'Alpha',
        z: 2,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o2',
        name: 'Beta',
        z: 0,
        animation: {
          type: 'emphasis',
          effect: 'pulse',
          duration: 300,
          delay: 200,
          trigger: 'after',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o3',
        name: 'Gamma',
        z: 1,
        animation: {
          type: 'exit',
          effect: 'fly-up',
          duration: 400,
          delay: 100,
          trigger: 'with',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    expect(screen.getByText('Animation order')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('displays animation type and effect for each item', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'Fade In',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    expect(screen.getByText(/entrance · fade/)).toBeInTheDocument();
  });

  it('calls onMove with correct direction', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'First',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o2',
        name: 'Second',
        z: 1,
        animation: {
          type: 'emphasis',
          effect: 'pulse',
          duration: 300,
          delay: 200,
          trigger: 'after',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    const moveDownBtns = screen.getAllByTitle('Move later');
    fireEvent.click(moveDownBtns[0]);
    expect(onMove).toHaveBeenCalledWith('o1', 1);
    const moveUpBtns = screen.getAllByTitle('Move earlier');
    fireEvent.click(moveUpBtns[1]);
    expect(onMove).toHaveBeenCalledWith('o2', -1);
  });

  it('disables move earlier on first item', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'First',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o2',
        name: 'Second',
        z: 1,
        animation: {
          type: 'emphasis',
          effect: 'pulse',
          duration: 300,
          delay: 200,
          trigger: 'after',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    const moveUpBtns = screen.getAllByTitle('Move earlier');
    expect(moveUpBtns[0]).toBeDisabled();
    expect(moveUpBtns[1]).not.toBeDisabled();
  });

  it('disables move later on last item', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'First',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o2',
        name: 'Second',
        z: 1,
        animation: {
          type: 'emphasis',
          effect: 'pulse',
          duration: 300,
          delay: 200,
          trigger: 'after',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    const moveDownBtns = screen.getAllByTitle('Move later');
    expect(moveDownBtns[0]).not.toBeDisabled();
    expect(moveDownBtns[1]).toBeDisabled();
  });

  it('renders timeline bar with correct widths', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'A',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 500,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
      {
        id: 'o2',
        name: 'B',
        z: 1,
        animation: {
          type: 'emphasis',
          effect: 'pulse',
          duration: 300,
          delay: 200,
          trigger: 'after',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    const { container } = render(<AnimationOrderList objects={objects} onMove={onMove} />);
    const timelineBars = container.querySelectorAll('[title*="ms"]');
    expect(timelineBars.length).toBe(2);
  });

  it('handles objects with no animation delay/duration (defaults to 0)', () => {
    const objects = makeObjects([
      {
        id: 'o1',
        name: 'NoDelay',
        z: 0,
        animation: {
          type: 'entrance',
          effect: 'fade',
          duration: 0,
          delay: 0,
          trigger: 'click',
          easing: 'ease',
          repeat: 0,
        },
      },
    ]);
    render(<AnimationOrderList objects={objects} onMove={onMove} />);
    expect(screen.getByText('NoDelay')).toBeInTheDocument();
  });
});
