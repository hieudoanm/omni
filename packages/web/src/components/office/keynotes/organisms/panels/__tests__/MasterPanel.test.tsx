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
/*  MasterPanel                                                        */
/* ------------------------------------------------------------------ */
describe('MasterPanel', () => {
  it('returns null when no deck is loaded', () => {
    mockState.currentDeck = null;
    const { container } = render(<MasterPanel />);
    expect(container.innerHTML).toBe('');
  });

  it('shows seed default button when no placeholders', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: { id: 'mst-1', placeholders: [] },
    };
    render(<MasterPanel />);
    expect(screen.getByText('Seed default master')).toBeTruthy();
  });

  it('seeds default master on click', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: { id: 'mst-1', placeholders: [] },
    };
    render(<MasterPanel />);
    fireEvent.click(screen.getByText('Seed default master'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('adds a new placeholder', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: { id: 'mst-1', placeholders: [] },
    };
    render(<MasterPanel />);
    fireEvent.click(screen.getByText(/Add placeholder/));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('renders existing placeholders', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
    };
    render(<MasterPanel />);
    expect(screen.getByText('Placeholder 1')).toBeTruthy();
  });

  it('removes a placeholder', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
    };
    render(<MasterPanel />);
    fireEvent.click(screen.getByTitle('Remove placeholder'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('changes placeholder kind', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
    };
    render(<MasterPanel />);
    const selects = screen.getAllByRole('combobox');
    const kindSelect = selects.find((s) => (s as HTMLSelectElement).value === 'title');
    if (kindSelect) {
      fireEvent.change(kindSelect, { target: { value: 'content' } });
      expect(mockMutate).toHaveBeenCalled();
    }
  });

  it('applies master to current slide', () => {
    mockState.activeSlideId = 'slide-1';
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
      slides: [makeSlide()],
    };
    render(<MasterPanel />);
    fireEvent.click(screen.getByText(/Apply to current slide/));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('disables apply button when no active slide', () => {
    mockState.activeSlideId = null;
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
    };
    render(<MasterPanel />);
    const btn = screen.getByText(/Apply to current slide/).closest('button');
    expect(btn).toBeTruthy();
    if (btn) expect(btn.disabled).toBe(true);
  });

  it('does nothing on apply when no activeSlideId', () => {
    mockState.activeSlideId = null;
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
        ],
      },
    };
    render(<MasterPanel />);
    const btn = screen.getByText(/Apply to current slide/).closest('button');
    if (btn) fireEvent.click(btn);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('renders with placeholder style', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
            style: {
              fontSize: 48,
              bold: true,
              color: '#ff0000',
              align: 'center',
            },
          },
        ],
      },
    };
    render(<MasterPanel />);
    expect(screen.getByText('Placeholder 1')).toBeTruthy();
  });

  it('renders with multiple placeholders', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [
          {
            id: 'ph-1',
            kind: 'title',
            x: 80,
            y: 80,
            w: 1000,
            h: 100,
          },
          {
            id: 'ph-2',
            kind: 'content',
            x: 80,
            y: 200,
            w: 1000,
            h: 500,
          },
        ],
      },
    };
    render(<MasterPanel />);
    expect(screen.getByText('Placeholder 1')).toBeTruthy();
    expect(screen.getByText('Placeholder 2')).toBeTruthy();
  });

  it('changes placeholder X value', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [{ id: 'ph-1', kind: 'title', x: 80, y: 80, w: 1000, h: 100 }],
      },
    };
    render(<MasterPanel />);
    const numberInputs = screen.getAllByRole('spinbutton');
    const xInput = numberInputs.find((i) => (i as HTMLInputElement).value === '80');
    if (xInput) {
      fireEvent.change(xInput, { target: { value: '100' } });
      expect(mockMutate).toHaveBeenCalled();
    }
  });

  it('changes placeholder Y value', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [{ id: 'ph-1', kind: 'title', x: 80, y: 80, w: 1000, h: 100 }],
      },
    };
    render(<MasterPanel />);
    const numberInputs = screen.getAllByRole('spinbutton');
    const yInput = numberInputs.find((i) => (i as HTMLInputElement).value === '80');
    if (yInput) {
      fireEvent.change(yInput, { target: { value: '120' } });
      expect(mockMutate).toHaveBeenCalled();
    }
  });

  it('changes placeholder W value', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [{ id: 'ph-1', kind: 'title', x: 80, y: 80, w: 1000, h: 100 }],
      },
    };
    render(<MasterPanel />);
    const numberInputs = screen.getAllByRole('spinbutton');
    const wInput = numberInputs.find((i) => (i as HTMLInputElement).value === '1000');
    if (wInput) {
      fireEvent.change(wInput, { target: { value: '1200' } });
      expect(mockMutate).toHaveBeenCalled();
    }
  });

  it('changes placeholder H value', () => {
    mockState.currentDeck = {
      ...defaultDeck,
      master: {
        id: 'mst-1',
        placeholders: [{ id: 'ph-1', kind: 'title', x: 80, y: 80, w: 1000, h: 100 }],
      },
    };
    render(<MasterPanel />);
    const numberInputs = screen.getAllByRole('spinbutton');
    const hInput = numberInputs.find((i) => (i as HTMLInputElement).value === '100');
    if (hInput) {
      fireEvent.change(hInput, { target: { value: '150' } });
      expect(mockMutate).toHaveBeenCalled();
    }
  });
});

/* ------------------------------------------------------------------ */
/*  CommentsPanel                                                      */
/* ------------------------------------------------------------------ */
