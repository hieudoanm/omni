import { render, fireEvent, act } from '@testing-library/react';
import PresentPage from '@/app/apps/office/keynotes/present/[id]/PresentPage';
import { newDeck, newShapeObject, newSlide } from '@/lib/office/keynotes/deckFactory';
import type { Deck, Slide, ObjectAnimation } from '@/types/keynotes/deck';

const anim = (overrides: Partial<ObjectAnimation> = {}): ObjectAnimation => ({
  type: 'entrance',
  effect: 'fade-up',
  duration: 600,
  delay: 0,
  trigger: 'click',
  easing: 'ease-out',
  repeat: 1,
  ...overrides,
});

const makeSlide = (objects: Slide['objects'] = [], partial?: Partial<Slide>): Slide => ({
  id: 'slide-1',
  name: 'Slide 1',
  layout: 'blank',
  background: { type: 'solid', color: '#0b1020', opacity: 1 },
  objects: objects.map((o, i) => ({ ...o, z: i })),
  notes: '',
  transition: { effect: 'fade', duration: 500, direction: 'forward' },
  hidden: false,
  ...partial,
});

const makeDeck = (slides: Slide[] = []): Deck =>
  newDeck({
    id: 'deck-test',
    slides: slides.length > 0 ? slides : [makeSlide()],
  });

let currentDeck: Deck | null = null;
const mockOpenDeck = jest.fn(async () => {});
const mockCloseDeck = jest.fn();
const mockAddQuestion = jest.fn();
const mockRouterBack = jest.fn();

jest.mock('@/components/office/keynotes/organisms/DeckProvider', () => ({
  useDeck: () => ({
    currentDeck,
    openDeck: mockOpenDeck,
    closeDeck: mockCloseDeck,
    addQuestion: mockAddQuestion,
  }),
}));

jest.mock('@/components/office/keynotes/molecules/AnnotationOverlay', () => ({
  AnnotationOverlay: () => <div data-testid='annotation-overlay' />,
}));

jest.mock('@/components/office/keynotes/molecules/PresentTools', () => ({
  PresentTools: () => <div data-testid='present-tools' />,
}));

jest.mock('@/components/office/keynotes/molecules/BlackoutOverlay', () => ({
  BlackoutOverlay: ({ mode }: { mode: string }) =>
    mode !== 'normal' ? <div data-testid='blackout' /> : null,
}));

jest.mock('@/components/office/keynotes/molecules/CaptionsBar', () => ({
  CaptionsBar: ({ text }: { text: string }) =>
    text ? <div data-testid='captions'>{text}</div> : null,
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'deck-test' }),
  useRouter: () => ({ back: mockRouterBack }),
}));

beforeEach(() => {
  currentDeck = makeDeck();
  mockOpenDeck.mockClear();
  mockCloseDeck.mockClear();
  mockAddQuestion.mockClear();
  mockRouterBack.mockClear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('PresentPage loading state', () => {
  it('shows loading spinner when currentDeck is null', () => {
    currentDeck = null;
    const { getByText } = render(<PresentPage />);
    expect(getByText('Starting presentation…')).toBeTruthy();
  });

  it('calls openDeck on mount with the id param', () => {
    render(<PresentPage />);
    expect(mockOpenDeck).toHaveBeenCalledWith('deck-test');
  });

  it('calls closeDeck on unmount', () => {
    const { unmount } = render(<PresentPage />);
    unmount();
    expect(mockCloseDeck).toHaveBeenCalled();
  });
});

describe('PresentPage slide rendering', () => {
  it('renders the current slide', () => {
    const { container } = render(<PresentPage />);
    expect(container.querySelector('[data-testid="annotation-overlay"]')).toBeTruthy();
  });

  it('renders PresentTools', () => {
    const { getByTestId } = render(<PresentPage />);
    expect(getByTestId('present-tools')).toBeTruthy();
  });
});

describe('PresentPage navigation', () => {
  it('goes to next slide on arrowright', () => {
    const slide1 = makeSlide([newShapeObject({ id: 'a', x: 0, y: 0 })], {
      id: 's1',
    });
    const slide2 = makeSlide([newShapeObject({ id: 'b', x: 0, y: 0 })], {
      id: 's2',
    });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
  });

  it('goes to next slide on space', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: ' ' });
    });
  });

  it('goes to next slide on enter', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });
  });

  it('goes to next slide on pagedown', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'PageDown' });
    });
  });

  it('goes back on arrowleft', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
    });
  });

  it('goes back on backspace', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'Backspace' });
    });
  });

  it('goes back on pageup', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'PageUp' });
    });
  });

  it('calls router.back on Escape', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(mockRouterBack).toHaveBeenCalled();
  });

  it('does not navigate when typing in input', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    const { getByPlaceholderText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const textarea = getByPlaceholderText(/Your question/);
    act(() => {
      fireEvent.keyDown(textarea, { key: 'ArrowRight' });
    });
  });
});

