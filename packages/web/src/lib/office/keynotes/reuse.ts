import type { Deck, Slide } from '@/types/keynotes/deck';
import { generateId } from '@/lib/office/keynotes/id';

export const cloneSlideForInsert = (slide: Slide): Slide => {
  const newId = generateId('sld');
  const objectIds = new Map<string, string>();
  for (const o of slide.objects) objectIds.set(o.id, generateId(o.kind));
  return {
    ...slide,
    id: newId,
    name: slide.name,
    objects: slide.objects.map((o) => ({
      ...o,
      id: objectIds.get(o.id) as string,
      group: o.group ? objectIds.get(o.group) : undefined,
    })),
  };
};

export const appendSlides = (deck: Deck, slides: Slide[]): Deck => ({
  ...deck,
  slides: [...deck.slides, ...slides],
  version: deck.version + 1,
});

export const insertSlidesAfter = (deck: Deck, afterId: string, slides: Slide[]): Deck => {
  const index = deck.slides.findIndex((s) => s.id === afterId);
  if (index < 0) return appendSlides(deck, slides);
  const next = [...deck.slides];
  next.splice(index + 1, 0, ...slides);
  return { ...deck, slides: next, version: deck.version + 1 };
};
