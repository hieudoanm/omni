import { computeDisplayGrid, isFormula } from '@/lib/office/csv/formula';
import type { Grid } from '@/lib/office/csv/types';

const display = (grid: Grid): string[][] => computeDisplayGrid(grid);

describe('isFormula', () => {
  it.each([
    ['=1', true],
    ['=SUM(A1)', true],
    ['=', false],
    ['', false],
    ['hello', false],
    ['  =1', false],
  ])('detects formulas (%s → %s)', (value, expected) => {
    expect(isFormula(value)).toBe(expected);
  });
});

describe('arithmetic', () => {
  it('evaluates addition, subtraction, multiplication, division, and power', () => {
    const grid: Grid = [['=2+3', '=10/4', '=2^3', '=7-2*3', '=-5', '=2*(3+4)']];
    expect(display(grid)[0]).toEqual(['5', '2.5', '8', '1', '-5', '14']);
  });

  it('supports unary plus and double negation', () => {
    const grid: Grid = [['=+5', '=--5']];
    expect(display(grid)[0]).toEqual(['5', '5']);
  });

  it('evaluates left to right at equal precedence', () => {
    const grid: Grid = [['=10-4-3', '=20/5*2']];
    expect(display(grid)[0]).toEqual(['3', '8']);
  });

  it('treats empty and text cells as zero in arithmetic', () => {
    const grid: Grid = [['', 'hello', '=A1+1', '=B1+1']];
    expect(display(grid)[0][2]).toBe('1');
    expect(display(grid)[0][3]).toBe('1');
  });

  it('returns division by zero as an error', () => {
    const grid: Grid = [['=1/0']];
    expect(display(grid)[0][0]).toBe('#DIV/0!');
  });
});

describe('cell references', () => {
  it('evaluates references to other cells', () => {
    const grid: Grid = [
      ['10', '=A1*2', '=B1+A1'],
      ['=B1', ''],
    ];
    expect(display(grid)[0][1]).toBe('20');
    expect(display(grid)[0][2]).toBe('30');
    expect(display(grid)[1][0]).toBe('20');
  });

  it('reads formula cells through references and reuses memoised results', () => {
    const grid: Grid = [['=2', '=A1+1', '=B1+1']];
    expect(display(grid)[0][1]).toBe('3');
    expect(display(grid)[0][2]).toBe('4');
  });

  it('treats out-of-range references as zero', () => {
    const grid: Grid = [['=Z9+1', '=AA1*2']];
    expect(display(grid)[0][0]).toBe('1');
    expect(display(grid)[0][1]).toBe('0');
  });

  it('supports multi-letter columns', () => {
    const grid: Grid = [['5', '', '=A1*2']];
    expect(display(grid)[0][2]).toBe('10');
  });
});

describe('functions', () => {
  const grid: Grid = [
    ['1', '2', '3'],
    ['4', '', 'x'],
    ['=SUM(A1:B2)', '=SUM(A1, C1)', '=SUM(A1:C2, 10)'],
    ['=AVG(A1:B1)', '=AVERAGE(A1:B1)', '=COUNT(A1:C2)'],
    ['=MIN(A1:C2)', '=MAX(A1:B1)', '=AVG(C2:C2)'],
  ];

  it('sums ranges, scalars, and mixed arguments', () => {
    expect(display(grid)[2][0]).toBe('7');
    expect(display(grid)[2][1]).toBe('4');
    expect(display(grid)[2][2]).toBe('20');
  });

  it('computes averages, counts, mins, and maxes', () => {
    expect(display(grid)[3][0]).toBe('1.5');
    expect(display(grid)[3][1]).toBe('1.5');
    expect(display(grid)[3][2]).toBe('4');
    expect(display(grid)[4][0]).toBe('1');
    expect(display(grid)[4][1]).toBe('2');
    expect(display(grid)[4][2]).toBe('#DIV/0!');
  });

  it('ignores blank and text cells in aggregates', () => {
    expect(display(grid)[2][0]).toBe('7');
    expect(display(grid)[3][2]).toBe('4');
  });

  it('supports nested function calls', () => {
    const nested: Grid = [
      ['1', '2', '=SUM(A1:A2)*2', '=SUM(A1, SUM(B1))'],
      ['3', ''],
    ];
    expect(display(nested)[0][2]).toBe('8');
    expect(display(nested)[0][3]).toBe('3');
  });

  it('returns an error for unknown functions', () => {
    const unknown: Grid = [['=FOO(1)']];
    expect(display(unknown)[0][0]).toBe('#ERROR');
  });

  it('returns an error for a function name without parentheses', () => {
    const bare: Grid = [['=SUM']];
    expect(display(bare)[0][0]).toBe('#ERROR');
  });

  it('returns an error when a range is used outside a function', () => {
    const bare: Grid = [['=A1:B2']];
    expect(display(bare)[0][0]).toBe('#ERROR');
  });

  it('returns an error for malformed expressions', () => {
    const malformed: Grid = [['=SUM(A1', '=(1+2', '=1+', '=()']];
    expect(display(malformed)[0].every((value) => value === '#ERROR')).toBe(true);
  });
});

describe('cycles', () => {
  it('detects direct cycles', () => {
    const grid: Grid = [['=B1', '=A1']];
    expect(display(grid)[0][0]).toBe('#CYCLE');
    expect(display(grid)[0][1]).toBe('#CYCLE');
  });

  it('detects indirect cycles', () => {
    const grid: Grid = [['=B1', '=C1', '=A1']];
    expect(display(grid)[0][0]).toBe('#CYCLE');
    expect(display(grid)[0][1]).toBe('#CYCLE');
    expect(display(grid)[0][2]).toBe('#CYCLE');
  });

  it('does not flag cells merely referencing a cyclic cell', () => {
    const grid: Grid = [
      ['=B1', '=A1', '=1'],
      ['=C1', ''],
    ];
    expect(display(grid)[1][0]).toBe('1');
  });
});

describe('formatting', () => {
  it('keeps non-formula cells unchanged', () => {
    const grid: Grid = [['hello', '3', '', '=  ']];
    expect(display(grid)[0]).toEqual(['hello', '3', '', '#ERROR']);
  });

  it('trims floating point noise', () => {
    const grid: Grid = [['=1/3', '=0.1+0.2']];
    expect(display(grid)[0][0]).toBe('0.333333333333');
    expect(display(grid)[0][1]).toBe('0.3');
  });
});
