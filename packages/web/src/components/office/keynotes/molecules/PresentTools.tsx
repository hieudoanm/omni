'use client';

import { type FC } from 'react';
import { FiMic, FiMoon, FiSun, FiZoomIn } from 'react-icons/fi';
import { AnnotationToolbar } from '@/components/office/keynotes/molecules/AnnotationToolbar';
import type { AnnotationTool } from '@/lib/office/keynotes/annotations';

export const PresentTools: FC<{
  tool: AnnotationTool | 'off';
  onTool: (t: AnnotationTool | 'off') => void;
  color: string;
  onColor: (c: string) => void;
  onClear: () => void;
  blackoutOn: boolean;
  onBlackout: () => void;
  whiteoutOn: boolean;
  onWhiteout: () => void;
  spotlightOn: boolean;
  onSpotlight: () => void;
  captionsSupported: boolean;
  captionsOn: boolean;
  onCaptions: () => void;
}> = ({
  tool,
  onTool,
  color,
  onColor,
  onClear,
  blackoutOn,
  onBlackout,
  whiteoutOn,
  onWhiteout,
  spotlightOn,
  onSpotlight,
  captionsSupported,
  captionsOn,
  onCaptions,
}) => (
  <>
    <div className='absolute top-3 left-3 z-30 flex items-center gap-1 rounded-full bg-black/70 p-1.5 backdrop-blur'>
      <button
        type='button'
        title='Blackout slide (B)'
        onClick={onBlackout}
        className={`rounded-full p-2 transition ${
          blackoutOn ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/15'
        }`}>
        <FiMoon className='size-4' />
      </button>
      <button
        type='button'
        title='Whiteout slide (W)'
        onClick={onWhiteout}
        className={`rounded-full p-2 transition ${
          whiteoutOn ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/15'
        }`}>
        <FiSun className='size-4' />
      </button>
      <button
        type='button'
        title='Spotlight zoom (S)'
        onClick={onSpotlight}
        className={`rounded-full p-2 transition ${
          spotlightOn ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/15'
        }`}>
        <FiZoomIn className='size-4' />
      </button>
      <button
        type='button'
        title={
          captionsSupported ? 'Live captions' : 'Live captions (not supported in this browser)'
        }
        onClick={onCaptions}
        disabled={!captionsSupported}
        className={`rounded-full p-2 transition ${
          captionsOn ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/15'
        } disabled:cursor-not-allowed disabled:opacity-30`}>
        <FiMic className='size-4' />
      </button>
    </div>
    <div className='absolute top-3 right-3 z-30'>
      <AnnotationToolbar
        tool={tool}
        onTool={onTool}
        color={color}
        onColor={onColor}
        onClear={onClear}
      />
    </div>
  </>
);
