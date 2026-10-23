'use client';

import { FC, useState, useCallback, useRef } from 'react';

export const ScreenRecorder: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleStart = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: true,
      });
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: 'video/webm',
        });
        setBlob(recordedBlob);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      setBlob(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleStop = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const handleDownload = useCallback(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording_${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col items-center gap-4'>
        <p className='text-sm'>
          Record your screen with audio. Choose a window or entire screen to share.
        </p>
        {!recording ? (
          <button className='btn btn-primary' onClick={handleStart}>
            <span className='text-lg'>●</span> Start Recording
          </button>
        ) : (
          <button className='btn btn-error' onClick={handleStop}>
            <span className='text-lg'>■</span> Stop Recording
          </button>
        )}
        {recording && <span className='loading loading-spinner text-base-content/60' />}
        {blob && (
          <div className='flex w-full flex-col gap-2'>
            <p className='text-sm'>Recording saved ({Math.round(blob.size / 1024)} KB)</p>
            <video src={URL.createObjectURL(blob)} controls className='max-h-64 w-full rounded' />
            <button className='btn btn-primary btn-sm' onClick={handleDownload}>
              Download WebM
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
ScreenRecorder.displayName = 'ScreenRecorder';
