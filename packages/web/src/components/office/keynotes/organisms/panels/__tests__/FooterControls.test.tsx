import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FooterControls } from '@/components/office/keynotes/organisms/panels/FooterControls';
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
  return d.currentDeck ? <FooterControls /> : <div>loading</div>;
};

const renderControls = async () => {
  render(
    <DeckProvider>
      <Consumer deckId='deck-fc' />
    </DeckProvider>,
  );
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
};

beforeEach(async () => {
  resetDB();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  const deck = newDeck({
    id: 'deck-fc',
    title: 'Footer Deck',
    slides: [newSlide('cover', themeById('midnight'), 1)],
    footer: {
      showNumbers: true,
      showDate: false,
      text: 'Footer text',
      logo: '',
    },
  });
  await db.decks.put(deck);
});

describe('FooterControls', () => {
  it('returns null when no deck is loaded', () => {
    const { container } = render(
      <DeckProvider>
        <FooterControls />
      </DeckProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders footer controls with toggles and inputs', async () => {
    await renderControls();
    expect(screen.getByText('Show slide numbers')).toBeInTheDocument();
    expect(screen.getByText('Show date')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Footer text')).toBeInTheDocument();
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('toggles showNumbers', async () => {
    await renderControls();
    const toggle = screen.getByText('Show slide numbers').closest('label')!;
    fireEvent.click(toggle);
  });

  it('toggles showDate', async () => {
    await renderControls();
    const toggle = screen.getByText('Show date').closest('label')!;
    fireEvent.click(toggle);
  });

  it('edits footer text', async () => {
    await renderControls();
    const input = screen.getByPlaceholderText('Footer text');
    fireEvent.change(input, { target: { value: 'New footer' } });
  });

  it('edits logo URL', async () => {
    await renderControls();
    const logoInputs = screen.getAllByRole('textbox');
    const logoInput = logoInputs.find((el) => (el as HTMLInputElement).placeholder === 'Logo URL');
    expect(logoInput).toBeInTheDocument();
    if (logoInput) {
      fireEvent.change(logoInput, { target: { value: 'https://logo.png' } });
    }
  });

  it('upload logo button triggers file input', async () => {
    await renderControls();
    fireEvent.click(screen.getByText('Upload logo…'));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
  });

  it('file input change triggers upload with data URL', async () => {
    await renderControls();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);
  });

  it('shows logo preview when logo URL is set', async () => {
    render(
      <DeckProvider>
        <ConsumerWithLogo deckId='deck-fc' />
      </DeckProvider>,
    );
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
    expect(screen.getByAltText('Logo preview')).toBeInTheDocument();
  });

  it('does not show logo preview when logo is empty', async () => {
    await renderControls();
    expect(screen.queryByAltText('Logo preview')).not.toBeInTheDocument();
  });
});

const ConsumerWithLogo: React.FC<{ deckId: string }> = ({ deckId }) => {
  const d = useDeck();
  useEffect(() => {
    void d.openDeck(deckId).then(() => {
      d.setFooter({ logo: 'https://example.com/logo.png' });
    });
  }, [deckId, d.openDeck, d.setFooter]);
  return d.currentDeck ? <FooterControls /> : <div>loading</div>;
};
