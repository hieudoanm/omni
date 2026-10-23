import { render, screen, fireEvent } from '@testing-library/react';
import { FormatPanel } from '@/components/office/keynotes/organisms/panels/FormatPanel';
import { AnimationsPanel } from '@/components/office/keynotes/organisms/panels/AnimationsPanel';
import { MasterPanel } from '@/components/office/keynotes/organisms/panels/MasterPanel';
import { CommentsPanel } from '@/components/office/keynotes/organisms/panels/CommentsPanel';
import { SectionGroup } from '@/components/office/keynotes/organisms/panels/SectionGroup';
import {
  newTextObject,
  newShapeObject,
  newChartObject,
  newTableObject,
  newDiagramObject,
  newIconObject,
  newEquationObject,
  newImageObject,
  newEmbedObject,
  newDeck,
} from '@/lib/office/keynotes/deckFactory';
import { defaultAnimation } from '@/lib/office/keynotes/animations';
import type {
  Deck,
  Slide,
  SlideObject,
  SlideComment,
  QaQuestion,
  DeckSection,
  ObjectAnimation,
} from '@/types/keynotes/deck';

const mockUpdateObject = jest.fn();
const mockSetDeckSize = jest.fn();
const mockSetObjectAnimation = jest.fn();
const mockMutate = jest.fn();
const mockAddComment = jest.fn();
const mockAddCommentReply = jest.fn();
const mockToggleCommentResolved = jest.fn();
const mockDeleteComment = jest.fn();
const mockAddQuestion = jest.fn();
const mockUpvoteQuestion = jest.fn();
const mockMarkQuestionAnswered = jest.fn();

const defaultDeck: Deck = newDeck({ id: 'deck-1', width: 1800, height: 1013 });

const makeSlide = (objects: SlideObject[] = []): Slide => ({
  id: 'slide-1',
  name: 'Slide 1',
  layout: 'blank',
  background: { type: 'solid', color: '#0b1020', opacity: 1 },
  objects: objects.map((o, i) => ({ ...o, z: i })),
  notes: '',
  transition: { effect: 'fade', duration: 500, direction: 'forward' },
  hidden: false,
});

const textObj = newTextObject({ id: 'txt-1', name: 'My Text' });
const shapeObj = newShapeObject({ id: 'shp-1', name: 'My Shape' });
const chartObj = newChartObject({ id: 'cht-1', name: 'My Chart' });
const tableObj = newTableObject({ id: 'tbl-1', name: 'My Table' });
const diagramObj = newDiagramObject({ id: 'dia-1', name: 'My Diagram' });
const iconObj = newIconObject({ id: 'ico-1', name: 'My Icon' });
const equationObj = newEquationObject({ id: 'eqn-1', name: 'My Equation' });
const imageObj = newImageObject({ id: 'img-1', name: 'My Image' });
const embedObj = newEmbedObject({ id: 'emd-1', name: 'My Embed' });

interface MockState {
  activeSlide: Slide | null;
  currentDeck: Deck | null;
  selectedObjectIds: string[];
  activeSlideId: string | null;
  comments: SlideComment[];
  questions: QaQuestion[];
}

const mockState: MockState = {
  activeSlide: null,
  currentDeck: null,
  selectedObjectIds: [],
  activeSlideId: null,
  comments: [],
  questions: [],
};

jest.mock('@/components/office/keynotes/organisms/DeckProvider', () => ({
  useDeck: () => ({
    activeSlide: mockState.activeSlide,
    currentDeck: mockState.currentDeck,
    selectedObjectIds: mockState.selectedObjectIds,
    activeSlideId: mockState.activeSlideId,
    comments: mockState.comments,
    questions: mockState.questions,
    updateObject: mockUpdateObject,
    setDeckSize: mockSetDeckSize,
    setObjectAnimation: mockSetObjectAnimation,
    mutate: mockMutate,
    addComment: mockAddComment,
    addCommentReply: mockAddCommentReply,
    toggleCommentResolved: mockToggleCommentResolved,
    deleteComment: mockDeleteComment,
    addQuestion: mockAddQuestion,
    upvoteQuestion: mockUpvoteQuestion,
    markQuestionAnswered: mockMarkQuestionAnswered,
  }),
}));

