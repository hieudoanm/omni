import {
  ANIMATION_EFFECTS,
  EASINGS,
  MOTION_PATH_PATHS,
  MOTION_PATH_PRESETS,
  TRANSITION_EFFECTS,
  animatedObjects,
  animationClass,
  defaultAnimation,
  effectiveDelay,
  motionPathCss,
  motionPathLabel,
  transitionClass,
  transitionTiming,
} from '@/lib/office/keynotes/animations';
import type { ObjectAnimation } from '@/types/keynotes/deck';

describe('animationClass', () => {
  it('builds the css class for an animation', () => {
    const a: ObjectAnimation = {
      type: 'entrance',
      effect: 'fade-up',
      duration: 600,
      delay: 0,
      trigger: 'click',
      easing: 'ease-out',
      repeat: 1,
    };
    expect(animationClass(a)).toBe('anim-entrance-fade-up');
  });
});

describe('transitionClass', () => {
  it('builds the css class for a transition', () => {
    expect(transitionClass('fade')).toBe('trans-fade');
    expect(transitionClass('none')).toBe('trans-none');
  });
});

describe('defaultAnimation', () => {
  it('returns sensible defaults per type', () => {
    expect(defaultAnimation('entrance').effect).toBe('fade-up');
    expect(defaultAnimation('emphasis').effect).toBe('pulse');
    expect(defaultAnimation('exit').effect).toBe('fade');
  });
});

describe('effect catalogues', () => {
  it('entrance, emphasis and exit effect sets are populated', () => {
    expect(ANIMATION_EFFECTS.entrance).toContain('fade');
    expect(ANIMATION_EFFECTS.emphasis).toContain('pulse');
    expect(ANIMATION_EFFECTS.exit).toContain('zoom-out');
  });

  it('emphasis includes wobble and color-change', () => {
    expect(ANIMATION_EFFECTS.emphasis).toEqual(expect.arrayContaining(['wobble', 'color-change']));
  });

  it('easings and transitions are non-empty', () => {
    expect(EASINGS.length).toBeGreaterThan(0);
    expect(TRANSITION_EFFECTS.map((t) => t.id)).toContain('push');
  });
});

describe('animatedObjects', () => {
  const withAnim = (id: string, animation?: ObjectAnimation | null) => ({
    id,
    animation,
  });

  it('reveals animated objects up to the given step', () => {
    const objects = [
      withAnim('a', defaultAnimation('entrance')),
      withAnim('b', defaultAnimation('entrance')),
    ];
    expect(animatedObjects(objects, 0).has('a')).toBe(true);
    expect(animatedObjects(objects, 0).has('b')).toBe(false);
    expect(animatedObjects(objects, 1).has('b')).toBe(true);
  });

  it('reveals nothing when step is below zero', () => {
    const objects = [withAnim('a', defaultAnimation('entrance'))];
    expect(animatedObjects(objects, -1).has('a')).toBe(false);
  });
});

describe('motionPathCss / motionPathLabel', () => {
  it('returns undefined for none', () => {
    expect(motionPathCss({ type: 'none' })).toBeUndefined();
    expect(motionPathCss(undefined)).toBeUndefined();
  });

  it('builds offset-path from preset paths', () => {
    expect(motionPathCss({ type: 'arc' })).toBe(`path('${MOTION_PATH_PATHS.arc}')`);
    expect(MOTION_PATH_PRESETS.map((p) => p.id)).toContain('loop');
  });

  it('uses the raw path for custom paths', () => {
    expect(motionPathCss({ type: 'custom', path: 'M 0 0 L 10 10' })).toBe("path('M 0 0 L 10 10')");
  });

  it('labels motion path types', () => {
    expect(motionPathLabel({ type: 'none' })).toBe('none');
    expect(motionPathLabel({ type: 'loop' })).toBe('loop');
    expect(motionPathLabel({ type: 'custom', path: 'M 0 0' })).toBe('custom');
  });
});

describe('effectiveDelay', () => {
  const obj = (id: string, z: number, animation: ObjectAnimation | null) => ({
    id,
    z,
    animation,
  });

  it('applies stagger per position among animated objects', () => {
    const objects = [
      obj('a', 0, {
        ...defaultAnimation('entrance'),
        delay: 100,
        stagger: 200,
      }),
      obj('b', 1, {
        ...defaultAnimation('entrance'),
        delay: 100,
        stagger: 200,
      }),
      obj('c', 2, null),
    ];
    expect(effectiveDelay(objects, 'a')).toBe(100);
    expect(effectiveDelay(objects, 'b')).toBe(300);
  });

  it('orders by z, not array position', () => {
    const objects = [
      obj('top', 10, {
        ...defaultAnimation('entrance'),
        delay: 0,
        stagger: 100,
      }),
      obj('bottom', 1, {
        ...defaultAnimation('entrance'),
        delay: 0,
        stagger: 100,
      }),
    ];
    expect(effectiveDelay(objects, 'top')).toBe(100);
    expect(effectiveDelay(objects, 'bottom')).toBe(0);
  });
});

describe('transitionTiming', () => {
  it('returns empty timing for zero bounciness', () => {
    expect(transitionTiming()).toBe('');
    expect(transitionTiming(0)).toBe('');
  });

  it('returns a bounce easing for positive bounciness', () => {
    expect(transitionTiming(50)).toContain('cubic-bezier');
  });
});
