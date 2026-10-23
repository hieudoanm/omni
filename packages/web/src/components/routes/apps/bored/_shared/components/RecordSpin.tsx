'use client';

import { useCallback, useEffect, useMemo, type FC, type RefObject } from 'react';
import { PiDownloadSimple, PiShareNetwork, PiVideoCamera, PiX } from 'react-icons/pi';
import { useReelRecorder } from '../hooks/useReelRecorder';

interface RecordSpinProps {
  captureRef: RefObject<HTMLDivElement | null>;
  spin: () => void;
  spinning: boolean;
}

export const RecordSpin: FC<RecordSpinProps> = ({ captureRef, spin, spinning }) => {
  const { recording, blob, unsupported, startRecording, stopRecording, clearRecording } =
    useReelRecorder({ captureRef, spin, spinning });

  const videoUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );

  const handleDownload = useCallback(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `spin-recording-${Date.now()}.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [blob]);

  const handleShare = useCallback(async () => {
    if (!blob) return;
    const file = new File([blob], 'spin-recording.mp4', { type: blob.type });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Spin recording' });
    } else {
      handleDownload();
    }
  }, [blob, handleDownload]);

  if (unsupported) {
    return (
      <p className='text-base-content/50 text-xs'>
        Video recording is not supported in this browser — use the screen recorder or your device's
        recorder instead.
      </p>
    );
  }

  return (
    <div className='flex flex-col items-center'>
      {recording ? (
        <div className='flex items-center gap-3'>
          <span className='relative flex h-3 w-3'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75' />
            <span className='relative inline-flex h-3 w-3 rounded-full bg-red-600' />
          </span>
          <span className='text-sm'>Recording…</span>
          <button onClick={stopRecording} className='btn btn-error btn-sm'>
            Stop
          </button>
        </div>
      ) : (
        <button
          onClick={() => void startRecording()}
          className='btn btn-outline btn-sm'
          title='Record this spin as a video'>
          <PiVideoCamera className='h-4 w-4' /> Record spin
        </button>
      )}

      {blob && (
        <div className='bg-base-100/10 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm'>
          <div className='rounded-box border-base-300 bg-base-200 relative w-full max-w-lg border shadow-2xl'>
            <div className='border-base-300 flex items-center justify-between border-b px-6 py-4'>
              <h2 className='text-base-content m-0 text-lg font-semibold'>Spin recording</h2>
              <button
                onClick={clearRecording}
                aria-label='Close'
                className='btn btn-ghost btn-sm btn-square text-base-content/60 hover:text-base-content'>
                <PiX className='h-5 w-5' />
              </button>
            </div>
            <div className='flex flex-col items-center gap-3 p-6'>
              <video
                src={videoUrl ?? ''}
                controls
                playsInline
                className='max-h-[60vh] w-full rounded'
              />
              <div className='flex flex-wrap justify-center gap-2'>
                <button onClick={handleDownload} className='btn btn-primary btn-sm'>
                  <PiDownloadSimple className='h-4 w-4' /> Download
                </button>
                <button onClick={() => void handleShare()} className='btn btn-outline btn-sm'>
                  <PiShareNetwork className='h-4 w-4' /> Share
                </button>
                <button onClick={clearRecording} className='btn btn-ghost btn-sm'>
                  Record again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

RecordSpin.displayName = 'RecordSpin';