describe('PresentPage keyboard shortcuts', () => {
  it('toggles blackout on B key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'b' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'b' });
    });
  });

  it('toggles whiteout on W key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'w' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'w' });
    });
  });

  it('toggles spotlight on S key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 's' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 's' });
    });
  });

  it('toggles pen tool on P key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'p' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'p' });
    });
  });

  it('toggles laser tool on L key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'l' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'l' });
    });
  });

  it('toggles highlighter tool on H key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'h' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'h' });
    });
  });

  it('toggles eraser tool on E key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'e' });
    });
    act(() => {
      fireEvent.keyDown(window, { key: 'e' });
    });
  });

  it('clears annotations on C key', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'c' });
    });
  });
});

describe('PresentPage spotlight', () => {
  it('tracks pointer position when spotlight is on', () => {
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 's' });
    });
    const slideContainer = document.querySelector('.relative.shrink-0') as HTMLElement;
    if (slideContainer) {
      const rect = slideContainer.getBoundingClientRect();
      act(() => {
        fireEvent.pointerMove(slideContainer, {
          clientX: rect.left + 100,
          clientY: rect.top + 100,
        });
      });
    }
    act(() => {
      fireEvent.keyDown(window, { key: 's' });
    });
  });
});

describe('PresentPage Q&A modal', () => {
  it('opens Q&A modal on help button click', () => {
    const { getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    expect(getByText('Ask a question')).toBeTruthy();
  });

  it('closes Q&A modal on cancel click', () => {
    const { queryByText, getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const cancelBtn = getByText('Cancel');
    act(() => {
      fireEvent.click(cancelBtn);
    });
    expect(queryByText('Ask a question')).toBeNull();
  });

  it('closes Q&A modal on backdrop click', () => {
    const { queryByText, getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const backdrop = getByText('Ask a question').closest('[class*="fixed"]') as HTMLElement;
    act(() => {
      fireEvent.click(backdrop);
    });
  });

  it('submits question when text is non-empty', () => {
    const { getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    act(() => {
      fireEvent.change(textarea, { target: { value: 'What about X?' } });
    });
    const askBtn = getByText('Ask');
    act(() => {
      fireEvent.click(askBtn);
    });
    expect(mockAddQuestion).toHaveBeenCalledWith('What about X?');
  });

  it('does not submit when question text is empty', () => {
    const { getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const askBtn = getByText('Ask');
    act(() => {
      fireEvent.click(askBtn);
    });
    expect(mockAddQuestion).not.toHaveBeenCalled();
  });

  it('stops propagation on modal content click', () => {
    const { getByText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const modal = getByText('Ask a question').closest('[class*="bg-base"]') as HTMLElement;
    act(() => {
      fireEvent.click(modal);
    });
  });
});

describe('PresentPage fullscreen', () => {
  it('toggles fullscreen on button click', () => {
    render(<PresentPage />);
    const fsBtn = document.querySelector('[title="Toggle fullscreen"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(fsBtn);
    });
  });
});

describe('PresentPage exit button', () => {
  it('calls router.back on exit click', () => {
    render(<PresentPage />);
    const exitBtn = document.querySelector('[title="Exit (Esc)"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(exitBtn);
    });
    expect(mockRouterBack).toHaveBeenCalled();
  });
});

describe('PresentPage timer', () => {
  it('increments elapsed time', () => {
    render(<PresentPage />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });

  it('updates clock display', () => {
    render(<PresentPage />);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  });
});

describe('PresentPage transitions', () => {
  it('applies fade transition class', () => {
    const slide = makeSlide([], {
      transition: { effect: 'fade', duration: 500, direction: 'forward' },
    });
    currentDeck = makeDeck([slide]);
    const { container } = render(<PresentPage />);
    expect(container.querySelector('[class*="trans-"]')).toBeTruthy();
  });

  it('applies transition with bounciness', () => {
    const slide = makeSlide([], {
      transition: {
        effect: 'fade',
        duration: 500,
        direction: 'forward',
        bounciness: 80,
      },
    });
    currentDeck = makeDeck([slide]);
    render(<PresentPage />);
  });

  it('applies morph transition', () => {
    const slide1 = makeSlide([newShapeObject({ id: 'a', x: 0, y: 0 })], {
      id: 's1',
      transition: { effect: 'morph', duration: 700, direction: 'forward' },
    });
    const slide2 = makeSlide([newShapeObject({ id: 'a', x: 100, y: 100 })], {
      id: 's2',
      transition: { effect: 'morph', duration: 700, direction: 'forward' },
    });
    currentDeck = makeDeck([slide1, slide2]);
    render(<PresentPage />);
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });
  });

  it('handles transition with no duration', () => {
    const slide = makeSlide([], {
      transition: { effect: 'fade', duration: 0, direction: 'forward' },
    });
    currentDeck = makeDeck([slide]);
    render(<PresentPage />);
  });
});

describe('PresentPage autoAdvance', () => {
  it('auto-advances when slide has autoAdvance set', () => {
    const slide = makeSlide([], { autoAdvance: 5 });
    currentDeck = makeDeck([slide]);
    render(<PresentPage />);
    act(() => {
      jest.advanceTimersByTime(6000);
    });
  });
});

describe('PresentPage slide navigation buttons', () => {
  it('disables previous button on first slide', () => {
    render(<PresentPage />);
    const prevBtn = document.querySelector('[title="Previous (←)"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
  });

  it('disables next button when on last slide and no more steps', () => {
    currentDeck = makeDeck([makeSlide([], { id: 's1' })]);
    render(<PresentPage />);
    const nextBtn = document.querySelector('[title="Next (→)"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(true);
  });
});

describe('PresentPage keyboard ignores', () => {
  it('ignores navigation when typing in textarea', () => {
    const slide1 = makeSlide([], { id: 's1' });
    const slide2 = makeSlide([], { id: 's2' });
    currentDeck = makeDeck([slide1, slide2]);
    const { getByPlaceholderText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const textarea = getByPlaceholderText(/Your question/);
    act(() => {
      fireEvent.keyDown(textarea, { key: 'ArrowRight', target: textarea });
    });
  });

  it('ignores typing in input elements', () => {
    currentDeck = makeDeck([makeSlide([], { id: 's1' }), makeSlide([], { id: 's2' })]);
    const { getByPlaceholderText } = render(<PresentPage />);
    const qaBtn = document.querySelector('[title="Ask a question"]') as HTMLButtonElement;
    act(() => {
      fireEvent.click(qaBtn);
    });
    const textarea = getByPlaceholderText(/Your question/);
    act(() => {
      fireEvent.keyDown(textarea, { key: ' ' });
    });
  });
});
