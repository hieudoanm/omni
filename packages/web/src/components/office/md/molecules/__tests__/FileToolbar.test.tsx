import { fireEvent, render, screen } from '@testing-library/react';
import { FileToolbar } from '@/components/office/md/molecules/FileToolbar';

const mockReadAsText = jest.fn(function (this: FakeFileReader) {
  this.result = FakeFileReader.result;
  this.onload?.();
});

class FakeFileReader {
  static result: string | null = 'imported content';
  result: string | null = null;
  onload: (() => void) | null = null;
  readAsText = mockReadAsText;
}

describe('FileToolbar', () => {
  const originalFileReader = global.FileReader;

  afterEach(() => {
    global.FileReader = originalFileReader;
    FakeFileReader.result = 'imported content';
    jest.clearAllMocks();
  });

  const renderToolbar = (overrides = {}) => {
    const props = {
      canExport: true,
      onNew: jest.fn(),
      onImport: jest.fn(),
      onExportMarkdown: jest.fn(),
      onExportHtml: jest.fn(),
      onExportPdf: jest.fn(),
      onDelete: jest.fn(),
      ...overrides,
    };
    render(<FileToolbar {...props} />);
    return props;
  };

  it('fires the action callbacks from the toolbar buttons', () => {
    const props = renderToolbar();
    fireEvent.click(screen.getByRole('button', { name: 'New note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export HTML' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete note' }));

    expect(props.onNew).toHaveBeenCalledTimes(1);
    expect(props.onExportMarkdown).toHaveBeenCalledTimes(1);
    expect(props.onExportHtml).toHaveBeenCalledTimes(1);
    expect(props.onExportPdf).toHaveBeenCalledTimes(1);
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables export and delete actions when nothing can be exported', () => {
    renderToolbar({ canExport: false });
    expect(screen.getByRole('button', { name: 'Export Markdown' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export HTML' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete note' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'New note' })).toBeEnabled();
  });

  it('opens the file picker when importing', () => {
    renderToolbar();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = jest.fn();
    fileInput.click = click;
    fireEvent.click(screen.getByRole('button', { name: 'Import Markdown' }));
    expect(click).toHaveBeenCalled();
  });

  it('reads an imported file and forwards its content', () => {
    global.FileReader = FakeFileReader as unknown as typeof FileReader;
    const props = renderToolbar();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(['hi'], 'a.md')] } });

    expect(mockReadAsText).toHaveBeenCalledTimes(1);
    expect(props.onImport).toHaveBeenCalledWith('imported content');
  });

  it('handles an empty file result as an empty string', () => {
    global.FileReader = FakeFileReader as unknown as typeof FileReader;
    FakeFileReader.result = null;
    const props = renderToolbar();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(['hi'], 'a.md')] } });

    expect(props.onImport).toHaveBeenCalledWith('');
  });

  it('ignores a change event without a selected file', () => {
    global.FileReader = FakeFileReader as unknown as typeof FileReader;
    const props = renderToolbar();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [] } });

    expect(mockReadAsText).not.toHaveBeenCalled();
    expect(props.onImport).not.toHaveBeenCalled();
  });
});
