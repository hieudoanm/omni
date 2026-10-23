export interface SnapshotChunk {
  dataUrl: string;
  y: number;
}

const dataUrlToBitmap = async (dataUrl: string): Promise<ImageBitmap> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return createImageBitmap(blob);
};

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Snapshot: failed to read blob'));
    reader.readAsDataURL(blob);
  });

export const stitchChunks = async (
  chunks: ReadonlyArray<SnapshotChunk>,
  widthPx: number,
  heightPx: number
): Promise<string> => {
  const canvas = new OffscreenCanvas(widthPx, heightPx);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Snapshot: canvas context unavailable');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, widthPx, heightPx);

  for (const chunk of chunks) {
    const bitmap = await dataUrlToBitmap(chunk.dataUrl);
    ctx.drawImage(bitmap, 0, chunk.y);
  }

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return blobToDataUrl(blob);
};
