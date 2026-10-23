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
/*  SectionGroup                                                       */
/* ------------------------------------------------------------------ */
describe('SectionGroup', () => {
  const slide1: Slide = {
    id: 's1',
    name: 'Slide 1',
    layout: 'blank',
    background: { type: 'solid', color: '#000', opacity: 1 },
    objects: [],
    notes: '',
    transition: { effect: 'fade', duration: 500, direction: 'forward' },
    hidden: false,
  };
  const slide2: Slide = { ...slide1, id: 's2', name: 'Slide 2' };

  const section: DeckSection = {
    id: 'sec-1',
    title: 'My Section',
    slideIds: ['s1', 's2'],
  };

  const deck = { ...defaultDeck, slides: [slide1, slide2] };

  const baseProps = {
    deck,
    section,
    thumbW: 160,
    activeSlideId: 's1' as string | null,
    onSelect: jest.fn(),
    onDuplicate: jest.fn(),
    onDelete: jest.fn(),
    onMove: jest.fn(),
    onToggleHidden: jest.fn(),
    onRename: jest.fn(),
    onRemoveSection: jest.fn(),
    onMoveSection: jest.fn(),
    onAddSlide: jest.fn(),
    onRemoveSlide: jest.fn(),
    onDragStart: jest.fn(() => jest.fn()),
    onDragOver: jest.fn(() => jest.fn()),
    onDrop: jest.fn(() => jest.fn()),
    onDragEnd: jest.fn(),
    dragging: false,
    overIndex: jest.fn(() => false),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders section title', () => {
    render(<SectionGroup {...baseProps} />);
    expect(screen.getByText('My Section')).toBeTruthy();
  });

  it('enters edit mode on title click', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByText('My Section'));
    expect(screen.getByDisplayValue('My Section')).toBeTruthy();
  });

  it('commits title on Enter', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByText('My Section'));
    const input = screen.getByDisplayValue('My Section');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(baseProps.onRename).toHaveBeenCalledWith('sec-1', 'New Title');
  });

  it('cancels edit on Escape', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByText('My Section'));
    const input = screen.getByDisplayValue('My Section');
    fireEvent.change(input, { target: { value: 'Cancelled' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(baseProps.onRename).not.toHaveBeenCalled();
    expect(screen.getByText('My Section')).toBeTruthy();
  });

  it('commits title on blur', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByText('My Section'));
    const input = screen.getByDisplayValue('My Section');
    fireEvent.change(input, { target: { value: 'Blur Title' } });
    fireEvent.blur(input);
    expect(baseProps.onRename).toHaveBeenCalledWith('sec-1', 'Blur Title');
  });

  it('reverts to original title when committing empty', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByText('My Section'));
    const input = screen.getByDisplayValue('My Section');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(baseProps.onRename).toHaveBeenCalledWith('sec-1', 'My Section');
  });

  it('shows add slide button when active slide not in section', () => {
    render(<SectionGroup {...baseProps} activeSlideId='s3' />);
    expect(screen.getByTitle('Add active slide to this section')).toBeTruthy();
  });

  it('does not show add slide button when active slide is in section', () => {
    render(<SectionGroup {...baseProps} activeSlideId='s1' />);
    expect(screen.queryByTitle('Add active slide to this section')).toBeNull();
  });

  it('calls onAddSlide when add button clicked', () => {
    render(<SectionGroup {...baseProps} activeSlideId='s3' />);
    fireEvent.click(screen.getByTitle('Add active slide to this section'));
    expect(baseProps.onAddSlide).toHaveBeenCalledWith('sec-1', 's3');
  });

  it('calls onMoveSection up', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByTitle('Move section up'));
    expect(baseProps.onMoveSection).toHaveBeenCalledWith('sec-1', -1);
  });

  it('calls onMoveSection down', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByTitle('Move section down'));
    expect(baseProps.onMoveSection).toHaveBeenCalledWith('sec-1', 1);
  });

  it('calls onRemoveSection', () => {
    render(<SectionGroup {...baseProps} />);
    fireEvent.click(screen.getByTitle('Delete section'));
    expect(baseProps.onRemoveSection).toHaveBeenCalledWith('sec-1');
  });

  it('renders SlideThumb for each slide', () => {
    render(<SectionGroup {...baseProps} />);
    expect(screen.getByTestId('thumb-s1')).toBeTruthy();
    expect(screen.getByTestId('thumb-s2')).toBeTruthy();
  });

  it('calls onRemoveSlide when remove button clicked', () => {
    render(<SectionGroup {...baseProps} />);
    const buttons = screen.getAllByRole('button');
    const removeBtn = buttons.find((b) => b.title === 'Remove from section');
    if (removeBtn) fireEvent.click(removeBtn);
    expect(baseProps.onRemoveSlide).toHaveBeenCalledWith('sec-1', 's1');
  });

  it('does not render slides not in deck', () => {
    const sectionWithMissing = {
      ...section,
      slideIds: ['s1', 'missing-slide'],
    };
    render(<SectionGroup {...baseProps} section={sectionWithMissing} />);
    expect(screen.getByTestId('thumb-s1')).toBeTruthy();
    expect(screen.queryByTestId('thumb-missing-slide')).toBeNull();
  });

  it('does not show add button when activeSlideId is null', () => {
    render(<SectionGroup {...baseProps} activeSlideId={null} />);
    expect(screen.queryByTitle('Add active slide to this section')).toBeNull();
  });
});
