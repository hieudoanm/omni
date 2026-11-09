import html2canvas from 'html2canvas-pro';
import type { RefObject } from 'react';

const GRADIENT_RE =
  /\bbg-gradient-to-[a-z]+\s+(?:from-[^\s]+(?:\/\d+)?\s+)?(?:via-[^\s]+(?:\/\d+)?\s+)?to-[^\s]+(?:\/\d+)?\b/g;

export const fixGradients = (root: HTMLElement) => {
  const els = root.querySelectorAll<HTMLElement>('.bg-clip-text.text-transparent');
  els.forEach((el) => {
    el.dataset.opencodeOrigClass = el.className;
    el.classList.remove('bg-clip-text', 'text-transparent');
    el.classList.add('text-white');
    el.className = el.className.replace(GRADIENT_RE, '');
  });
  return els;
};

export const restoreGradients = (els: NodeListOf<HTMLElement>) => {
  els.forEach((el) => {
    const orig = el.dataset.opencodeOrigClass;
    if (orig) {
      el.className = orig;
      delete el.dataset.opencodeOrigClass;
    }
  });
};

export const preloadBackgroundImages = async (root: HTMLElement) => {
  const elements = root.querySelectorAll<HTMLElement>('*');
  const urls: string[] = [];
  elements.forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg !== 'none') {
      const match = bg.match(/url\(["']?(.*?)["']?\)/);
      if (match?.[1]) urls.push(match[1]);
    }
  });
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
};

export const download = async ({
  ref,
  output = '',
  backgroundColor = '#ffffff',
  scale = 1,
}: {
  ref: RefObject<HTMLDivElement | null>;
  output: string;
  backgroundColor?: string;
  scale?: number;
}) => {
  if (!ref.current) return;

  await preloadBackgroundImages(ref.current);
  const fixed = fixGradients(ref.current);
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const canvas = await html2canvas(ref.current, {
    scale,
    useCORS: true,
    backgroundColor,
  });

  restoreGradients(fixed);

  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `${output}.png`;
  link.click();
  link.remove();
};
