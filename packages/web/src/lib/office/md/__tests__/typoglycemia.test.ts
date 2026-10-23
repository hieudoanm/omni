import { scrambleWord, scrambleText, scrambleNodes, applyCaseNodes } from '../typoglycemia';

describe('scrambleWord', () => {
  it('returns short words unchanged', () => {
    expect(scrambleWord('a')).toBe('a');
    expect(scrambleWord('ab')).toBe('ab');
    expect(scrambleWord('abc')).toBe('abc');
  });

  it('preserves first and last characters', () => {
    const result = scrambleWord('hello');
    expect(result[0]).toBe('h');
    expect(result[result.length - 1]).toBe('o');
    expect(result.length).toBe(5);
  });

  it('produces varied outputs over multiple runs', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(scrambleWord('hello'));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('scrambleText', () => {
  it('scrambles all words in text', () => {
    const result = scrambleText('hello world');
    const words = result.split(' ');
    expect(words).toHaveLength(2);
    expect(words[0][0]).toBe('h');
    expect(words[0][words[0].length - 1]).toBe('o');
    expect(words[1][0]).toBe('w');
    expect(words[1][words[1].length - 1]).toBe('d');
  });

  it('returns empty string for empty input', () => {
    expect(scrambleText('')).toBe('');
  });

  it('preserves punctuation', () => {
    const result = scrambleText('hello, world!');
    expect(result).toContain(',');
    expect(result).toContain('!');
  });
});

describe('scrambleNodes', () => {
  it('scrambles text nodes in a DOM element', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello world</p>';
    scrambleNodes(root);
    const text = root.textContent ?? '';
    const words = text.split(' ');
    expect(words[0][0]).toBe('h');
    expect(words[0][words[0].length - 1]).toBe('o');
  });

  it('skips text inside code elements', () => {
    const root = document.createElement('div');
    root.innerHTML = '<code>hello</code>';
    scrambleNodes(root);
    expect(root.textContent).toBe('hello');
  });

  it('skips text inside pre elements', () => {
    const root = document.createElement('div');
    root.innerHTML = '<pre>hello world</pre>';
    scrambleNodes(root);
    expect(root.textContent).toBe('hello world');
  });
});

describe('applyCaseNodes', () => {
  it('applies upper case to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello world</p>';
    applyCaseNodes(root, 'upper');
    expect(root.textContent).toBe('HELLO WORLD');
  });

  it('applies lower case to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>HELLO WORLD</p>';
    applyCaseNodes(root, 'lower');
    expect(root.textContent).toBe('hello world');
  });

  it('applies title case to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello world</p>';
    applyCaseNodes(root, 'title');
    expect(root.textContent).toBe('Hello World');
  });

  it('applies camelCase to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>hello world</p>';
    applyCaseNodes(root, 'camel');
    expect(root.textContent).toBe('helloWorld');
  });

  it('applies snake_case to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>Hello World</p>';
    applyCaseNodes(root, 'snake');
    expect(root.textContent).toBe('hello_world');
  });

  it('applies kebab-case to text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = '<p>Hello World</p>';
    applyCaseNodes(root, 'kebab');
    expect(root.textContent).toBe('hello-world');
  });

  it('skips text inside code elements', () => {
    const root = document.createElement('div');
    root.innerHTML = '<code>hello</code>';
    applyCaseNodes(root, 'upper');
    expect(root.textContent).toBe('hello');
  });

  it('skips text inside pre elements', () => {
    const root = document.createElement('div');
    root.innerHTML = '<pre>hello</pre>';
    applyCaseNodes(root, 'upper');
    expect(root.textContent).toBe('hello');
  });
});
