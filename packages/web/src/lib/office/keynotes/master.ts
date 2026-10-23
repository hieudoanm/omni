import type { Slide, SlideMaster, TextObject, TextStyle } from '@/types/keynotes/deck';
import { newTextObject } from '@/lib/office/keynotes/deckFactory';
import { generateId } from '@/lib/office/keynotes/id';

const PLACEHOLDER_TEXT: Record<SlideMaster['placeholders'][number]['kind'], string> = {
  title: 'Title',
  subtitle: 'Subtitle',
  content: 'Content',
  footer: 'Footer',
};

export const defaultMaster = (width: number, height: number): SlideMaster => ({
  id: generateId('mst'),
  placeholders: [
    {
      id: generateId('ph'),
      kind: 'title',
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.08),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.12),
      style: { fontSize: 48, bold: true, color: '#e5e9ff', align: 'center' },
    },
    {
      id: generateId('ph'),
      kind: 'content',
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.24),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.64),
      style: { fontSize: 24, align: 'left', lineHeight: 1.5 },
    },
    {
      id: generateId('ph'),
      kind: 'footer',
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.92),
      w: Math.round(width * 0.84),
      h: Math.round(height * 0.05),
      style: { fontSize: 14, color: '#8a93c0', align: 'center' },
    },
  ],
});

export const applyMasterToSlide = (master: SlideMaster, slide: Slide): Slide => {
  const objects = [...slide.objects];
  for (const ph of master.placeholders) {
    const name = `placeholder:${ph.id}`;
    const index = objects.findIndex((o) => o.name === name);
    const existing = index >= 0 ? (objects[index] as TextObject) : null;
    const style = ph.style ?? {};
    if (existing) {
      objects[index] = {
        ...existing,
        x: ph.x,
        y: ph.y,
        w: ph.w,
        h: ph.h,
        style: { ...existing.style, ...style },
      };
    } else {
      objects.push(
        newTextObject({
          name,
          x: ph.x,
          y: ph.y,
          w: ph.w,
          h: ph.h,
          text: PLACEHOLDER_TEXT[ph.kind],
          style: style as TextStyle,
        }),
      );
    }
  }
  return { ...slide, objects };
};