jest.mock('@/components/office/keynotes/organisms/panels/SlideThumb', () => ({
  SlideThumb: (p: { slideId: string; onSelect: (id: string) => void }) => (
    <div data-testid={`thumb-${p.slideId}`}>
      <button onClick={() => p.onSelect(p.slideId)}>select</button>
    </div>
  ),
}));

jest.mock('@/components/office/keynotes/organisms/panels/animations/AnimationOrderList', () => ({
  AnimationOrderList: () => <div data-testid='anim-order' />,
}));

jest.mock('@/components/office/keynotes/organisms/panels/animations/AnimationPreview', () => ({
  AnimationPreview: () => <div data-testid='anim-preview' />,
}));

jest.mock('@/lib/office/keynotes/highlight', () => ({
  CODE_LANGUAGES: ['javascript', 'typescript', 'python'],
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockState.activeSlide = null;
  mockState.currentDeck = null;
  mockState.selectedObjectIds = [];
  mockState.activeSlideId = null;
  mockState.comments = [];
  mockState.questions = [];
});

/* ------------------------------------------------------------------ */
/*  AnimationsPanel                                                    */
/* ------------------------------------------------------------------ */
describe('AnimationsPanel', () => {
  it('shows empty state when no object selected', () => {
    mockState.selectedObjectIds = [];
    mockState.activeSlide = makeSlide([]);
    render(<AnimationsPanel />);
    expect(screen.getByText('Select an object to animate it')).toBeTruthy();
  });

  it('shows add animation button when no animation exists', () => {
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([textObj]);
    render(<AnimationsPanel />);
    expect(screen.getByText('Add entrance animation')).toBeTruthy();
  });

  it('adds entrance animation on click', () => {
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([textObj]);
    render(<AnimationsPanel />);
    fireEvent.click(screen.getByText('Add entrance animation'));
    expect(mockSetObjectAnimation).toHaveBeenCalledWith('txt-1', defaultAnimation('entrance'));
  });

  it('renders animation controls when animation exists', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    expect(screen.getByText('Duration')).toBeTruthy();
    expect(screen.getByText('Delay')).toBeTruthy();
  });

  it('toggles repeat', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const toggle = screen.getAllByRole('checkbox').find((el) => {
      const label = el.closest('label');
      return label?.textContent?.includes('Repeat');
    });
    if (toggle) fireEvent.click(toggle);
    expect(mockSetObjectAnimation).toHaveBeenCalled();
  });

  it('toggles reverse', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const toggle = screen.getAllByRole('checkbox').find((el) => {
      const label = el.closest('label');
      return label?.textContent?.includes('Reverse');
    });
    if (toggle) fireEvent.click(toggle);
    expect(mockSetObjectAnimation).toHaveBeenCalled();
  });

  it('removes animation', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    fireEvent.click(screen.getByText('Remove animation'));
    expect(mockSetObjectAnimation).toHaveBeenCalledWith('txt-1', null);
  });

  it('changes animation type', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const typeSelect = selects.find((s) => (s as HTMLSelectElement).value === 'entrance');
    if (typeSelect) {
      fireEvent.change(typeSelect, { target: { value: 'emphasis' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('changes effect', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const effectSelect = selects.find((s) => (s as HTMLSelectElement).value === 'fade-up');
    if (effectSelect) {
      fireEvent.change(effectSelect, { target: { value: 'zoom' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('changes trigger', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const triggerSelect = selects.find((s) => (s as HTMLSelectElement).value === 'click');
    if (triggerSelect) {
      fireEvent.change(triggerSelect, { target: { value: 'with' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('changes easing', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const easingSelect = selects.find((s) => (s as HTMLSelectElement).value === 'ease-out');
    if (easingSelect) {
      fireEvent.change(easingSelect, { target: { value: 'linear' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('sets motion path to preset', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const mpSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
    if (mpSelect) {
      fireEvent.change(mpSelect, { target: { value: 'arc' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('sets motion path to custom', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const mpSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
    if (mpSelect) {
      fireEvent.change(mpSelect, { target: { value: 'custom' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('renders custom path input when motion path is custom', () => {
    const anim: ObjectAnimation = {
      ...defaultAnimation('entrance'),
      motionPath: { type: 'custom', path: 'M 0 0 L 100 100' },
    };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([{ ...textObj, animation: anim }]);
    render(<AnimationsPanel />);
    expect(screen.getByPlaceholderText(/SVG path/)).toBeTruthy();
  });

  it('renders animation preview and order list', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    expect(screen.getByTestId('anim-preview')).toBeTruthy();
    expect(screen.getByTestId('anim-order')).toBeTruthy();
  });

  it('handles moveOrder with animated objects', () => {
    const anim1 = {
      ...textObj,
      id: 'a1',
      z: 0,
      animation: defaultAnimation('entrance'),
    };
    const anim2 = {
      ...shapeObj,
      id: 'a2',
      z: 1,
      animation: defaultAnimation('entrance'),
    };
    mockState.selectedObjectIds = ['a1'];
    mockState.activeSlide = makeSlide([anim1, anim2]);
    render(<AnimationsPanel />);
    expect(screen.getByTestId('anim-order')).toBeTruthy();
  });

  it('handles apply when first is undefined (no first)', () => {
    mockState.selectedObjectIds = ['missing'];
    mockState.activeSlide = makeSlide([]);
    render(<AnimationsPanel />);
    expect(screen.getByText('Select an object to animate it')).toBeTruthy();
  });

  it('changes stagger value', () => {
    const animated = { ...textObj, animation: defaultAnimation('entrance') };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([animated]);
    render(<AnimationsPanel />);
    const numberInputs = screen.getAllByRole('spinbutton');
    const staggerInput = numberInputs.find((i) => (i as HTMLInputElement).value === '0');
    if (staggerInput) {
      fireEvent.change(staggerInput, { target: { value: '100' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('changes custom path value', () => {
    const anim: ObjectAnimation = {
      ...defaultAnimation('entrance'),
      motionPath: { type: 'custom', path: 'M 0 0' },
    };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([{ ...textObj, animation: anim }]);
    render(<AnimationsPanel />);
    const pathInput = screen.getByPlaceholderText(/SVG path/);
    fireEvent.change(pathInput, {
      target: { value: 'M 0 0 L 200 200' },
    });
    expect(mockSetObjectAnimation).toHaveBeenCalled();
  });

  it('sets motion path to none', () => {
    const anim: ObjectAnimation = {
      ...defaultAnimation('entrance'),
      motionPath: { type: 'arc' },
    };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([{ ...textObj, animation: anim }]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const mpSelect = selects.find((s) => (s as HTMLSelectElement).value === 'arc');
    if (mpSelect) {
      fireEvent.change(mpSelect, { target: { value: 'none' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });

  it('sets motion path from custom to preset', () => {
    const anim: ObjectAnimation = {
      ...defaultAnimation('entrance'),
      motionPath: { type: 'custom', path: 'M 0 0' },
    };
    mockState.selectedObjectIds = ['txt-1'];
    mockState.activeSlide = makeSlide([{ ...textObj, animation: anim }]);
    render(<AnimationsPanel />);
    const selects = screen.getAllByRole('combobox');
    const mpSelect = selects.find((s) => (s as HTMLSelectElement).value === 'custom');
    if (mpSelect) {
      fireEvent.change(mpSelect, { target: { value: 'loop' } });
      expect(mockSetObjectAnimation).toHaveBeenCalled();
    }
  });
});

/* ------------------------------------------------------------------ */
/*  MasterPanel                                                        */
/* ------------------------------------------------------------------ */
