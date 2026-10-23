import { buildXlsx } from '@/lib/office/csv/xlsx';
import { createSheet } from '@/lib/office/csv/workbook';

const decode = (bytes: Uint8Array): string => {
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
};

describe('buildXlsx', () => {
  it('produces a ZIP archive with a PK header', () => {
    const bytes = buildXlsx(createSheet('Sheet 1', 1, 1));
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it('stores the OOXML package parts uncompressed', () => {
    const text = decode(buildXlsx(createSheet('Sheet 1', 1, 1)));
    expect(text).toContain('[Content_Types].xml');
    expect(text).toContain('_rels/.rels');
    expect(text).toContain('xl/workbook.xml');
    expect(text).toContain('xl/worksheets/sheet1.xml');
  });

  it('writes sheet values as inline strings', () => {
    const sheet = createSheet('Data', 2, 2);
    sheet.grid[0][0] = 'hello';
    sheet.grid[1][1] = '42';
    const text = decode(buildXlsx(sheet));
    expect(text).toContain('<c r="A1" t="inlineStr"><is><t>hello</t></is></c>');
    expect(text).toContain('<c r="B2" t="inlineStr"><is><t>42</t></is></c>');
    expect(text).toContain('<sheet name="Data" sheetId="1"');
  });

  it('skips empty cells', () => {
    const sheet = createSheet('Empty', 2, 2);
    const text = decode(buildXlsx(sheet));
    expect(text).not.toContain('<c r="');
  });

  it('escapes XML special characters in values', () => {
    const sheet = createSheet('S', 1, 1);
    sheet.grid[0][0] = 'a<b>&"c"';
    const text = decode(buildXlsx(sheet));
    expect(text).toContain('<t>a&lt;b&gt;&amp;&quot;c&quot;</t>');
  });
});
