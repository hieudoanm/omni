export interface FileEntry {
  file: File;
  name: string;
}

export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const createZipBlob = async (entries: FileEntry[]): Promise<Blob> => {
  const localHeaders: Uint8Array[] = [];
  const centralEntries: Uint8Array[] = [];
  let offset = 0;

  for (const { file, name } of entries) {
    const data = new Uint8Array(await file.arrayBuffer());
    const nameBytes = new TextEncoder().encode(name);
    const crc = crc32(data);
    const compSize = data.length;
    const uncompSize = data.length;

    // Local file header
    const lh = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(lh);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, 0, true);
    lv.setUint16(12, 0, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, compSize, true);
    lv.setUint32(22, uncompSize, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    const lhBytes = new Uint8Array(lh);
    lhBytes.set(nameBytes, 30);
    localHeaders.push(lhBytes, data);

    // Central directory entry
    const ce = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(ce);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, compSize, true);
    cv.setUint32(24, uncompSize, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint16(38, 0, true);
    cv.setUint32(42, offset, true);
    const ceBytes = new Uint8Array(ce);
    ceBytes.set(nameBytes, 46);
    centralEntries.push(ceBytes);

    offset += 30 + nameBytes.length + data.length;
  }

  // End of central directory
  const cdOffset = localHeaders.reduce((s, b) => s + b.length, 0);
  const cdSize = centralEntries.reduce((s, b) => s + b.length, 0);
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdOffset, true);
  ev.setUint16(20, 0, true);
  const eocdBytes = new Uint8Array(eocd);

  const parts = [...localHeaders, ...centralEntries, eocdBytes];
  const total = parts.reduce((s, b) => s + b.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    result.set(p, pos);
    pos += p.length;
  }
  return new Blob([result], { type: 'application/zip' });
};

export const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
