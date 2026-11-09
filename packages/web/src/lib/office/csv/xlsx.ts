import { columnToLabel } from '@/lib/office/csv/columns';
import { escapeXml } from '@/lib/office/csv/xml';
import type { Sheet } from '@/lib/office/csv/types';

const cellXml = (sheet: Sheet): string => {
  const rows = sheet.grid
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => {
          if (value === '') return '';
          return `<c r="${columnToLabel(colIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
  return rows;
};

const worksheetXml = (
  sheet: Sheet,
): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${cellXml(sheet)}</sheetData></worksheet>`;

const workbookXml = (
  name: string,
): string => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(name)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;

class ByteWriter {
  private buffer: number[] = [];

  writeBytes(bytes: number[]): void {
    this.buffer.push(...bytes);
  }

  writeUint16(value: number): void {
    this.writeBytes([value & 0xff, (value >> 8) & 0xff]);
  }

  writeUint32(value: number): void {
    this.writeBytes([
      value & 0xff,
      (value >> 8) & 0xff,
      (value >> 16) & 0xff,
      (value >> 24) & 0xff,
    ]);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const textEncoder = (): TextEncoder => new TextEncoder();

const zip = (files: Array<{ name: string; data: Uint8Array }>): Uint8Array => {
  const writer = new ByteWriter();
  const central: number[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = textEncoder().encode(file.name);
    const crc = crc32(file.data);

    writer.writeUint32(0x04034b50);
    writer.writeUint16(20);
    writer.writeUint16(0);
    writer.writeUint16(0);
    writer.writeUint16(0);
    writer.writeUint16(0);
    writer.writeUint32(crc);
    writer.writeUint32(file.data.length);
    writer.writeUint32(file.data.length);
    writer.writeUint16(nameBytes.length);
    writer.writeUint16(0);
    writer.writeBytes(Array.from(nameBytes));
    writer.writeBytes(Array.from(file.data));

    const centralHeader = new ByteWriter();
    centralHeader.writeUint32(0x02014b50);
    centralHeader.writeUint16(20);
    centralHeader.writeUint16(20);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint32(crc);
    centralHeader.writeUint32(file.data.length);
    centralHeader.writeUint32(file.data.length);
    centralHeader.writeUint16(nameBytes.length);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint16(0);
    centralHeader.writeUint32(0);
    centralHeader.writeUint32(offset);
    centralHeader.writeBytes(Array.from(nameBytes));
    central.push(...centralHeader.toUint8Array());

    offset += 30 + nameBytes.length + file.data.length;
  }

  const centralBytes = new Uint8Array(central);
  writer.writeBytes(Array.from(centralBytes));

  const endOffset = offset + centralBytes.length;
  writer.writeUint32(0x06054b50);
  writer.writeUint16(0);
  writer.writeUint16(0);
  writer.writeUint16(files.length);
  writer.writeUint16(files.length);
  writer.writeUint32(centralBytes.length);
  writer.writeUint32(endOffset);
  writer.writeUint16(0);

  return writer.toUint8Array();
};

export const buildXlsx = (sheet: Sheet): Uint8Array =>
  zip([
    {
      name: '[Content_Types].xml',
      data: textEncoder().encode(contentTypesXml),
    },
    { name: '_rels/.rels', data: textEncoder().encode(rootRelsXml) },
    {
      name: 'xl/workbook.xml',
      data: textEncoder().encode(workbookXml(sheet.name)),
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      data: textEncoder().encode(workbookRelsXml),
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: textEncoder().encode(worksheetXml(sheet)),
    },
  ]);
