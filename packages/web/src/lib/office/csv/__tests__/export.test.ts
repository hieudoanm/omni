jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { saveAs } from 'file-saver';
import { downloadWorkbook } from '@/lib/office/csv/export';
import { createSheet, createWorkbook } from '@/lib/office/csv/workbook';

const buildWorkbook = (name = 'My Sheet'): ReturnType<typeof createWorkbook> => {
  const workbook = createWorkbook([createSheet(name, 2, 2)]);
  const sheet = workbook.sheets[0];
  sheet.grid[0][0] = 'a';
  sheet.grid[0][1] = 'b';
  return workbook;
};

describe('downloadWorkbook', () => {
  beforeEach(() => {
    jest.mocked(saveAs).mockClear();
  });

  const lastBlob = (): Blob => {
    const call = jest.mocked(saveAs).mock.calls[0];
    return call[0] as Blob;
  };

  const readBlob = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });

  it('exports CSV', async () => {
    downloadWorkbook(buildWorkbook(), 'csv');
    const [, filename] = jest.mocked(saveAs).mock.calls[0];
    expect(filename).toBe('My_Sheet.csv');
    expect(lastBlob().type).toBe('text/csv;charset=utf-8');
    await expect(readBlob(lastBlob())).resolves.toBe('a,b\r\n,');
  });

  it('exports TSV', async () => {
    downloadWorkbook(buildWorkbook(), 'tsv');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sheet.tsv');
    expect(lastBlob().type).toBe('text/tab-separated-values;charset=utf-8');
    await expect(readBlob(lastBlob())).resolves.toBe('a\tb\r\n\t');
  });

  it('exports JSON', async () => {
    downloadWorkbook(buildWorkbook(), 'json');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sheet.json');
    expect(lastBlob().type).toBe('application/json;charset=utf-8');
    const parsed = JSON.parse(await readBlob(lastBlob())) as {
      name: string;
      rows: string[][];
    };
    expect(parsed.name).toBe('My Sheet');
    expect(parsed.rows[0]).toEqual(['a', 'b']);
  });

  it('exports HTML', async () => {
    downloadWorkbook(buildWorkbook(), 'html');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sheet.html');
    expect(lastBlob().type).toBe('text/html;charset=utf-8');
    const html = await readBlob(lastBlob());
    expect(html).toContain('<table>');
    expect(html).toContain('My Sheet');
    expect(html).toContain('<td data-col="0">1a</td>');
    expect(html).toContain('<td data-col="1">b</td>');
  });

  it('exports XML', async () => {
    downloadWorkbook(buildWorkbook(), 'xml');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sheet.xml');
    expect(lastBlob().type).toBe('application/xml;charset=utf-8');
    const xml = await readBlob(lastBlob());
    expect(xml).toContain('<spreadsheet>');
    expect(xml).toContain('<sheet name="My Sheet">');
    expect(xml).toContain('<cell>a</cell>');
  });

  it('exports XLSX as a ZIP blob', () => {
    downloadWorkbook(buildWorkbook(), 'xlsx');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sheet.xlsx');
    expect(lastBlob().type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
  });

  it('escapes special characters in exported markup', async () => {
    const workbook = buildWorkbook('A & B');
    workbook.sheets[0].grid[0][0] = 'x<y>';
    downloadWorkbook(workbook, 'html');
    const html = await readBlob(lastBlob());
    expect(html).toContain('x&lt;y&gt;');
    expect(html).not.toContain('<td>a<');
  });

  it('sanitizes the sheet name for the filename', () => {
    downloadWorkbook(buildWorkbook('My/Sneaky:Name!'), 'csv');
    expect(jest.mocked(saveAs).mock.calls[0][1]).toBe('My_Sneaky_Name_.csv');
  });

  it('exports HTML for an empty sheet', async () => {
    const workbook = createWorkbook([createSheet('Empty', 0, 2)]);
    downloadWorkbook(workbook, 'html');
    const html = await readBlob(lastBlob());
    expect(html).toContain('<thead><tr></tr></thead>');
    expect(html).toContain('<h1>Empty</h1>');
  });
});
