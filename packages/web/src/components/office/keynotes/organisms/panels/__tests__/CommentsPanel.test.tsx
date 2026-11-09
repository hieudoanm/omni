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
/*  CommentsPanel                                                      */
/* ------------------------------------------------------------------ */
describe('CommentsPanel', () => {
  it('shows no comments message when empty', () => {
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [];
    mockState.questions = [];
    render(<CommentsPanel />);
    expect(screen.getByText('No comments yet')).toBeTruthy();
  });

  it('adds comment on button click', () => {
    mockState.activeSlideId = 'slide-1';
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Add a comment…');
    fireEvent.change(input, { target: { value: 'Great slide!' } });
    const addBtns = screen.getAllByRole('button');
    const commentAddBtn = addBtns.find(
      (b) => b.className.includes('btn-primary') && b.parentElement === input.parentElement,
    );
    if (commentAddBtn) fireEvent.click(commentAddBtn);
    expect(mockAddComment).toHaveBeenCalledWith('slide-1', 'Great slide!');
  });

  it('adds comment on Enter key', () => {
    mockState.activeSlideId = 'slide-1';
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Add a comment…');
    fireEvent.change(input, { target: { value: 'Nice!' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockAddComment).toHaveBeenCalledWith('slide-1', 'Nice!');
  });

  it('does not add comment when text is empty', () => {
    mockState.activeSlideId = 'slide-1';
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Add a comment…');
    fireEvent.change(input, { target: { value: '   ' } });
    const addBtns = screen.getAllByRole('button');
    const commentAddBtn = addBtns.find(
      (b) => b.className.includes('btn-primary') && b.parentElement === input.parentElement,
    );
    if (commentAddBtn) fireEvent.click(commentAddBtn);
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('does not add comment when no activeSlideId', () => {
    mockState.activeSlideId = null;
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Add a comment…');
    fireEvent.change(input, { target: { value: 'Test' } });
    const addBtns = screen.getAllByRole('button');
    const commentAddBtn = addBtns.find(
      (b) => b.className.includes('btn-primary') && b.parentElement === input.parentElement,
    );
    if (commentAddBtn) fireEvent.click(commentAddBtn);
    expect(mockAddComment).not.toHaveBeenCalled();
  });

  it('displays comment with author and text', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Looks good!',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Looks good!')).toBeTruthy();
  });

  it('toggles comment resolved', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Fix this',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('Resolve'));
    expect(mockToggleCommentResolved).toHaveBeenCalledWith('c-1');
  });

  it('shows reopen for resolved comment', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Fixed!',
      createdAt: Date.now(),
      resolved: true,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    expect(screen.getByText('Reopen')).toBeTruthy();
  });

  it('toggles replies open and shows replies', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Comment',
      createdAt: Date.now(),
      resolved: false,
      replies: [
        {
          id: 'r-1',
          author: 'Bob',
          text: 'Reply here',
          createdAt: Date.now(),
        },
      ],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('1 replies'));
    expect(screen.getByText('Bob:')).toBeTruthy();
    expect(screen.getByText('Reply here')).toBeTruthy();
  });

  it('submits reply on Enter', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Comment',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('0 replies'));
    const replyInput = screen.getByPlaceholderText('Reply…');
    fireEvent.change(replyInput, { target: { value: 'My reply' } });
    fireEvent.keyDown(replyInput, { key: 'Enter' });
    expect(mockAddCommentReply).toHaveBeenCalledWith('c-1', 'My reply');
  });

  it('does not submit empty reply', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Comment',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('0 replies'));
    const replyInput = screen.getByPlaceholderText('Reply…');
    fireEvent.keyDown(replyInput, { key: 'Enter' });
    expect(mockAddCommentReply).not.toHaveBeenCalled();
  });

  it('shows all comments when no activeSlideId', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'other-slide',
      author: 'Alice',
      text: 'Global comment',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = null;
    mockState.comments = [comment];
    render(<CommentsPanel />);
    expect(screen.getByText('Global comment')).toBeTruthy();
  });

  it('adds question on button click', () => {
    mockState.questions = [];
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Ask a question…');
    fireEvent.change(input, { target: { value: 'What about X?' } });
    const buttons = screen.getAllByRole('button');
    const qPlus = buttons[buttons.length - 1];
    fireEvent.click(qPlus);
    expect(mockAddQuestion).toHaveBeenCalledWith('What about X?');
  });

  it('adds question on Enter', () => {
    mockState.questions = [];
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Ask a question…');
    fireEvent.change(input, { target: { value: 'Question?' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockAddQuestion).toHaveBeenCalledWith('Question?');
  });

  it('does not add empty question', () => {
    mockState.questions = [];
    render(<CommentsPanel />);
    const input = screen.getByPlaceholderText('Ask a question…');
    fireEvent.change(input, { target: { value: '   ' } });
    const buttons = screen.getAllByRole('button');
    const qPlus = buttons[buttons.length - 1];
    fireEvent.click(qPlus);
    expect(mockAddQuestion).not.toHaveBeenCalled();
  });

  it('upvotes a question', () => {
    const question: QaQuestion = {
      id: 'q-1',
      text: 'How?',
      author: 'Bob',
      upvotes: 2,
      answered: false,
      createdAt: Date.now(),
    };
    mockState.questions = [question];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('▲ 2'));
    expect(mockUpvoteQuestion).toHaveBeenCalledWith('q-1');
  });

  it('marks question answered', () => {
    const question: QaQuestion = {
      id: 'q-1',
      text: 'How?',
      author: 'Bob',
      upvotes: 0,
      answered: false,
      createdAt: Date.now(),
    };
    mockState.questions = [question];
    render(<CommentsPanel />);
    fireEvent.click(screen.getByText('Mark answered'));
    expect(mockMarkQuestionAnswered).toHaveBeenCalledWith('q-1');
  });

  it('unmarks answered question', () => {
    const question: QaQuestion = {
      id: 'q-1',
      text: 'How?',
      author: 'Bob',
      upvotes: 0,
      answered: true,
      createdAt: Date.now(),
    };
    mockState.questions = [question];
    render(<CommentsPanel />);
    expect(screen.getByText('Unmark')).toBeTruthy();
    fireEvent.click(screen.getByText('Unmark'));
    expect(mockMarkQuestionAnswered).toHaveBeenCalledWith('q-1');
  });

  it('deletes comment', () => {
    const comment: SlideComment = {
      id: 'c-1',
      slideId: 'slide-1',
      author: 'Alice',
      text: 'Delete me',
      createdAt: Date.now(),
      resolved: false,
      replies: [],
    };
    mockState.activeSlideId = 'slide-1';
    mockState.comments = [comment];
    render(<CommentsPanel />);
    const trashButtons = screen.getAllByRole('button');
    const trashBtn = trashButtons.find(
      (b) => b.querySelector('svg') !== null && b.className.includes('text-error'),
    );
    if (trashBtn) fireEvent.click(trashBtn);
    expect(mockDeleteComment).toHaveBeenCalledWith('c-1');
  });
});

/* ------------------------------------------------------------------ */
/*  SectionGroup                                                       */
/* ------------------------------------------------------------------ */
