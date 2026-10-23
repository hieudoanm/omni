import type { SlideObject } from '@/types/keynotes/deck';

export interface PresentStep {
  objectIds: string[];
}

export const presentSteps = (objects: SlideObject[]): PresentStep[] => {
  const ordered = [...objects].sort((a, b) => a.z - b.z);
  const steps: PresentStep[] = [];
  ordered.forEach((o) => {
    if (!o.animation) return;
    if (o.animation.trigger === 'hover') return;
    if (o.animation.trigger === 'with' && steps.length > 0) {
      steps[steps.length - 1].objectIds.push(o.id);
    } else {
      steps.push({ objectIds: [o.id] });
    }
  });
  return steps;
};

export const visibleObjectIds = (
  objects: SlideObject[],
  steps: PresentStep[],
  step: number,
): Set<string> => {
  const visible = new Set<string>();
  objects.forEach((o) => {
    if (!o.animation || o.animation.trigger === 'hover') visible.add(o.id);
  });
  steps.slice(0, step + 1).forEach((s) => s.objectIds.forEach((id) => visible.add(id)));
  return visible;
};
