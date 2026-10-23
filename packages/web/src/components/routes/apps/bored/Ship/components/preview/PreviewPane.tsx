import type { FC, RefObject } from 'react';

import { FONTS } from '../toolbar/FontSelect';
import type { FontName } from '../toolbar/FontSelect';

import { ShipBadge } from './ShipBadge';
import { NavButton } from './NavButton';
import { PostDots } from './PostDots';
import { PreviewHeader } from './PreviewHeader';

const CANVAS_SIZE = 512;

const ASPECT_RATIO: Record<string, number> = {
  '1:1': 1,
  '4:5': 5 / 4,
  '9:16': 16 / 9,
  '2:3': 3 / 2,
  '3:4': 4 / 3,
  '16:9': 9 / 16,
  '4:3': 3 / 4,
  '3:2': 2 / 3,
  A4: 99 / 140,
  Letter: 8.5 / 11,
};

export const PreviewPane: FC<{
  captureRef: RefObject<HTMLDivElement | null>;
  onDownload: () => void;
  onDownloadAll: () => void;
  onCopy: () => void;
  ratio: string;
  fontName: FontName;
  totalPosts: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelectPost: (index: number) => void;
  username?: string;
  children: React.ReactNode;
}> = ({
  captureRef,
  onDownload,
  onDownloadAll,
  onCopy,
  ratio,
  fontName,
  totalPosts,
  activeIndex,
  onPrev,
  onNext,
  onSelectPost,
  username,
  children,
}) => {
  const multi = totalPosts > 1;
  const aspectMultiplier = ASPECT_RATIO[ratio] ?? 1;
  const canvasHeight = CANVAS_SIZE * aspectMultiplier;
  const fontClassName = FONTS[fontName]?.className ?? '';

  return (
    <div className='flex-1'>
      <PreviewHeader
        totalPosts={totalPosts}
        activeIndex={activeIndex}
        onCopy={onCopy}
        onDownload={onDownload}
        onDownloadAll={onDownloadAll}
      />

      <div className='relative mx-auto' style={{ width: CANVAS_SIZE }}>
        {multi && <NavButton direction='prev' disabled={activeIndex === 0} onClick={onPrev} />}

        <div
          ref={captureRef}
          style={{
            width: CANVAS_SIZE,
            height: canvasHeight,
          }}
          className={`border-base-300 mx-auto overflow-hidden border shadow-2xl ${fontClassName}`}>
          <div className='relative size-full'>
            {children}
            {username && <ShipBadge username={username} />}
            {multi && (
              <span className='absolute top-4 right-4 rounded-lg bg-black/30 px-3 py-1.5 font-mono text-xs leading-none text-white'>
                {activeIndex + 1} / {totalPosts}
              </span>
            )}
          </div>
        </div>

        {multi && (
          <NavButton direction='next' disabled={activeIndex === totalPosts - 1} onClick={onNext} />
        )}
      </div>

      {multi && <PostDots total={totalPosts} activeIndex={activeIndex} onSelect={onSelectPost} />}
    </div>
  );
};

PreviewPane.displayName = 'PreviewPane';
