import { applyCase, toCamelCase, toKebabCase, toSnakeCase, toTitleCase } from '../textCase';

describe('case converters', () => {
  it.each([
    ['toTitleCase', toTitleCase, 'hello world example', 'Hello World Example'],
    ['toCamelCase', toCamelCase, 'hello world example', 'helloWorldExample'],
    ['toSnakeCase', toSnakeCase, 'Hello World Example', 'hello_world_example'],
    ['toKebabCase', toKebabCase, 'Hello World Example', 'hello-world-example'],
  ])('%s converts text', (_name, convert, input, expected) => {
    expect(convert(input)).toBe(expected);
  });
});

describe('applyCase', () => {
  const doc = 'first line\nSECOND LINE';

  it('converts the selected range only', () => {
    // Select "line" on the first line (offsets 6..10).
    const edit = applyCase(doc, 6, 10, 'upper');
    expect(edit.text).toBe('first LINE\nSECOND LINE');
    expect(edit.selectionStart).toBe(6);
    expect(edit.selectionEnd).toBe(10);
  });

  it('falls back to the whole document without a selection', () => {
    const edit = applyCase(doc, 3, 3, 'lower');
    expect(edit.text).toBe('first line\nsecond line');
    expect(edit.selectionStart).toBe(0);
    expect(edit.selectionEnd).toBe(22);
  });

  it.each([
    ['upper', 'HELLO WORLD'],
    ['lower', 'hello world'],
    ['title', 'Hello World'],
    ['camel', 'helloWorld'],
    ['snake', 'hello_world'],
    ['kebab', 'hello-world'],
  ] as const)('applies %s across a selection', (kind, expected) => {
    const edit = applyCase('hello world', 0, 11, kind);
    expect(edit.text).toBe(expected);
  });
});
