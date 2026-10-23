'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import type { Deck, Slide } from '@/types/keynotes/deck';
import { ObjectRenderer } from '@/components/office/keynotes/organisms/ObjectRenderer';
import { animationClass, effectiveDelay, motionPathCss } from '@/lib/office/keynotes/animations';
import { slideBackgroundCss } from '@/lib/office/keynotes/slideBg';
import { presentSteps, visibleObjectIds } from '@/lib/office/keynotes/presentSteps';

export const PresentSlide: FC<{
  deck: Deck;
  slide: Slide;
  step: number;
  slideNumber?: number;
  className?: string;
  onSlideLink?: (slideId: string) => void;
  morphFrom?: Slide | null;
}> = ({ deck, slide, step, slideNumber, className, onSlideLink, morphFrom }) => {
  const steps = presentSteps(slide.objects);
  const visible = visibleObjectIds(slide.objects, steps, step);
  const ordered = [...slide.objects].sort((a, b) => a.z - b.z);
  const footer = deck.footer;
  const bg = slide.background ?? {
    type: 'solid',
    color: deck.theme.colors.background,
    opacity: 1,
  };

  const [hovered, setHovered] = useState<Set<string>>(new Set());
  const objRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (!morphFrom) return;
    const duration = slide.transition?.duration ?? 700;
    slide.objects.forEach((o) => {
      const prev =
        morphFrom.objects.find((p) => p.name && p.name === o.name) ??
        morphFrom.objects.find((p) => p.id === o.id);
      if (!prev) return;
      const el = objRefs.current.get(o.id);
      if (!el || typeof el.animate !== 'function') return;
      const dx = prev.x - o.x;
      const dy = prev.y - o.y;
      const sx = prev.w / (o.w || 1);
      const sy = prev.h / (o.h || 1);
      el.animate(
        [
          {
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
            opacity: 0.4,
          },
          { transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1 },
        ],
        { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
      );
    });
  }, [morphFrom, slide]);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        width: deck.width,
        height: deck.height,
        ...slideBackgroundCss(bg, deck.theme.colors.background),
      }}>
      {ordered.map((o) => {
        if (o.kind === 'group') return null;
        const anim = o.animation;
        const isHover = anim?.trigger === 'hover';
        const stepped = !isHover;
        const shown = stepped ? visible.has(o.id) : true;
        const hoverActive = isHover && hovered.has(o.id);
        const animating = anim && shown && (!isHover || hoverActive);
        const hidden = anim && !shown;
        const animCls = animating ? ` ${animationClass(anim)}` : '';
        const delay = anim ? effectiveDelay(slide.objects, o.id) : 0;
        const animStyle = animating
          ? {
              animationDuration: `${anim.duration}ms`,
              animationDelay: `${delay}ms`,
              animationDirection: anim.reverse ? ('reverse' as const) : undefined,
            }
          : undefined;
        const mp = anim?.motionPath;
        const body = (
          <ObjectRenderer
            obj={o}
            parentGroup={
              o.group
                ? (slide.objects.find((g) => g.id === o.group && g.kind === 'group') as
                    Extract<typeof o, { kind: 'group' }> | undefined)
                : undefined
            }
            className={hidden ? 'pointer-events-none' : undefined}
            style={{ ...animStyle, ...(hidden ? { opacity: 0 } : {}) }}
            animClass={animCls}
            interactive
            onSlideLink={onSlideLink}
          />
        );
        const inner =
          mp && mp.type !== 'none' && animating ? (
            <div
              className='absolute inset-0'
              style={{
                offsetPath: motionPathCss(mp),
                animation: `kn-motion ${anim.duration}ms ${anim.easing} ${delay}ms both`,
              }}>
              {body}
            </div>
          ) : (
            body
          );
        return (
          <div
            key={o.id}
            ref={(el) => {
              if (el) objRefs.current.set(o.id, el);
              else objRefs.current.delete(o.id);
            }}
            className='absolute'
            style={{
              left: o.x,
              top: o.y,
              width: o.w,
              height: o.h,
              zIndex: o.z,
            }}
            onMouseEnter={isHover ? () => setHovered((s) => new Set(s).add(o.id)) : undefined}
            onMouseLeave={
              isHover
                ? () => setHovered((s) => new Set([...s].filter((x) => x !== o.id)))
                : undefined
            }>
            {inner}
          </div>
        );
      })}
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
  );
};
