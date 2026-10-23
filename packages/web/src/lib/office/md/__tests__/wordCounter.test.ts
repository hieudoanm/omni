import { applyTextTransform, computeWordStats } from '../wordCounter';

describe('computeWordStats', () => {
  it('returns zeroed stats for empty text', () => {
    expect(computeWordStats('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '<1 min',
    });
  });

  it('counts characters with and without whitespace', () => {
    const stats = computeWordStats('a b\n c');
    expect(stats.characters).toBe(6);
    expect(stats.charactersNoSpaces).toBe(3);
  });

  it('counts words, lines, sentences and paragraphs', () => {
    const text = 'First line.\nSecond one! Third?\n\nNew paragraph here';
    const stats = computeWordStats(text);
    expect(stats.words).toBe(8);
    expect(stats.lines).toBe(4);
    expect(stats.sentences).toBe(4);
    expect(stats.paragraphs).toBe(2);
  });

  it('rounds reading time up at 200 wpm', () => {
    const oneMinute = computeWordStats(Array.from({ length: 200 }, () => 'w').join(' '));
    expect(oneMinute.readingTime).toBe('1 min');

    const twoMinutes = computeWordStats(Array.from({ length: 201 }, () => 'w').join(' '));
    expect(twoMinutes.readingTime).toBe('2 min');
  });
});

describe('applyTextTransform', () => {
  it('lowercases text', () => {
    expect(applyTextTransform('Hello World', 'lowercase')).toBe('hello world');
  });

  it('uppercases text', () => {
    expect(applyTextTransform('Hello World', 'uppercase')).toBe('HELLO WORLD');
  });

  it('collapses whitespace runs and trims', () => {
    expect(applyTextTransform('  a   b \n c  ', 'trim')).toBe('a b c');
  });
});
