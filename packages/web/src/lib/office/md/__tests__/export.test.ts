import {
  buildExportHtml,
  exportHtmlFile,
  exportMarkdownFile,
  exportPdf,
} from '@/lib/office/md/export';
import { saveAs } from 'file-saver';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));

const mockSaveAs = saveAs as unknown as jest.Mock;

describe('export', () => {
  beforeEach(() => {
    mockSaveAs.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds a standalone html document', () => {
    const doc = buildExportHtml('My Note', '<p>hello</p>');
    expect(doc).toContain('<!doctype html>');
    expect(doc).toContain('<title>My Note</title>');
    expect(doc).toContain('<article><p>hello</p></article>');
  });

  it('exports markdown with a sanitized filename', () => {
    exportMarkdownFile('# hi', 'My Note!!! Title');
    expect(mockSaveAs).toHaveBeenCalledWith(expect.any(Blob), 'My-Note-Title.md');
    expect(mockSaveAs.mock.calls[0][0].type).toBe('text/markdown');
  });

  it('falls back to note.md when the title has no safe characters', () => {
    exportMarkdownFile('x', '!!!');
    expect(mockSaveAs).toHaveBeenCalledWith(expect.any(Blob), 'note.md');
  });

  it('exports html with a sanitized filename', () => {
    exportHtmlFile('A&B / Note', '<p>x</p>');
    expect(mockSaveAs).toHaveBeenCalledWith(expect.any(Blob), 'A-B-Note.html');
    expect(mockSaveAs.mock.calls[0][0].type).toBe('text/html');
  });

  it('falls back to note.html when the title has no safe characters', () => {
    exportHtmlFile('!!!', '<p>x</p>');
    expect(mockSaveAs).toHaveBeenCalledWith(expect.any(Blob), 'note.html');
  });

  it('prints the export via a hidden iframe and cleans up', () => {
    jest.useFakeTimers();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 'blob:pdf'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
    const realCreate = document.createElement.bind(document);
    let iframe: HTMLIFrameElement | null = null;
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (String(tag).toLowerCase() === 'iframe') iframe = el as HTMLIFrameElement;
      return el;
    });
    const append = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => document.createElement('div'));

    exportPdf('Title', '<p>x</p>');

    expect(append).toHaveBeenCalled();
    expect(iframe).not.toBeNull();
    expect(iframe!.src).toContain('blob:pdf');
    const remove = jest.spyOn(iframe!, 'remove').mockImplementation(() => {});
    iframe!.onload?.({} as Event);
    jest.advanceTimersByTime(60_000);
    expect(remove).toHaveBeenCalled();
    expect((URL as any).revokeObjectURL).toHaveBeenCalledWith('blob:pdf');
    expect((URL as any).createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    jest.useRealTimers();
  });
});
