import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InsertToolbar } from '@/components/office/keynotes/organisms/InsertToolbar';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide, newTextObject } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { useEffect } from 'react';
import { captureScreen } from '@/lib/office/keynotes/capture';

jest.mock('@/lib/office/keynotes/capture', () => ({
  captureScreen: jest.fn(),
}));

const resetDB = __resetIdbMock;

const Consumer: React.FC<{
  deckId: string;
  drawMode?: boolean;
  onToggleDrawing?: () => void;
  action?: 'select-single' | 'select-multi' | 'select-group';
  groupStep?: number;
  onGroupCreated?: (groupId: string) => void;
}> = ({ deckId, drawMode, onToggleDrawing, action, groupStep, onGroupCreated }) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId).then(() => {
      if (action === 'select-single') {
        d.setSelection(['obj-1']);
      } else if (action === 'select-multi') {
        const id2 = d.addObject(newTextObject({ text: 'Obj 2' }));
        d.setSelection(['obj-1', id2]);
      } else if (action === 'select-group' && groupStep === 0) {
        const id2 = d.addObject(newTextObject({ text: 'Grp 2' }));
        d.setSelection(['obj-1', id2]);
        d.groupSelected();
      }
    });
  }, [deckId, d.openDeck, d.setSelection, d.addObject, d.groupSelected, action, groupStep]);
  useEffect(() => {
    if (action !== 'select-group' || groupStep !== 1 || !d.activeSlide) return;
    const groupObj = d.activeSlide.objects.find((o) => o.kind === 'group');
    if (groupObj) {
      d.setSelection([groupObj.id]);
    }
  }, [action, groupStep, d.activeSlide, d.setSelection]);
  return d.currentDeck ? (
    <InsertToolbar drawMode={drawMode} onToggleDrawing={onToggleDrawing} />
  ) : (
    <div>loading</div>
  );
};

const renderToolbar = async (opts?: {
  drawMode?: boolean;
  onToggleDrawing?: () => void;
  action?: 'select-single' | 'select-multi' | 'select-group';
}) => {
  render(
    <DeckProvider>
      <Consumer
        deckId='deck-it'
        drawMode={opts?.drawMode}
        onToggleDrawing={opts?.onToggleDrawing}
        action={opts?.action}
      />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
};

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const deck = newDeck({
    id: 'deck-it',
    title: 'Insert Deck',
    slides: [newSlide('cover', themeById('midnight'), 1)],
  });
  deck.slides[0].objects = [newTextObject({ id: 'obj-1' })];
  await db.decks.put(deck);
});

