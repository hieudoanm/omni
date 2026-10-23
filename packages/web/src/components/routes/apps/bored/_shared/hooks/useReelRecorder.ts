'use client';

import html2canvas from 'html2canvas-pro';
import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';

interface UseReelRecorderOptions {
  captureRef: RefObject<HTMLDivElement | null>;
  spin: () => void;
  spinning: boolean;
}

const MIME_CANDIDATES = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
const MAX_RECORD_DIMENSION = 1280;
const SETTLED_FRAMES = 3;
const MAX_RECORD_MS = 15_000;

const pickMimeType = (): string =>
  MIME_CANDIDATES.find((mime) => MediaRecorder.isTypeSupported(mime)) ?? '';

const pickBackgroundColor = (node: HTMLElement): string => {
  let el: HTMLElement | null = node;
  while (el) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    el = el.parentElement;
  }
  return '#000000';
};

export const useReelRecorder = ({ captureRef, spin, spinning }: UseReelRecorderOptions) => {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spinningRef = useRef(false);

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('MediaRecorder' in window) ||
      typeof HTMLCanvasElement.prototype.captureStream !== 'function'
    ) {
      setUnsupported(true);
      return;
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (stopTimerRef.current !== null) clearTimeout(stopTimerRef.current);
      if (maxTimerRef.current !== null) clearTimeout(maxTimerRef.current);
      recorderRef.current?.stop();
    };
  }, []);

  const drawFrame = useCallback(
    async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const node = captureRef.current;
      if (!node) return;
      const scale = canvas.width / Math.max(1, node.getBoundingClientRect().width);
      const frame = await html2canvas(node, {
        scale,
        backgroundColor: pickBackgroundColor(node),
        useCORS: true,
        logging: false,
      });
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    },
    [captureRef],
  );

  const stopRecording = useCallback(() => {
    if (stopTimerRef.current !== null) clearTimeout(stopTimerRef.current);
    if (maxTimerRef.current !== null) clearTimeout(maxTimerRef.current);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }, []);

  const startRecording = useCallback(async () => {
    const node = captureRef.current;
    if (!node || recorderRef.current) return;

    setBlob(null);
    const rect = node.getBoundingClientRect();
    const rawWidth = Math.max(1, rect.width);
    const rawHeight = Math.max(1, rect.height);
    const scale = Math.min(2, MAX_RECORD_DIMENSION / rawWidth, MAX_RECORD_DIMENSION / rawHeight);
    const width = Math.max(320, Math.round(rawWidth * scale));
    const height = Math.max(240, Math.round(rawHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stream = canvas.captureStream(30);
    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/mp4';
      setBlob(new Blob(chunksRef.current, { type }));
      setRecording(false);
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
    };
    recorder.start();
    setRecording(true);
    maxTimerRef.current = setTimeout(() => stopRecording(), MAX_RECORD_MS);

    await drawFrame(canvas, ctx);
    spin();

    let sawSpin = false;
    let settledFrames = 0;
    const loop = async () => {
      if (recorder.state !== 'recording') return;
      try {
        await drawFrame(canvas, ctx);
      } catch (err) {
        console.error('Failed to capture reel frame:', err);
      }
      if (spinningRef.current) {
        sawSpin = true;
        settledFrames = 0;
      } else if (sawSpin) {
        settledFrames += 1;
        if (settledFrames >= SETTLED_FRAMES) {
          stopTimerRef.current = setTimeout(() => stopRecording(), 200);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFrame, captureRef, spin, stopRecording]);

  const clearRecording = useCallback(() => setBlob(null), []);

  return {
    recording,
    blob,
    unsupported,
    startRecording,
    stopRecording,
    clearRecording,
  };
};
