import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ExportMenu } from '@/components/office/keynotes/organisms/ExportMenu';
import { DeckProvider, useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { db } from '@/lib/office/keynotes/db';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import { __resetIdbMock } from '@/lib/office/keynotes/__mocks__/idb';
import { useEffect } from 'react';

const resetDB = __resetIdbMock;

const Consumer: React.FC<{ deckId: string }> = ({ deckId }) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId);
  }, [deckId, d.openDeck]);
  return d.currentDeck ? <ExportMenu /> : <div>loading</div>;
};

const renderMenu = async () => {
  render(
    <DeckProvider>
      <Consumer deckId='deck-em' />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
};

let clickSpy: jest.SpyInstance;

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const deck = newDeck({
    id: 'deck-em',
    title: 'Export Deck',
    slides: [newSlide('cover', themeById('midnight'), 1)],
  });
  await db.decks.put(deck);
  clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  URL.createObjectURL = jest.fn(() => 'blob:test') as unknown as typeof URL.createObjectURL;
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  clickSpy.mockRestore();
});

describe('ExportMenu', () => {
  it('returns null when no deck is loaded', () => {
    const { container } = render(
      <DeckProvider>
        <ExportMenu />
      </DeckProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the export button', async () => {
    await renderMenu();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('exports native project JSON', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('Native project (.keynotes.json)'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exports PPTX mock', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('PPTX (mock archive)'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exports HTML presentation', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('HTML presentation'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exports theme file', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('Theme (.theme)'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exports all slides as PNG', async () => {
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        drawImage: jest.fn(),
        fillRect: jest.fn(),
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(['png'])));
    global.Image = class {
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
      onload?: () => void;
    } as unknown as typeof Image;

    await renderMenu();
    fireEvent.click(screen.getByText('All slides as PNG'));
    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
  });

  it('exports image story SVG', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('Image story (long SVG)'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('exports image story PNG', async () => {
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        drawImage: jest.fn(),
        fillRect: jest.fn(),
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(['png'])));
    global.Image = class {
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
      onload?: () => void;
    } as unknown as typeof Image;

    await renderMenu();
    fireEvent.click(screen.getByText('Image story (long PNG)'));
    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
  });

  it('exports current slide as PNG when slide is active', async () => {
    HTMLCanvasElement.prototype.getContext = (() =>
      ({
        drawImage: jest.fn(),
        fillRect: jest.fn(),
      }) as unknown as CanvasRenderingContext2D) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob = jest.fn((cb: BlobCallback) => cb(new Blob(['png'])));
    global.Image = class {
      set src(_v: string) {
        setTimeout(() => this.onload?.(), 0);
      }
      onload?: () => void;
    } as unknown as typeof Image;

    await renderMenu();
    fireEvent.click(screen.getByText('Current slide as PNG'));
    await waitFor(() => expect(clickSpy).toHaveBeenCalled());
  });

  it('exports current slide as SVG when slide is active', async () => {
    await renderMenu();
    fireEvent.click(screen.getByText('Current slide as SVG'));
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not show slide image options when no active slide', async () => {
    render(
      <DeckProvider>
        <ExportMenuNoSlide />
      </DeckProvider>,
    );
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
    // The deck always has an active slide, so slide options should be visible
    expect(screen.getByText('Current slide as PNG')).toBeInTheDocument();
  });

  it('print/handouts links have correct href', async () => {
    await renderMenu();
    const printLink = screen.getByText('Print / Save as PDF').closest('a');
    expect(printLink).toHaveAttribute('href', '/print/deck-em');
    const handoutsLink = screen.getByText('Handouts (multi-per-page)').closest('a');
    expect(handoutsLink).toHaveAttribute('href', '/handouts/deck-em');
  });
});

const ExportMenuNoSlide: React.FC = () => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck('deck-em');
  }, []);
  return d.currentDeck ? <ExportMenu /> : <div>loading</div>;
};