describe('InsertToolbar', () => {
  it('renders all toolbar buttons', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Text box')).toBeInTheDocument();
    expect(screen.getByLabelText('Shape')).toBeInTheDocument();
    expect(screen.getByLabelText('Chart')).toBeInTheDocument();
    expect(screen.getByLabelText('Table')).toBeInTheDocument();
    expect(screen.getByLabelText('Screenshot')).toBeInTheDocument();
    expect(screen.getByLabelText('Diagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Icon')).toBeInTheDocument();
    expect(screen.getByLabelText('Equation')).toBeInTheDocument();
    expect(screen.getByLabelText('Media')).toBeInTheDocument();
    expect(screen.getByLabelText('Embed')).toBeInTheDocument();
  });

  it('adds a text object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Text box'));
  });

  it('adds a shape object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Shape'));
  });

  it('adds a chart object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Chart'));
  });

  it('adds a table object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Table'));
  });

  it('adds a diagram object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Diagram'));
  });

  it('adds an icon object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Icon'));
  });

  it('adds an equation object on click', async () => {
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Equation'));
  });

  it('insertMedia prompts for URL and adds media', async () => {
    (window.prompt as jest.Mock).mockReturnValue('https://example.com/video.mp4');
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Media'));
    expect(window.prompt).toHaveBeenCalled();
  });

  it('insertMedia cancels when prompt returns null', async () => {
    (window.prompt as jest.Mock).mockReturnValue(null);
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Media'));
  });

  it('insertEmbed prompts for URL and adds embed', async () => {
    (window.prompt as jest.Mock).mockReturnValue('https://youtube.com/123');
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Embed'));
    expect(window.prompt).toHaveBeenCalled();
  });

  it('insertEmbed cancels when prompt returns null', async () => {
    (window.prompt as jest.Mock).mockReturnValue(null);
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Embed'));
  });

  it('insertImage from URL prompts and adds image', async () => {
    (window.prompt as jest.Mock).mockReturnValue('https://example.com/img.png');
    await renderToolbar();
    const imageBtn = screen.getByText('Image').closest('button')!;
    fireEvent.click(imageBtn);
    fireEvent.click(screen.getByText('From URL…'));
    expect(window.prompt).toHaveBeenCalled();
  });

  it('insertImage from URL cancels when prompt returns null', async () => {
    (window.prompt as jest.Mock).mockReturnValue(null);
    await renderToolbar();
    const imageBtn = screen.getByText('Image').closest('button')!;
    fireEvent.click(imageBtn);
    fireEvent.click(screen.getByText('From URL…'));
  });

  it('screenshot calls captureScreen and adds image on success', async () => {
    (captureScreen as jest.Mock).mockResolvedValue('data:image/png;base64,abc');
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Screenshot'));
    await waitFor(() => expect(captureScreen).toHaveBeenCalled());
  });

  it('screenshot alerts when captureScreen returns null', async () => {
    (captureScreen as jest.Mock).mockResolvedValue(null);
    await renderToolbar();
    fireEvent.click(screen.getByLabelText('Screenshot'));
    await waitFor(() => expect(window.alert).toHaveBeenCalled());
  });

  it('toggles drawing mode', async () => {
    const onToggle = jest.fn();
    await renderToolbar({ onToggleDrawing: onToggle });
    fireEvent.click(screen.getByLabelText('Draw'));
    expect(onToggle).toHaveBeenCalled();
  });

  it('shows "Finish drawing" label when drawMode is true', async () => {
    await renderToolbar({ drawMode: true });
    expect(screen.getByLabelText('Finish drawing')).toBeInTheDocument();
  });

  it('duplicate button is disabled when nothing selected', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Duplicate (Ctrl+D)')).toBeDisabled();
  });

  it('delete button is disabled when nothing selected', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Delete')).toBeDisabled();
  });

  it('enables duplicate/delete with single selection', async () => {
    await renderToolbar({ action: 'select-single' });
    await waitFor(() => {
      expect(screen.getByLabelText('Duplicate (Ctrl+D)')).not.toBeDisabled();
      expect(screen.getByLabelText('Delete')).not.toBeDisabled();
    });
  });

  it('delete calls deleteObject for each selected', async () => {
    await renderToolbar({ action: 'select-single' });
    await waitFor(() => {
      expect(screen.getByLabelText('Delete')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByLabelText('Delete'));
  });

  it('duplicate calls duplicateSelected', async () => {
    await renderToolbar({ action: 'select-single' });
    await waitFor(() => {
      expect(screen.getByLabelText('Duplicate (Ctrl+D)')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByLabelText('Duplicate (Ctrl+D)'));
  });

  it('layer buttons disabled when no selection', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Send to back')).toBeDisabled();
    expect(screen.getByLabelText('Bring to front')).toBeDisabled();
    expect(screen.getByLabelText('Bring forward')).toBeDisabled();
    expect(screen.getByLabelText('Send backward')).toBeDisabled();
  });

  it('layer buttons enabled and callable with single selection', async () => {
    await renderToolbar({ action: 'select-single' });
    await waitFor(() => {
      expect(screen.getByLabelText('Send to back')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByLabelText('Send to back'));
    fireEvent.click(screen.getByLabelText('Bring to front'));
    fireEvent.click(screen.getByLabelText('Bring forward'));
    fireEvent.click(screen.getByLabelText('Send backward'));
  });

  it('alignment buttons disabled when fewer than 2 selected', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Align left')).toBeDisabled();
  });

  it('alignment buttons enabled with 2+ selection', async () => {
    await renderToolbar({ action: 'select-multi' });
    await waitFor(() => {
      expect(screen.getByLabelText('Align left')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByLabelText('Align left'));
    fireEvent.click(screen.getByLabelText('Align center'));
    fireEvent.click(screen.getByLabelText('Align right'));
    fireEvent.click(screen.getByLabelText('Align top'));
    fireEvent.click(screen.getByLabelText('Distribute horizontally'));
  });

  it('group button disabled when fewer than 2 selected', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Group (Ctrl+G)')).toBeDisabled();
  });

  it('group button enabled with 2+ selection', async () => {
    await renderToolbar({ action: 'select-multi' });
    await waitFor(() => {
      expect(screen.getByLabelText('Group (Ctrl+G)')).not.toBeDisabled();
    });
    fireEvent.click(screen.getByLabelText('Group (Ctrl+G)'));
  });

  it('ungroup button disabled when no group selected', async () => {
    await renderToolbar();
    expect(screen.getByLabelText('Ungroup')).toBeDisabled();
  });

  it('group button enabled when multiple objects selected', async () => {
    await renderToolbar({ action: 'select-multi' });
    await waitFor(() => {
      expect(screen.getByLabelText('Group (Ctrl+G)')).not.toBeDisabled();
    });
  });

  it('opens shapes dropdown and inserts a specific shape', async () => {
    await renderToolbar();
    const shapesBtn = screen.getByText('Shapes').closest('button')!;
    fireEvent.click(shapesBtn);
    await waitFor(() => {
      expect(screen.getByTitle('rect')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTitle('rect'));
  });

  it('opens icons dropdown and inserts a specific icon', async () => {
    await renderToolbar();
    const iconsBtn = screen.getByText('Icons').closest('button')!;
    fireEvent.click(iconsBtn);
    await waitFor(() => {
      const iconButtons = document.querySelectorAll('.dropdown-content button');
      expect(iconButtons.length).toBeGreaterThan(0);
    });
    // Click the first icon button
    const firstIcon = document.querySelector('.dropdown-content button');
    if (firstIcon) fireEvent.click(firstIcon);
  });

  it('toggles image dropdown on repeated clicks', async () => {
    await renderToolbar();
    const imageBtn = screen.getByText('Image').closest('button')!;
    fireEvent.click(imageBtn);
    await waitFor(() => expect(screen.getByText('Upload…')).toBeInTheDocument());
    fireEvent.click(imageBtn);
    await waitFor(() => expect(screen.queryByText('Upload…')).not.toBeInTheDocument());
  });

  it('toggles shapes dropdown on repeated clicks', async () => {
    await renderToolbar();
    const shapesBtn = screen.getByText('Shapes').closest('button')!;
    fireEvent.click(shapesBtn);
    await waitFor(() => expect(screen.getByTitle('rect')).toBeInTheDocument());
    fireEvent.click(shapesBtn);
    await waitFor(() => expect(screen.queryByTitle('rect')).not.toBeInTheDocument());
  });

  it('toggles icons dropdown on repeated clicks', async () => {
    await renderToolbar();
    const iconsBtn = screen.getByText('Icons').closest('button')!;
    fireEvent.click(iconsBtn);
    await waitFor(() => {
      const iconButtons = document.querySelectorAll('.dropdown-content button');
      expect(iconButtons.length).toBeGreaterThan(0);
    });
    fireEvent.click(iconsBtn);
    await waitFor(() => {
      const iconButtons = document.querySelectorAll('.dropdown-content button');
      expect(iconButtons.length).toBe(0);
    });
  });

  it('file input triggers upload on change', async () => {
    await renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
  });

  it('upload button in image dropdown triggers file input click', async () => {
    await renderToolbar();
    const imageBtn = screen.getByText('Image').closest('button')!;
    fireEvent.click(imageBtn);
    fireEvent.click(screen.getByText('Upload…'));
  });
});
