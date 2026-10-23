'use client';

import { type CSSProperties, type FC, memo } from 'react';
import type { SlideObject } from '@/types/keynotes/deck';
import { ObjectContent } from '@/components/office/keynotes/organisms/ObjectContent';

export const ObjectRenderer: FC<{
  obj: SlideObject;
  parentGroup?: Extract<SlideObject, { kind: 'group' }>;
  editing?: boolean;
  className?: string;
  style?: CSSProperties;
  animClass?: string;
  interactive?: boolean;
  onSlideLink?: (slideId: string) => void;
}> = memo(
  ({
    obj,
    parentGroup,
    editing,
    className,
    style: styleOverride,
    animClass,
    interactive,
    onSlideLink,
  }) => {
    if (obj.hidden) return null;

    let transform: string | undefined;
    let transformOrigin: string | undefined;

    if (parentGroup && parentGroup.rotation) {
      transform = `rotate(${parentGroup.rotation}deg)`;
      transformOrigin = `${parentGroup.x + parentGroup.w / 2 - obj.x}px ${
        parentGroup.y + parentGroup.h / 2 - obj.y
      }px`;
    } else if (obj.rotation) {
      transform = `rotate(${obj.rotation}deg)`;
      transformOrigin = '50% 50%';
    }
    if (obj.flipH || obj.flipV) {
      transform =
        `${transform ?? ''} scaleX(${obj.flipH ? -1 : 1}) scaleY(${obj.flipV ? -1 : 1})`.trim();
    }

    const style: CSSProperties = {
      width: '100%',
      height: '100%',
      opacity: obj.opacity,
      ...styleOverride,
    };
    if (transform) {
      style.transform = transform;
      style.transformOrigin = transformOrigin ?? '50% 50%';
    }

    if (obj.kind === 'group') return null;

    const content = <ObjectContent obj={obj} editing={editing} />;
    const cls = [className, animClass].filter(Boolean).join(' ') || undefined;

    if (interactive && obj.link) {
      if (obj.link.type === 'url' && obj.link.url) {
        return (
          <a
            href={obj.link.url}
            target='_blank'
            rel='noreferrer'
            style={{ ...style, display: 'block', cursor: 'pointer' }}
            className={cls}>
            {content}
          </a>
        );
      }
      if (obj.link.type === 'email' && obj.link.email) {
        return (
          <a
            href={`mailto:${obj.link.email}`}
            style={{ ...style, display: 'block', cursor: 'pointer' }}
            className={cls}>
            {content}
          </a>
        );
      }
      if (obj.link.type === 'slide' && obj.link.slideId) {
        return (
          <a
            href='#'
            onClick={(e) => {
              e.preventDefault();
              onSlideLink?.(obj.link?.slideId ?? '');
            }}
            style={{ ...style, display: 'block', cursor: 'pointer' }}
            className={cls}>
            {content}
          </a>
        );
      }
    }

    return (
      <div style={style} className={cls}>
        {content}
      </div>
    );
  },
);

ObjectRenderer.displayName = 'ObjectRenderer';
