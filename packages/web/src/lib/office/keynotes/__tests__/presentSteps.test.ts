import { presentSteps, visibleObjectIds } from '@/lib/office/keynotes/presentSteps';
import type { ObjectAnimation, SlideObject } from '@/types/keynotes/deck';

const anim = (trigger: ObjectAnimation['trigger']): ObjectAnimation => ({
  type: 'entrance',
  effect: 'fade',
  duration: 500,
  delay: 0,
  trigger,
  easing: 'ease-out',
  repeat: 1,
});

const shape = (id: string, z: number, animation?: ObjectAnimation): SlideObject => ({
  id,
  kind: 'shape',
  x: 0,
  y: 0,
  w: 10,
  h: 10,
  z,
  rotation: 0,
  opacity: 1,
  hidden: false,
  locked: false,
  flipH: false,
  flipV: false,
  name: id,
  shapeType: 'rect',
  fill: { type: 'solid', color: '#fff', opacity: 1 },
  stroke: { color: 'transparent', width: 0, dash: 'solid' },
  cornerRadius: 0,
  shadow: { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0 },
  text: '',
  animation,
});

describe('presentSteps', () => {
  it('creates one step per click-triggered animation', () => {
    const steps = presentSteps([shape('a', 0, anim('click')), shape('b', 1, anim('click'))]);
    expect(steps).toEqual([{ objectIds: ['a'] }, { objectIds: ['b'] }]);
  });

  it('groups with-previous animations into the preceding step', () => {
    const steps = presentSteps([
      shape('a', 0, anim('click')),
      shape('b', 1, anim('with')),
      shape('c', 2, anim('after')),
    ]);
    expect(steps).toEqual([{ objectIds: ['a', 'b'] }, { objectIds: ['c'] }]);
  });

  it('ignores objects without animations', () => {
    const steps = presentSteps([shape('a', 0), shape('b', 1, anim('click'))]);
    expect(steps).toHaveLength(1);
  });

  it('excludes hover-triggered animations from steps', () => {
    const steps = presentSteps([shape('a', 0, anim('hover')), shape('b', 1, anim('click'))]);
    expect(steps).toEqual([{ objectIds: ['b'] }]);
  });
});

describe('visibleObjectIds', () => {
  it('shows non-animated objects and steps up to the current one', () => {
    const objects = [shape('base', 0), shape('a', 1, anim('click')), shape('b', 2, anim('click'))];
    const steps = presentSteps(objects);
    expect(visibleObjectIds(objects, steps, 0).has('base')).toBe(true);
    expect(visibleObjectIds(objects, steps, 0).has('a')).toBe(true);
    expect(visibleObjectIds(objects, steps, 0).has('b')).toBe(false);
    expect(visibleObjectIds(objects, steps, 1).has('b')).toBe(true);
  });

  it('keeps hover-triggered objects always visible', () => {
    const objects = [shape('a', 0, anim('hover')), shape('b', 1, anim('click'))];
    const steps = presentSteps(objects);
    expect(visibleObjectIds(objects, steps, 0).has('a')).toBe(true);
  });
});
