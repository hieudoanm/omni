import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas-pro';
import { PDFDocument } from 'pdf-lib';

import { applyExportSafeColors, inlineTailwindStyles, labToHex } from './colors';
import { PitchDeck } from '../types';

export const exportPdf = async (
  data: PitchDeck,
  onProgress: (msg: string) => void,
  onError: (msg: string) => void,
  onSuccess: (msg: string) => void,
) => {
  onProgress('Generating PDF…');
  const preview = document.getElementById('pitch-preview');
  if (!preview) throw new Error('#pitch-preview not found');

  const styleSheets = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((r) => r.cssText)
          .join('\n');
      } catch {
        return '';
      }
    })
    .join('\n');

  const styleTag = document.createElement('style');
  styleTag.textContent = styleSheets;
  const exportContainer = preview.cloneNode(true) as HTMLElement;
  exportContainer.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:100%;height:100%';
  exportContainer.prepend(styleTag);
  document.body.appendChild(exportContainer);

  inlineTailwindStyles(exportContainer);

  const originalHtmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const originalBodyBg = getComputedStyle(document.body).backgroundColor;
  document.documentElement.style.backgroundColor = originalHtmlBg.includes('lab(')
    ? labToHex(originalHtmlBg)
    : originalHtmlBg;
  document.body.style.backgroundColor = originalBodyBg.includes('lab(')
    ? labToHex(originalBodyBg)
    : originalBodyBg;

  const restoreColors = applyExportSafeColors(exportContainer);
  const slideElements = Array.from(exportContainer.querySelectorAll<HTMLElement>('.aspect-video'));
  if (slideElements.length === 0) {
    restoreColors();
    document.body.removeChild(exportContainer);
    throw new Error('No slides found');
  }

  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < slideElements.length; i++) {
    const canvas = await html2canvas(slideElements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      width: 1280,
      height: 720,
      windowWidth: 1280,
      windowHeight: 720,
    });
    const pngData = canvas.toDataURL('image/png');
    const pngBytes = await fetch(pngData).then((r) => r.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(new Uint8Array(pngBytes));
    const page = i === 0 ? pdfDoc.addPage([1280, 720]) : pdfDoc.addPage([1280, 720]);
    page.drawImage(pngImage, { x: 0, y: 0, width: 1280, height: 720 });
  }

  restoreColors();
  document.body.removeChild(exportContainer);
  const pdfBytes = await pdfDoc.save();
  saveAs(
    new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }),
    `${data.title?.product ?? 'pitch-deck'}.pdf`,
  );
  onSuccess('PDF exported successfully');
};
