import { braillify, applyBraille, downloadBrf } from '../braille';

const BRAILLE_SPACE = '⠀';

describe('braillify', () => {
  it('converts a single letter', () => {
    expect(braillify('a')).toBe('⠁');
  });

  it('converts hello world', () => {
    expect(braillify('hello world')).toBe(`⠓⠑⠇⠇⠕${BRAILLE_SPACE}⠺⠕⠗⠇⠙`);
  });

  it('handles mixed case', () => {
    expect(braillify('Braille')).toBe('⠃⠗⠁⠊⠇⠇⠑');
  });

  it('passes unknown characters through', () => {
    expect(braillify('a@b')).toBe('⠁@⠃');
  });

  it('returns empty string for empty input', () => {
    expect(braillify('')).toBe('');
  });

  it('handles digits', () => {
    expect(braillify('123')).toBe('⠁⠃⠉');
  });

  it('handles punctuation', () => {
    expect(braillify('hello!')).toBe('⠓⠑⠇⠇⠕⠖');
  });

  it('handles space', () => {
    expect(braillify('a b')).toBe(`⠁${BRAILLE_SPACE}⠃`);
  });
});

describe('applyBraille', () => {
  it('converts entire document when no selection', () => {
    const result = applyBraille('hi', 2, 2);
    expect(result.text).toBe('⠓⠊');
  });

  it('converts selected range only', () => {
    const result = applyBraille('hello world', 0, 5);
    expect(result.text).toBe('⠓⠑⠇⠇⠕ world');
  });

  it('places cursor at start when no selection', () => {
    const result = applyBraille('ab', 2, 2);
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(result.text.length);
  });
});

describe('downloadBrf', () => {
  beforeAll(() => {
    globalThis.URL.createObjectURL = jest.fn(() => 'blob:url');
    globalThis.URL.revokeObjectURL = jest.fn();
  });

  it('creates a download link', () => {
    const createElementSpy = jest.spyOn(document, 'createElement');
    downloadBrf('Hello');
    expect(createElementSpy).toHaveBeenCalledWith('a');
    createElementSpy.mockRestore();
  });

  it('does not throw for empty string', () => {
    expect(() => downloadBrf('')).not.toThrow();
  });
});
