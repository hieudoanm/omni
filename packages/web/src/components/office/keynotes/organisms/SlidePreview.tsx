'use client';

import { type FC } from 'react';
import type { Deck, Slide, SlideObject } from '@/types/keynotes/deck';
import { ObjectRenderer } from '@/components/office/keynotes/organisms/ObjectRenderer';
import { slideBackgroundCss } from '@/lib/office/keynotes/slideBg';

export const SlidePreview: FC<{
  deck: Deck;
  slide: Slide;
  width: number;
  slideNumber?: number;
  className?: string;
}> = ({ deck, slide, width, slideNumber, className }) => {
  const scale = width / deck.width;
  const height = deck.height * scale;
  const ordered = [...slide.objects].sort((a, b) => a.z - b.z);
  const footer = deck.footer;

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ width, height, borderRadius: 4 }}>
      <div
        style={{
          width: deck.width,
          height: deck.height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'relative',
          overflow: 'hidden',
        }}>
        <div
          className='absolute inset-0'
          style={slideBackgroundCss(slide.background, deck.theme.colors.background)}
        />
        {ordered.map((o) => (
          <div
            key={o.id}
            className='absolute'
            style={{
              left: o.x,
              top: o.y,
              width: o.w,
              height: o.h,
              zIndex: o.z,
            }}>
            <ObjectRenderer
              obj={o}
              parentGroup={
                o.group
                  ? (slide.objects.find((g) => g.id === o.group && g.kind === 'group') as
                      Extract<SlideObject, { kind: 'group' }> | undefined)
                  : undefined
              }
            />
          </div>
        ))}
        {(footer.showNumbers || footer.text || footer.showDate || footer.logo) && (
          <div
            className='flex items-end justify-between px-6 pb-3'
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              color: deck.theme.colors.muted,
            }}>
            <div className='flex items-end gap-2'>
              {footer.logo && (
                <img src={footer.logo} alt='' className='h-7 w-auto max-w-[140px] object-contain' />
              )}
              <span className='text-[11px]'>
                {footer.showDate ? new Date().toLocaleDateString() : footer.text}
              </span>
            </div>
            {footer.showNumbers && <span className='text-[11px]'>{slideNumber ?? ''}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
