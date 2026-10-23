import { newDeck, newSlide } from '@/lib/office/keynotes/deckFactory';
import { applyMasterToSlide, defaultMaster } from '@/lib/office/keynotes/master';

describe('master', () => {
  const deck = newDeck({ width: 1000, height: 500 });

  it('builds a default master with title, content and footer placeholders', () => {
    const master = defaultMaster(1000, 500);
    expect(master.placeholders.map((p) => p.kind)).toEqual(['title', 'content', 'footer']);
    expect(master.placeholders[0].x).toBe(80);
    expect(master.placeholders[0].w).toBe(840);
  });

  it('adds text objects for each placeholder when applied to a slide', () => {
    const master = defaultMaster(1000, 500);
    const slide = newSlide('blank', deck.theme);
    const result = applyMasterToSlide(master, slide);
    expect(result.objects.length).toBe(3);
    expect(result.objects.map((o) => o.kind)).toEqual(['text', 'text', 'text']);
  });

  it('names placeholder objects so they can be updated on reapply', () => {
    const master = defaultMaster(1000, 500);
    const slide = newSlide('blank', deck.theme);
    const applied = applyMasterToSlide(master, slide);
    expect(applied.objects[0].name).toBe(`placeholder:${master.placeholders[0].id}`);
  });

  it('updates existing placeholder objects instead of duplicating them', () => {
    const master = defaultMaster(1000, 500);
    const slide = applyMasterToSlide(master, newSlide('blank', deck.theme));
    const moved = {
      ...master,
      placeholders: [{ ...master.placeholders[0], x: 999 }],
    };
    const reapplied = applyMasterToSlide(moved, slide);
    expect(reapplied.objects.length).toBe(3);
    expect(
      reapplied.objects.find((o) => o.name === `placeholder:${moved.placeholders[0].id}`)?.x,
    ).toBe(999);
  });

  it('applies placeholder style overrides to existing objects', () => {
    const master = defaultMaster(1000, 500);
    const slide = applyMasterToSlide(master, newSlide('blank', deck.theme));
    const restyled = {
      ...master,
      placeholders: [
        { ...master.placeholders[0], style: { fontSize: 90, bold: true } },
        master.placeholders[1],
        master.placeholders[2],
      ],
    };
    const reapplied = applyMasterToSlide(restyled, slide);
    const obj = reapplied.objects[0] as {
      style: { fontSize?: number; bold?: boolean };
    };
    expect(obj.style.fontSize).toBe(90);
    expect(obj.style.bold).toBe(true);
  });
});
