import {
  deleteSection,
  moveSection,
  newSection,
  renameSection,
  sectionAddSlide,
  sectionRemoveSlide,
  sectionedSlideIds,
} from '@/lib/office/keynotes/sections';

describe('sections', () => {
  it('creates a section with a unique id and empty slides', () => {
    const section = newSection('Intro');
    expect(section.title).toBe('Intro');
    expect(section.slideIds).toEqual([]);
    expect(section.id).toBeTruthy();
  });

  it('renames a section', () => {
    const section = newSection('Intro');
    const result = renameSection([section], section.id, 'Opening');
    expect(result[0].title).toBe('Opening');
  });

  it('deletes a section', () => {
    const a = newSection('A');
    const b = newSection('B');
    expect(deleteSection([a, b], a.id)).toEqual([b]);
  });

  it('moves a section up and down', () => {
    const a = newSection('A');
    const b = newSection('B');
    const c = newSection('C');
    expect(moveSection([a, b, c], c.id, -1).map((s) => s.title)).toEqual(['A', 'C', 'B']);
    expect(moveSection([a, b, c], a.id, 1).map((s) => s.title)).toEqual(['B', 'A', 'C']);
    expect(moveSection([a, b, c], a.id, -1)).toEqual([a, b, c]);
    expect(moveSection([a, b, c], c.id, 1)).toEqual([a, b, c]);
  });

  it('adds a slide to a section without duplicates', () => {
    const section = newSection('A');
    const once = sectionAddSlide([section], section.id, 's1');
    const twice = sectionAddSlide(once, section.id, 's1');
    expect(twice[0].slideIds).toEqual(['s1']);
  });

  it('removes a slide from a section', () => {
    const section = newSection('A');
    const withSlide = sectionAddSlide([section], section.id, 's1');
    const result = sectionRemoveSlide(withSlide, section.id, 's1');
    expect(result[0].slideIds).toEqual([]);
  });

  it('collects all sectioned slide ids', () => {
    const a = newSection('A');
    const b = newSection('B');
    const withSlides = sectionAddSlide(sectionAddSlide([a, b], a.id, 's1'), b.id, 's2');
    expect(sectionedSlideIds(withSlides)).toEqual(new Set(['s1', 's2']));
  });
});
