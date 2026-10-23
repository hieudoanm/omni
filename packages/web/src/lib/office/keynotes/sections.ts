import type { DeckSection } from '@/types/keynotes/deck';
import { generateId } from '@/lib/office/keynotes/id';

export const newSection = (title = 'New section'): DeckSection => ({
  id: generateId('sec'),
  title,
  slideIds: [],
});

export const renameSection = (sections: DeckSection[], id: string, title: string): DeckSection[] =>
  sections.map((s) => (s.id === id ? { ...s, title } : s));

export const deleteSection = (sections: DeckSection[], id: string): DeckSection[] =>
  sections.filter((s) => s.id !== id);

export const moveSection = (sections: DeckSection[], id: string, dir: -1 | 1): DeckSection[] => {
  const index = sections.findIndex((s) => s.id === id);
  const target = index + dir;
  if (index < 0 || target < 0 || target >= sections.length) return sections;
  const next = [...sections];
  const [section] = next.splice(index, 1);
  next.splice(target, 0, section);
  return next;
};

export const sectionAddSlide = (
  sections: DeckSection[],
  id: string,
  slideId: string,
): DeckSection[] =>
  sections.map((s) =>
    s.id === id && !s.slideIds.includes(slideId) ? { ...s, slideIds: [...s.slideIds, slideId] } : s,
  );

export const sectionRemoveSlide = (
  sections: DeckSection[],
  id: string,
  slideId: string,
): DeckSection[] =>
  sections.map((s) =>
    s.id === id ? { ...s, slideIds: s.slideIds.filter((x) => x !== slideId) } : s,
  );

export const sectionedSlideIds = (sections: DeckSection[]): Set<string> =>
  new Set(sections.flatMap((s) => s.slideIds));
