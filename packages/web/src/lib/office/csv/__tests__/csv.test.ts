import {
  parseCsv,
  parseDelimited,
  parseTsv,
  serializeCsv,
  serializeTsv,
} from '@/lib/office/csv/csv';

describe('parseCsv', () => {
  it('parses simple comma-separated rows', () => {
    expect(parseCsv('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ]);
  });

  it('parses quoted fields containing commas', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']]);
  });

  it('unwraps escaped double quotes', () => {
    expect(parseCsv('"he said ""hi"""')).toEqual([['he said "hi"']]);
  });

  it('keeps embedded newlines inside quoted fields', () => {
    expect(parseCsv('"line1\nline2",x')).toEqual([['line1\nline2', 'x']]);
  });

  it('handles CRLF line endings', () => {
    expect(parseCsv('a,b\r\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('preserves empty fields', () => {
    expect(parseCsv('a,,c')).toEqual([['a', '', 'c']]);
  });

  it('returns an empty grid for an empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('ignores a trailing newline', () => {
    expect(parseCsv('a,b\n')).toEqual([['a', 'b']]);
  });

  it('quotes a field containing a leading quote', () => {
    expect(parseCsv('"x""y"')).toEqual([['x"y']]);
  });
});

describe('parseTsv', () => {
  it('splits rows on tabs', () => {
    expect(parseTsv('a\tb\n1\t2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('unquotes quoted fields', () => {
    expect(parseTsv('a\t"x\ty"')).toEqual([['a', 'x\ty']]);
  });

  it('handles CRLF line endings', () => {
    expect(parseTsv('a\tb\r\nc\td')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});

describe('parseDelimited', () => {
  it('picks CSV when commas outnumber tabs', () => {
    expect(parseDelimited('a,b,c')).toEqual([['a', 'b', 'c']]);
  });

  it('picks TSV when tabs outnumber commas', () => {
    expect(parseDelimited('a\tb\tc')).toEqual([['a', 'b', 'c']]);
  });
});

describe('serializeCsv', () => {
  it('joins rows with CRLF', () => {
    expect(
      serializeCsv([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ).toBe('a,b\r\nc,d');
  });

  it('quotes fields with commas', () => {
    expect(serializeCsv([['a', 'b,c']])).toBe('a,"b,c"');
  });

  it('quotes and escapes fields with quotes', () => {
    expect(serializeCsv([['say "hi"']])).toBe('"say ""hi"""');
  });

  it('quotes fields with newlines', () => {
    expect(serializeCsv([['line1\nline2']])).toBe('"line1\nline2"');
  });

  it('round-trips through parseCsv', () => {
    const grid = [
      ['name', 'note'],
      ['a, b', 'say "hi"\nnext'],
      ['', 'z'],
    ];
    expect(parseCsv(serializeCsv(grid))).toEqual(grid);
  });
});

describe('serializeTsv', () => {
  it('joins cells with tabs and rows with CRLF', () => {
    expect(
      serializeTsv([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ).toBe('a\tb\r\nc\td');
  });

  it('quotes fields containing tabs', () => {
    expect(serializeTsv([['a', 'x\ty']])).toBe('a\t"x\ty"');
  });

  it('round-trips through parseTsv', () => {
    const grid = [
      ['name', 'note'],
      ['plain', 'with "quotes"'],
      ['has\ttab', 'z'],
      ['', 'w'],
    ];
    expect(parseTsv(serializeTsv(grid))).toEqual(grid);
  });
});
