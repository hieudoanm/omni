import {
  copyToClipboard,
  downloadBlob,
  downloadText,
  formatDate,
  formatDuration,
  formatFileSize,
} from '@/lib/office/keynotes/format';

describe('formatFileSize', () => {
  it('formats bytes, kilobytes and megabytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds into seconds, minutes and hours', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(59000)).toBe('0:59');
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(3661000)).toBe('1:01:01');
  });
});

describe('formatDate', () => {
  it('formats a timestamp into a readable date', () => {
    const date = new Date(2024, 0, 15, 9, 30).getTime();
    expect(formatDate(date)).toContain('2024');
    expect(formatDate(date)).toContain('9:30');
  });
});

describe('copyToClipboard', () => {
  it('uses the clipboard API when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    await copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('falls back to execCommand when the API is unavailable', async () => {
    const originalClipboard = navigator.clipboard;
    const originalExecCommand = document.execCommand;
    Object.assign(navigator, { clipboard: undefined });
    document.execCommand = jest
      .fn()
      .mockReturnValue(true) as unknown as typeof document.execCommand;
    await copyToClipboard('fallback');
    expect(document.execCommand).toHaveBeenCalledWith('copy');
    document.execCommand = originalExecCommand;
    Object.assign(navigator, { clipboard: originalClipboard });
  });
});

describe('downloadText / downloadBlob', () => {
  it('creates an object URL and triggers a click', () => {
    const revoke = jest.fn();
    const createUrl = jest.fn().mockReturnValue('blob:mock');
    URL.createObjectURL = createUrl as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revoke as unknown as typeof URL.revokeObjectURL;
    const click = jest.fn();
    HTMLAnchorElement.prototype.click = click;

    downloadText('file.txt', 'content', 'text/plain');

    expect(createUrl).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:mock');

    const blob = new Blob(['x'], { type: 'application/octet-stream' });
    downloadBlob('bin.dat', blob);
    expect(click).toHaveBeenCalledTimes(2);
  });
});
