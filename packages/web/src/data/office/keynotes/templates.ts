import type { Deck, SlideLayoutId } from '@/types/keynotes/deck';
import { themeById } from '@/data/office/keynotes/themes';
import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  themeId: string;
  slides: Array<{ layout: SlideLayoutId; title: string }>;
  build: (partial?: Partial<Deck>) => Deck;
}

const makeDeck = (
  id: string,
  title: string,
  description: string,
  themeId: string,
  slides: Array<{ layout: SlideLayoutId; title: string }>,
): Deck => {
  const theme = themeById(themeId);
  const deck = newDeck({ title, description, themeId, theme });
  deck.slides = slides.map((s, i) => {
    const slide = newSlide(s.layout, theme, i + 1);
    slide.name = s.title;
    const titleObj = slide.objects.find((o) => o.kind === 'text' && o.name === 'Title');
    if (titleObj && titleObj.kind === 'text') {
      titleObj.text = s.title;
      titleObj.name = s.title;
    }
    return slide;
  });
  return deck;
};

export const TEMPLATES: DeckTemplate[] = [
  {
    id: 'pitch',
    name: 'Startup Pitch',
    description: 'A concise investor pitch deck.',
    themeId: 'midnight',
    slides: [
      { layout: 'cover', title: 'Pitch Deck' },
      { layout: 'title-content', title: 'The Problem' },
      { layout: 'title-content', title: 'The Solution' },
      { layout: 'title-content', title: 'Market Opportunity' },
      { layout: 'title-content', title: 'Business Model' },
      { layout: 'title-content', title: 'Traction' },
      { layout: 'title-content', title: 'Roadmap' },
      { layout: 'title-content', title: 'The Team' },
      { layout: 'thank-you', title: 'Thank You' },
    ],
    build: (p) =>
      makeDeck('pitch', 'Pitch Deck', 'Investor pitch', 'midnight', TEMPLATES[0].slides),
  },
  {
    id: 'report',
    name: 'Quarterly Report',
    description: 'A professional business report.',
    themeId: 'slate',
    slides: [
      { layout: 'cover', title: 'Quarterly Report' },
      { layout: 'title-content', title: 'Executive Summary' },
      { layout: 'title-content', title: 'Financial Highlights' },
      { layout: 'title-content', title: 'Key Metrics' },
      { layout: 'title-content', title: 'Challenges' },
      { layout: 'title-content', title: 'Next Quarter Goals' },
      { layout: 'thank-you', title: 'Thank You' },
    ],
    build: (p) =>
      makeDeck('report', 'Quarterly Report', 'Business report', 'slate', TEMPLATES[1].slides),
  },
  {
    id: 'lesson',
    name: 'Lesson',
    description: 'A classroom lesson deck.',
    themeId: 'paper',
    slides: [
      { layout: 'cover', title: 'Lesson Title' },
      { layout: 'title-content', title: 'Learning Objectives' },
      { layout: 'title-content', title: 'Key Concepts' },
      { layout: 'two-content', title: 'Examples' },
      { layout: 'title-content', title: 'Practice' },
      { layout: 'thank-you', title: 'Summary' },
    ],
    build: (p) => makeDeck('lesson', 'Lesson', 'Classroom lesson', 'paper', TEMPLATES[2].slides),
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'A romantic celebration deck.',
    themeId: 'sunset',
    slides: [
      { layout: 'cover', title: 'Our Wedding' },
      { layout: 'title-content', title: 'Welcome' },
      { layout: 'title-content', title: 'The Story' },
      { layout: 'title-content', title: 'The Couple' },
      { layout: 'title-content', title: 'Celebration Details' },
      { layout: 'thank-you', title: 'Thank You' },
    ],
    build: (p) =>
      makeDeck('wedding', 'Wedding', 'Wedding celebration', 'sunset', TEMPLATES[3].slides),
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'A personal portfolio showcase.',
    themeId: 'forest',
    slides: [
      { layout: 'cover', title: 'My Portfolio' },
      { layout: 'title-content', title: 'About Me' },
      { layout: 'title-content', title: 'Experience' },
      { layout: 'title-content', title: 'Projects' },
      { layout: 'title-content', title: 'Skills' },
      { layout: 'title-content', title: 'Contact' },
      { layout: 'thank-you', title: 'Thank You' },
    ],
    build: (p) =>
      makeDeck('portfolio', 'Portfolio', 'Personal portfolio', 'forest', TEMPLATES[4].slides),
  },
  {
    id: 'tech-talk',
    name: 'Tech Talk',
    description: 'A developer conference talk.',
    themeId: 'mono',
    slides: [
      { layout: 'cover', title: 'Tech Talk' },
      { layout: 'title-content', title: 'Introduction' },
      { layout: 'title-content', title: 'The Problem' },
      { layout: 'two-content', title: 'How It Works' },
      { layout: 'title-content', title: 'Demo' },
      { layout: 'title-content', title: 'Results' },
      { layout: 'thank-you', title: 'Q&A' },
    ],
    build: (p) => makeDeck('tech-talk', 'Tech Talk', 'Developer talk', 'mono', TEMPLATES[5].slides),
  },
];

export const templateById = (id: string): DeckTemplate | undefined =>
  TEMPLATES.find((t) => t.id === id);
