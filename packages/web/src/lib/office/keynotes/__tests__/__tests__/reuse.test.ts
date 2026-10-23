import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { appendSlides, cloneSlideForInsert, insertSlidesAfter } from '@/lib/office/keynotes/reuse';

describe('reuse', () => {
  it('clones a slide with fresh ids for the slide and its objects', () => {
    const deck = newDeck();
    const slide = newSlide('title', deck.theme);
    const clone = cloneSlideForInsert(slide);
    expect(clone.id).not.toBe(slide.id);
    expect(clone.objects).toHaveLength(slide.objects.length);
    const ids = new Set(clone.objects.map((o) => o.id));
    expect(ids.size).toBe(clone.objects.length);
    slide.objects.forEach((o, i) => expect(clone.objects[i].id).not.toBe(o.id));
  });

  it('repoints group references to the cloned group ids', () => {
    const deck = newDeck();
    const slide = newSlide('blank', deck.theme);
    slide.objects = [
      { ...slide.objects[0], id: 'obj-1', group: 'grp' },
      { ...slide.objects[0], id: 'obj-2', group: 'grp' },
    ];
    const clone = cloneSlideForInsert(slide);
    const groups = clone.objects.map((o) => o.group);
    expect(groups[0]).toBe(groups[1]);
    expect(groups[0]).not.toBe('grp');
  });

  it('appends slides and bumps the deck version', () => {
    const deck = newDeck({ slides: [newSlide('title', newDeck().theme)] });
    const inserted = appendSlides(deck, [newSlide('blank', deck.theme)]);
    expect(inserted.slides).toHaveLength(2);
    expect(inserted.version).toBe(deck.version + 1);
  });

  it('inserts slides after a given slide id', () => {
    const deck = newDeck({
      slides: [newSlide('title', newDeck().theme), newSlide('blank', newDeck().theme)],
    });
    const inserted = insertSlidesAfter(deck, deck.slides[0].id, [newSlide('cover', deck.theme)]);
    expect(inserted.slides).toHaveLength(3);
    expect(inserted.slides[1].layout).toBe('cover');
  });

  it('appends when the anchor slide does not exist', () => {
    const deck = newDeck({ slides: [newSlide('title', newDeck().theme)] });
    const inserted = insertSlidesAfter(deck, 'missing', [newSlide('blank', deck.theme)]);
    expect(inserted.slides).toHaveLength(2);
  });
});
