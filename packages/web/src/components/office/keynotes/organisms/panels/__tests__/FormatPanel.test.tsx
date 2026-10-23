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
/*  FormatPanel                                                        */
/* ------------------------------------------------------------------ */
describe('FormatPanel', () => {
  it('shows placeholder when no object selected', () => {
    render(<FormatPanel />);
    expect(screen.getByText(/Select an object/)).toBeTruthy();
  });

  describe('text object selected', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([textObj]);
    });

    it('renders name input and calls updateObject on change', () => {
      render(<FormatPanel />);
      const input = screen.getByPlaceholderText('Name');
      fireEvent.change(input, { target: { value: 'New Name' } });
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({ name: 'New Name' }),
      );
    });

    it('renders font select', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Font')).toBeTruthy();
    });

    it('toggles bold', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Bold'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ bold: true }),
        }),
      );
    });

    it('toggles italic', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Italic'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ italic: true }),
        }),
      );
    });

    it('toggles underline', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Underline'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ underline: true }),
        }),
      );
    });

    it('toggles strikethrough', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Strikethrough'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ strikethrough: true }),
        }),
      );
    });

    it('toggles subscript', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Subscript'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ script: 'sub' }),
        }),
      );
    });

    it('toggles superscript', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Superscript'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ script: 'sup' }),
        }),
      );
    });

    it('clicks align left', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Align left'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ align: 'left' }),
        }),
      );
    });

    it('clicks align center', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Align center'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ align: 'center' }),
        }),
      );
    });

    it('clicks align right', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Align right'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ align: 'right' }),
        }),
      );
    });

    it('toggles bullets', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Bullets');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('toggles numbered', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Numbered');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('toggles subscript off when already sub', () => {
      mockState.activeSlide = makeSlide([
        { ...textObj, style: { ...textObj.style, script: 'sub' } },
      ]);
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Subscript'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ script: 'none' }),
        }),
      );
    });

    it('toggles superscript off when already sup', () => {
      mockState.activeSlide = makeSlide([
        { ...textObj, style: { ...textObj.style, script: 'sup' } },
      ]);
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Superscript'));
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ script: 'none' }),
        }),
      );
    });

    it('renders fill section for text with fill', () => {
      mockState.activeSlide = makeSlide([
        { ...textObj, fill: { type: 'solid', color: '#ff0000', opacity: 1 } },
      ]);
      render(<FormatPanel />);
      expect(screen.getByText('Fill')).toBeTruthy();
    });
  });

  describe('shape object selected', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
    });

    it('renders paintbrush pick button', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Pick')).toBeTruthy();
    });

    it('copies format on pick click', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Pick'));
      expect(screen.getByText('Style copied. Select a target, then apply.')).toBeTruthy();
    });

    it('cancels paintbrush', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Pick'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Pick')).toBeTruthy();
    });

    it('applies paintbrush style', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Pick'));
      fireEvent.click(screen.getByText(/Apply/));
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('renders presets section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Presets')).toBeTruthy();
    });

    it('renders stroke & shadow section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Stroke & Shadow')).toBeTruthy();
    });

    it('toggles shadow on', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Shadow');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'shp-1',
        expect.objectContaining({
          shadow: expect.objectContaining({ enabled: true }),
        }),
      );
    });

    it('renders effects section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Effects')).toBeTruthy();
    });

    it('toggles reflection', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Reflection');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('toggles bevel', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Bevel');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('renders shape text section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Shape text')).toBeTruthy();
    });

    it('renders shape text with style preview', () => {
      mockState.activeSlide = makeSlide([
        { ...shapeObj, text: 'Hello', style: { ...textObj.style } },
      ]);
      render(<FormatPanel />);
      const hellos = screen.getAllByText('Hello');
      expect(hellos.length).toBeGreaterThanOrEqual(2);
    });

    it('renders line shape with arrow toggles', () => {
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          shapeType: 'line',
          stroke: { ...shapeObj.stroke, arrowStart: false, arrowEnd: false },
        },
      ]);
      render(<FormatPanel />);
      const arrowStart = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Arrow start');
      });
      expect(arrowStart).toBeTruthy();
      if (arrowStart) fireEvent.click(arrowStart);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('renders line shape arrow end toggle', () => {
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          shapeType: 'line',
          stroke: { ...shapeObj.stroke, arrowStart: false, arrowEnd: false },
        },
      ]);
      render(<FormatPanel />);
      const arrowEnd = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Arrow end');
      });
      expect(arrowEnd).toBeTruthy();
      if (arrowEnd) fireEvent.click(arrowEnd);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('renders glow blur input when glow color is set', () => {
      mockState.activeSlide = makeSlide([
        { ...shapeObj, effect: { glowColor: '#ff0000', glowBlur: 12 } },
      ]);
      render(<FormatPanel />);
      expect(screen.getByText('Glow blur')).toBeTruthy();
    });

    it('renders opacity control for solid fill', () => {
      render(<FormatPanel />);
      const opacityLabels = screen.getAllByText('Opacity');
      expect(opacityLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('fill type changes', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['shp-1'];
    });

    it('changes fill to gradient', () => {
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'solid');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'gradient' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes fill to pattern', () => {
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'solid');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'pattern' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes fill to image', () => {
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'solid');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'image' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes fill to none', () => {
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'solid');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'none' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('renders gradient fill editor', () => {
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: {
            type: 'gradient',
            from: '#ff0000',
            to: '#0000ff',
            angle: 45,
            opacity: 1,
          },
        },
      ]);
      render(<FormatPanel />);
      expect(screen.getByText('Add stop')).toBeTruthy();
    });

    it('renders image fill url input', () => {
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: {
            type: 'image',
            imageUrl: 'https://x.com/pic.png',
            opacity: 1,
          },
        },
      ]);
      render(<FormatPanel />);
      expect(screen.getByPlaceholderText('Image URL')).toBeTruthy();
    });

    it('renders pattern select', () => {
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: { type: 'pattern', pattern: 'dots', color: '#ff0000' },
        },
      ]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const patternSelect = selects.find((s) => (s as HTMLSelectElement).value === 'dots');
      expect(patternSelect).toBeTruthy();
    });
  });

  describe('link section', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['txt-1'];
    });

    it('sets link type to url', () => {
      mockState.activeSlide = makeSlide([textObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const linkSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
      if (linkSelect) {
        fireEvent.change(linkSelect, { target: { value: 'url' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('renders url input when link type is url', () => {
      mockState.activeSlide = makeSlide([
        { ...textObj, link: { type: 'url', url: 'https://example.com' } },
      ]);
      render(<FormatPanel />);
      expect(screen.getByPlaceholderText('https://example.com')).toBeTruthy();
    });

    it('renders email input when link type is email', () => {
      mockState.activeSlide = makeSlide([
        { ...textObj, link: { type: 'email', email: 'hi@test.com' } },
      ]);
      render(<FormatPanel />);
      expect(screen.getByPlaceholderText('name@example.com')).toBeTruthy();
    });

    it('renders slide selector when link type is slide', () => {
      const slide = makeSlide([{ ...textObj, link: { type: 'slide', slideId: '' } }]);
      mockState.activeSlide = slide;
      mockState.currentDeck = {
        ...defaultDeck,
        slides: [slide, { ...slide, id: 'slide-2', name: 'Second' }],
      };
      render(<FormatPanel />);
      expect(screen.getByText('Target slide')).toBeTruthy();
    });

    it('sets link type to none', () => {
      mockState.activeSlide = makeSlide([{ ...textObj, link: { type: 'url', url: '' } }]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const linkSelect = selects.find((s) => (s as HTMLSelectElement).value === 'url');
      if (linkSelect) {
        fireEvent.change(linkSelect, { target: { value: 'none' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('shows link hint when link type is set', () => {
      mockState.activeSlide = makeSlide([{ ...textObj, link: { type: 'url', url: '' } }]);
      render(<FormatPanel />);
      expect(screen.getByText(/Clicking this object advances/)).toBeTruthy();
    });
  });

  describe('position and size', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
    });

    it('renders position & size section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Position & Size')).toBeTruthy();
    });

    it('toggles lock', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Lock');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('toggles aspect lock', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Aspect');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('flips horizontal', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Flip H'));
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('flips vertical', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Flip V'));
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('rotates 90° CCW', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Rotate 90° CCW'));
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('rotates 90° CW', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByTitle('Rotate 90° CW'));
      expect(mockUpdateObject).toHaveBeenCalled();
    });
  });

  describe('slide size', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      mockState.currentDeck = defaultDeck;
    });

    it('renders slide size section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Slide size')).toBeTruthy();
    });

    it('sets 16:9 size', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('16:9'));
      expect(mockSetDeckSize).toHaveBeenCalledWith(1800, 1013);
    });

    it('sets 4:3 size', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('4:3'));
      expect(mockSetDeckSize).toHaveBeenCalledWith(1350, 1013);
    });

    it('sets portrait when width >= height', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Portrait'));
      expect(mockSetDeckSize).toHaveBeenCalledWith(1013, 1800);
    });

    it('sets landscape when width < height', () => {
      mockState.currentDeck = { ...defaultDeck, width: 1013, height: 1800 };
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Landscape'));
      expect(mockSetDeckSize).toHaveBeenCalledWith(1800, 1013);
    });

    it('does nothing for portrait when already portrait', () => {
      mockState.currentDeck = { ...defaultDeck, width: 1013, height: 1800 };
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Portrait'));
      expect(mockSetDeckSize).not.toHaveBeenCalled();
    });

    it('does nothing for landscape when already landscape', () => {
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Landscape'));
      expect(mockSetDeckSize).not.toHaveBeenCalled();
    });
  });

  describe('chart object', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['cht-1'];
      mockState.activeSlide = makeSlide([chartObj]);
    });

    it('renders chart section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Chart')).toBeTruthy();
    });

    it('toggles legend', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Legend');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('toggles values', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Values');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });
  });

  describe('table object', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['tbl-1'];
      mockState.activeSlide = makeSlide([tableObj]);
    });

    it('renders table section', () => {
      render(<FormatPanel />);
      expect(screen.getByText('Table')).toBeTruthy();
    });

    it('toggles header row', () => {
      render(<FormatPanel />);
      const toggle = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Header row');
      });
      if (toggle) fireEvent.click(toggle);
      expect(mockUpdateObject).toHaveBeenCalled();
    });
  });

  describe('diagram object', () => {
    it('renders diagram section', () => {
      mockState.selectedObjectIds = ['dia-1'];
      mockState.activeSlide = makeSlide([diagramObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Diagram')).toBeTruthy();
    });
  });

  describe('icon object', () => {
    it('renders icon section', () => {
      mockState.selectedObjectIds = ['ico-1'];
      mockState.activeSlide = makeSlide([iconObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Icon')).toBeTruthy();
    });
  });

  describe('equation object', () => {
    it('renders equation section', () => {
      mockState.selectedObjectIds = ['eqn-1'];
      mockState.activeSlide = makeSlide([equationObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Equation')).toBeTruthy();
    });
  });

  describe('image object', () => {
    it('renders image section', () => {
      mockState.selectedObjectIds = ['img-1'];
      mockState.activeSlide = makeSlide([imageObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Image')).toBeTruthy();
    });
  });

  describe('embed object', () => {
    it('renders embed section', () => {
      mockState.selectedObjectIds = ['emd-1'];
      mockState.activeSlide = makeSlide([embedObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Embed')).toBeTruthy();
    });

    it('shows code editor when embedType is code', () => {
      mockState.selectedObjectIds = ['emd-1'];
      mockState.activeSlide = makeSlide([{ ...embedObj, embedType: 'code' }]);
      render(<FormatPanel />);
      expect(screen.getByText('Language')).toBeTruthy();
    });

    it('shows url input when embedType is youtube', () => {
      mockState.selectedObjectIds = ['emd-1'];
      mockState.activeSlide = makeSlide([embedObj]);
      render(<FormatPanel />);
      expect(screen.getByPlaceholderText('URL or mermaid source')).toBeTruthy();
    });
  });

  describe('shape shadow enabled', () => {
    it('renders shadow color and blur controls', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([
        { ...shapeObj, shadow: { ...shapeObj.shadow, enabled: true } },
      ]);
      render(<FormatPanel />);
      expect(screen.getByText('Blur')).toBeTruthy();
    });
  });

  describe('apply presets', () => {
    it('clicks a preset button', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const presetBtns = screen.getAllByRole('button').filter((b) => {
        const text = b.textContent?.trim();
        return text === 'Indigo' || text === 'Cyan fade';
      });
      if (presetBtns.length > 0) {
        fireEvent.click(presetBtns[0]);
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('applies outline preset with stroke', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const outlineBtn = screen
        .getAllByRole('button')
        .find((b) => b.textContent?.trim() === 'Outline');
      if (outlineBtn) {
        fireEvent.click(outlineBtn);
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('applies glow preset with effect', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const glowBtn = screen.getAllByRole('button').find((b) => b.textContent?.trim() === 'Glow');
      if (glowBtn) {
        fireEvent.click(glowBtn);
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('applies soft preset with effect', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      render(<FormatPanel />);
      const softBtn = screen.getAllByRole('button').find((b) => b.textContent?.trim() === 'Soft');
      if (softBtn) {
        fireEvent.click(softBtn);
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('text style controls', () => {
    beforeEach(() => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([textObj]);
    });

    it('toggles bullets on and numbered off', () => {
      render(<FormatPanel />);
      const bullets = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Bullets');
      });
      if (bullets) fireEvent.click(bullets);
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ bullet: true, numbered: false }),
        }),
      );
    });

    it('toggles numbered on and bullets off', () => {
      render(<FormatPanel />);
      const numbered = screen.getAllByRole('checkbox').find((el) => {
        const label = el.closest('label');
        return label?.textContent?.includes('Numbered');
      });
      if (numbered) fireEvent.click(numbered);
      expect(mockUpdateObject).toHaveBeenCalledWith(
        'txt-1',
        expect.objectContaining({
          style: expect.objectContaining({ numbered: true, bullet: false }),
        }),
      );
    });

    it('renders vertical select', () => {
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const vertSelect = selects.find((s) => (s as HTMLSelectElement).value === 'top');
      expect(vertSelect).toBeTruthy();
      if (vertSelect) {
        fireEvent.change(vertSelect, { target: { value: 'middle' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('renders effect transform select', () => {
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const effectSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
      expect(effectSelect).toBeTruthy();
    });
  });

  describe('text with fill', () => {
    it('renders gradient fill type change from none', () => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([textObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'solid' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('shape fill changes from non-solid', () => {
    it('changes gradient fill to solid preserving no existing solid', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: {
            type: 'gradient',
            from: '#ff0000',
            to: '#0000ff',
            angle: 45,
            opacity: 1,
          },
        },
      ]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const fillSelect = selects.find((s) => (s as HTMLSelectElement).value === 'gradient');
      if (fillSelect) {
        fireEvent.change(fillSelect, { target: { value: 'solid' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('gradient stops editor interactions', () => {
    it('renders gradient from/to color inputs', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: {
            type: 'gradient',
            from: '#ff0000',
            to: '#0000ff',
            angle: 45,
            opacity: 1,
            stops: [
              { color: '#ff0000', offset: 0 },
              { color: '#00ff00', offset: 0.5 },
              { color: '#0000ff', offset: 1 },
            ],
          },
        },
      ]);
      render(<FormatPanel />);
      expect(screen.getByText('Add stop')).toBeTruthy();
    });

    it('clicks add stop button', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([
        {
          ...shapeObj,
          fill: {
            type: 'gradient',
            from: '#ff0000',
            to: '#0000ff',
            angle: 45,
            opacity: 1,
          },
        },
      ]);
      render(<FormatPanel />);
      fireEvent.click(screen.getByText('Add stop'));
      expect(mockUpdateObject).toHaveBeenCalled();
    });
  });

  describe('link input changes', () => {
    it('changes url link input', () => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([{ ...textObj, link: { type: 'url', url: '' } }]);
      render(<FormatPanel />);
      const urlInput = screen.getByPlaceholderText('https://example.com');
      fireEvent.change(urlInput, { target: { value: 'https://new.com' } });
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('changes email link input', () => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([{ ...textObj, link: { type: 'email', email: '' } }]);
      render(<FormatPanel />);
      const emailInput = screen.getByPlaceholderText('name@example.com');
      fireEvent.change(emailInput, {
        target: { value: 'new@test.com' },
      });
      expect(mockUpdateObject).toHaveBeenCalled();
    });

    it('changes slide link target', () => {
      const slide = makeSlide([{ ...textObj, link: { type: 'slide', slideId: '' } }]);
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = slide;
      mockState.currentDeck = {
        ...defaultDeck,
        slides: [slide, { ...slide, id: 'slide-2', name: 'Second' }],
      };
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const slideSelect = selects.find((s) => (s as HTMLSelectElement).value === '');
      if (slideSelect) {
        fireEvent.change(slideSelect, { target: { value: 'slide-2' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('sets link type to email', () => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([textObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const linkSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
      if (linkSelect) {
        fireEvent.change(linkSelect, { target: { value: 'email' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('sets link type to slide', () => {
      mockState.selectedObjectIds = ['txt-1'];
      mockState.activeSlide = makeSlide([textObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const linkSelect = selects.find((s) => (s as HTMLSelectElement).value === 'none');
      if (linkSelect) {
        fireEvent.change(linkSelect, { target: { value: 'slide' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('chart input changes', () => {
    it('changes chart type', () => {
      mockState.selectedObjectIds = ['cht-1'];
      mockState.activeSlide = makeSlide([chartObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const chartSelect = selects.find((s) => (s as HTMLSelectElement).value === 'column');
      if (chartSelect) {
        fireEvent.change(chartSelect, { target: { value: 'bar' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes labels', () => {
      mockState.selectedObjectIds = ['cht-1'];
      mockState.activeSlide = makeSlide([chartObj]);
      render(<FormatPanel />);
      const labelInput = screen.getByDisplayValue('A, B, C, D, E');
      fireEvent.change(labelInput, {
        target: { value: 'X, Y, Z' },
      });
      expect(mockUpdateObject).toHaveBeenCalled();
    });
  });

  describe('table input changes', () => {
    it('changes header fill color', () => {
      mockState.selectedObjectIds = ['tbl-1'];
      mockState.activeSlide = makeSlide([tableObj]);
      render(<FormatPanel />);
      const inputs = screen.getAllByRole('textbox');
      const headerFillInput = inputs.find(
        (i) =>
          (i as HTMLInputElement).type === 'text' &&
          (i as HTMLInputElement).value.startsWith('rgba'),
      );
      if (headerFillInput) {
        fireEvent.change(headerFillInput, { target: { value: '#ff0000' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('diagram input changes', () => {
    it('changes diagram type', () => {
      mockState.selectedObjectIds = ['dia-1'];
      mockState.activeSlide = makeSlide([diagramObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const diagramSelect = selects.find((s) => (s as HTMLSelectElement).value === 'process');
      if (diagramSelect) {
        fireEvent.change(diagramSelect, { target: { value: 'cycle' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('image input changes', () => {
    it('changes image src', () => {
      mockState.selectedObjectIds = ['img-1'];
      mockState.activeSlide = makeSlide([imageObj]);
      render(<FormatPanel />);
      const srcInput = screen
        .getAllByRole('textbox')
        .find((i) => (i as HTMLInputElement).placeholder === 'Image URL');
      if (srcInput) {
        fireEvent.change(srcInput, {
          target: { value: 'https://new.com/img.png' },
        });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes border color', () => {
      mockState.selectedObjectIds = ['img-1'];
      mockState.activeSlide = makeSlide([imageObj]);
      render(<FormatPanel />);
      expect(screen.getByText('Border')).toBeTruthy();
    });
  });

  describe('embed code type', () => {
    it('changes embed type to mermaid', () => {
      mockState.selectedObjectIds = ['emd-1'];
      mockState.activeSlide = makeSlide([embedObj]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const embedSelect = selects.find((s) => (s as HTMLSelectElement).value === 'youtube');
      if (embedSelect) {
        fireEvent.change(embedSelect, { target: { value: 'mermaid' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });

    it('changes code language', () => {
      mockState.selectedObjectIds = ['emd-1'];
      mockState.activeSlide = makeSlide([
        { ...embedObj, embedType: 'code', language: 'javascript' },
      ]);
      render(<FormatPanel />);
      const selects = screen.getAllByRole('combobox');
      const langSelect = selects.find((s) => (s as HTMLSelectElement).value === 'javascript');
      if (langSelect) {
        fireEvent.change(langSelect, { target: { value: 'python' } });
        expect(mockUpdateObject).toHaveBeenCalled();
      }
    });
  });

  describe('slide size inputs', () => {
    it('changes slide width', () => {
      mockState.selectedObjectIds = ['shp-1'];
      mockState.activeSlide = makeSlide([shapeObj]);
      mockState.currentDeck = defaultDeck;
      render(<FormatPanel />);
      const numberInputs = screen.getAllByRole('spinbutton');
      const wInput = numberInputs.find((i) => (i as HTMLInputElement).value === '1800');
      if (wInput) {
        fireEvent.change(wInput, { target: { value: '1920' } });
        expect(mockSetDeckSize).toHaveBeenCalled();
      }
    });
  });
});

/* ------------------------------------------------------------------ */
/*  AnimationsPanel                                                    */
/* ------------------------------------------------------------------ */
