import { fireEvent, screen, waitFor } from '@testing-library/react';
import PresentPage from '@/app/apps/office/keynotes/present/[id]/PresentPage';
import { db } from '@/lib/office/keynotes/db';
import {
  newDeck,
  newShapeObject,
  newSlide,
  newTextObject,
} from '@/lib/office/keynotes/deckFactory';
import { themeById } from '@/data/office/keynotes/themes';
import type { Slide } from '@/types/keynotes/deck';
import { renderWithDeck, resetDb } from '@/test/keynotes/helpers';

const buildDeck = () => {
  const theme = themeById('midnight');
  const first = newSlide('blank', theme, 1);
  first.objects = [{ ...newTextObject({ x: 40, y: 40, w: 300, h: 80 }), z: 0 }];
  const second = newSlide('section', theme, 2);
  (second.objects[0] as { animation?: unknown }).animation = {
    type: 'entrance',
    effect: 'fade-up',
    duration: 600,
    delay: 0,
    trigger: 'click',
    easing: 'ease-out',
    repeat: 1,
  };
  return newDeck({
    id: 'deck-test',
    title: 'Present Deck',
    theme,
    themeId: 'midnight',
    slides: [first, second],
  });
};

const seed = async () => {
  resetDb();
  process.env.NEXT_PUBLIC_MOCK_DELAY = '1';
  await db.decks.put(buildDeck());
};

const renderPresent = async () => {
  renderWithDeck(<PresentPage />);
  await waitFor(() => expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument());
};

beforeEach(async () => {
  await seed();
});

describe('PresentPage', () => {
  it('renders slides and navigates with buttons and keys', async () => {
    await renderPresent();
    expect(screen.getByTitle('Next (→)')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Next (→)'));
    await waitFor(() => expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await waitFor(() => expect(screen.getByText(/1 \/ 2/)).toBeInTheDocument());

    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: ' ' });
    fireEvent.keyDown(window, { key: 'PageDown' });
    fireEvent.keyDown(window, { key: 'PageUp' });
    fireEvent.keyDown(window, { key: 'Backspace' });
  });

  it('toggles screen modes and spotlight via toolbar and keys', async () => {
    await renderPresent();
    fireEvent.click(screen.getByTitle('Blackout slide (B)'));
    fireEvent.keyDown(window, { key: 'b' });
    fireEvent.click(screen.getByTitle('Whiteout slide (W)'));
    fireEvent.keyDown(window, { key: 'w' });
    fireEvent.click(screen.getByTitle('Spotlight zoom (S)'));
    fireEvent.keyDown(window, { key: 's' });
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('uses annotation tools, colors and clear', async () => {
    await renderPresent();
    fireEvent.click(screen.getByTitle('Pen (P)'));
    fireEvent.click(screen.getByTitle('Color #ff453a'));
    fireEvent.click(screen.getByTitle('Highlighter (H)'));
    fireEvent.click(screen.getByTitle('Laser pointer (L)'));
    fireEvent.keyDown(window, { key: 'p' });
    fireEvent.keyDown(window, { key: 'h' });
    fireEvent.keyDown(window, { key: 'l' });
    fireEvent.keyDown(window, { key: 'e' });
    fireEvent.keyDown(window, { key: 'c' });
    fireEvent.click(screen.getByTitle('Clear annotations (C)'));
  });

  it('asks a question and cancels', async () => {
    await renderPresent();
    fireEvent.click(screen.getByTitle('Ask a question'));
    const textarea = screen.getByPlaceholderText('Your question will appear in the Q&A feed…');
    fireEvent.change(textarea, { target: { value: 'Hello?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText('Your question will appear in the Q&A feed…'),
      ).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByTitle('Ask a question'));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('toggles fullscreen and exits', async () => {
    await renderPresent();
    fireEvent.click(screen.getByTitle('Toggle fullscreen'));
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    fireEvent.click(screen.getByTitle('Exit (Esc)'));
  });
});
