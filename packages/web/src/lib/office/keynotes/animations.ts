import type {
  AnimationEffect,
  AnimationEffectType,
  MotionPath,
  ObjectAnimation,
  TransitionEffect,
} from '@/types/keynotes/deck';

export const ANIMATION_EFFECTS: Record<AnimationEffectType, AnimationEffect[]> = {
  entrance: [
    'fade',
    'fade-up',
    'fade-down',
    'fade-left',
    'fade-right',
    'zoom',
    'zoom-in',
    'fly-up',
    'fly-down',
    'fly-left',
    'fly-right',
    'wipe-up',
    'wipe-down',
    'wipe-left',
    'wipe-right',
    'bounce',
    'slide-up',
    'slide-down',
    'slide-left',
    'slide-right',
    'flip',
  ],
  emphasis: ['pulse', 'spin', 'shake', 'blink', 'bounce', 'grow', 'wobble', 'color-change'],
  exit: [
    'fade',
    'zoom-out',
    'fade-up',
    'fade-down',
    'fade-left',
    'fade-right',
    'slide-up',
    'slide-down',
    'slide-left',
    'slide-right',
  ],
};

export const EASINGS = [
  { id: 'ease', label: 'Ease' },
  { id: 'ease-in', label: 'Ease in' },
  { id: 'ease-out', label: 'Ease out' },
  { id: 'ease-in-out', label: 'Ease in-out' },
  { id: 'linear', label: 'Linear' },
];

export const TRANSITION_EFFECTS: Array<{
  id: TransitionEffect;
  label: string;
}> = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'push', label: 'Push' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'cover', label: 'Cover' },
  { id: 'reveal', label: 'Reveal' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'split', label: 'Split' },
  { id: 'flip', label: 'Flip' },
  { id: 'cube', label: 'Cube' },
  { id: 'doors', label: 'Doors' },
  { id: 'morph', label: 'Morph' },
];

export const MOTION_PATH_PRESETS: Array<{
  id: 'arc' | 'loop' | 'star';
  label: string;
}> = [
  { id: 'arc', label: 'Arc' },
  { id: 'loop', label: 'Loop' },
  { id: 'star', label: 'Star' },
];

export const MOTION_PATH_PATHS: Record<'arc' | 'loop' | 'star', string> = {
  arc: 'M 0 0 Q 100 150 200 0',
  loop: 'M 0 0 C 0 150, 200 150, 200 0 C 200 -120, 0 -120, 0 0',
  star: 'M 0 0 L 120 60 L 60 120 L 40 40 Z',
};

export const animationClass = (a: ObjectAnimation): string => `anim-${a.type}-${a.effect}`;

export const transitionClass = (effect: TransitionEffect): string => `trans-${effect}`;

export const defaultAnimation = (type: AnimationEffectType): ObjectAnimation => ({
  type,
  effect: type === 'entrance' ? 'fade-up' : type === 'emphasis' ? 'pulse' : 'fade',
  duration: 600,
  delay: 0,
  trigger: 'click',
  easing: 'ease-out',
  repeat: 1,
});

export const motionPathCss = (mp: MotionPath | undefined): string | undefined => {
  if (!mp || mp.type === 'none') return undefined;
  const p = mp.type === 'custom' ? mp.path : MOTION_PATH_PATHS[mp.type];
  return p ? `path('${p}')` : undefined;
};

export const motionPathLabel = (mp: MotionPath | undefined): string =>
  !mp || mp.type === 'none' ? 'none' : mp.type === 'custom' ? 'custom' : mp.type;

export const effectiveDelay = (
  objects: Array<{ id: string; z: number; animation?: ObjectAnimation | null }>,
  id: string,
): number => {
  const animated = objects.filter((o) => o.animation).sort((a, b) => a.z - b.z);
  const idx = animated.findIndex((o) => o.id === id);
  if (idx < 0) return 0;
  const anim = animated[idx].animation as ObjectAnimation;
  return (anim.delay ?? 0) + (anim.stagger ?? 0) * idx;
};

export const transitionTiming = (bounciness?: number): string =>
  bounciness && bounciness > 0
    ? `cubic-bezier(0.68, -0.55, 0.265, ${Math.min(1.55, 1 + bounciness / 100)})`
    : '';

export const animatedObjects = (
  objects: Array<{ id: string; animation?: ObjectAnimation | null }>,
  step: number,
): Set<string> => {
  const withAnim = objects.filter((o) => o.animation);
  const visible = new Set<string>();
  withAnim.forEach((o, i) => {
    if (i <= step) visible.add(o.id);
  });
  return visible;
};
