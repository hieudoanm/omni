import { leetify, applyLeetNodes } from '../leet';

describe('leetify', () => {
  it('converts a single letter', () => {
    expect(leetify('a')).toBe('4');
  });

  it('converts hello world', () => {
    expect(leetify('Hello world')).toBe('H3110 w0r1d');
  });

  it('handles mixed case', () => {
    expect(leetify('Leet')).toBe('1337');
  });

  it('passes unknown characters through', () => {
    expect(leetify('a@b')).toBe('4@8');
  });

  it('returns empty string for empty input', () => {
    expect(leetify('')).toBe('');
  });

  it('handles digits', () => {
    expect(leetify('123')).toBe('123');
  });
});

describe('applyLeetNodes', () => {
  it('transforms text nodes in a container', () => {
    const root = document.createElement('div');
    root.textContent = 'hello';
    document.body.appendChild(root);
    applyLeetNodes(root);
    expect(root.textContent).toBe('h3110');
    document.body.removeChild(root);
  });

  it('skips code elements', () => {
    const root = document.createElement('div');
    const code = document.createElement('code');
    code.textContent = 'hello';
    root.appendChild(code);
    document.body.appendChild(root);
    applyLeetNodes(root);
    expect(code.textContent).toBe('hello');
    document.body.removeChild(root);
  });
});
