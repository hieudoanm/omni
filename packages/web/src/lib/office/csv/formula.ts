import type { Grid } from '@/lib/office/csv/types';

export type FormulaError = '#ERROR' | '#CYCLE' | '#DIV/0!';

type CellValue = number | FormulaError;

interface EvalState {
  memo: Map<string, CellValue>;
  visiting: Set<string>;
}

export const isFormula = (value: string): boolean => value.startsWith('=') && value.length > 1;

const columnIndex = (letters: string): number => {
  let index = 0;
  for (let i = 0; i < letters.length; i += 1) {
    index = index * 26 + (letters.charCodeAt(i) - 64);
  }
  return index - 1;
};

const cellRef = (source: string): { row: number; col: number } | null => {
  const match = /^([A-Z]+)(\d+)$/.exec(source);
  if (!match) return null;
  return { row: Number(match[2]) - 1, col: columnIndex(match[1]) };
};

const rangeCells = (
  source: string,
): { row0: number; row1: number; col0: number; col1: number } | null => {
  const match = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(source);
  if (!match) return null;
  const row0 = Number(match[2]) - 1;
  const row1 = Number(match[4]) - 1;
  const col0 = columnIndex(match[1]);
  const col1 = columnIndex(match[3]);
  return {
    row0: Math.min(row0, row1),
    row1: Math.max(row0, row1),
    col0: Math.min(col0, col1),
    col1: Math.max(col0, col1),
  };
};

const cellKey = (row: number, col: number): string => `${row}:${col}`;

const evaluateCell = (grid: Grid, row: number, col: number, state: EvalState): CellValue => {
  const raw = grid[row]?.[col];
  if (!raw) return 0;
  if (!isFormula(raw)) {
    const numeric = Number(raw);
    return Number.isNaN(numeric) ? 0 : numeric;
  }
  const key = cellKey(row, col);
  if (state.memo.has(key)) return state.memo.get(key) as CellValue;
  if (state.visiting.has(key)) return '#CYCLE';
  state.visiting.add(key);
  const result = evaluateExpression(raw.slice(1), grid, state);
  state.visiting.delete(key);
  state.memo.set(key, result);
  return result;
};

const numericValue = (value: CellValue): number | null =>
  typeof value === 'number' ? value : null;

const rangeCellNumber = (grid: Grid, row: number, col: number, state: EvalState): number | null => {
  const raw = grid[row]?.[col];
  if (!raw) return null;
  if (isFormula(raw)) return numericValue(evaluateCell(grid, row, col, state));
  const numeric = Number(raw);
  return Number.isNaN(numeric) ? null : numeric;
};

const collectArgs = (
  tokens: Token[],
  index: number,
  grid: Grid,
  state: EvalState,
): { values: number[]; next: number } => {
  const values: number[] = [];
  let current = index;
  let first = true;
  while (current < tokens.length) {
    if (!first && tokens[current].type !== 'comma') break;
    if (first) first = false;
    else current += 1;
    const token = tokens[current];
    if (token?.type === 'range') {
      const range = rangeCells(token.value);
      if (range) {
        for (let row = range.row0; row <= range.row1; row += 1) {
          for (let col = range.col0; col <= range.col1; col += 1) {
            const number = rangeCellNumber(grid, row, col, state);
            if (number !== null) values.push(number);
          }
        }
      }
      current += 1;
    } else if (token?.type === 'cell') {
      const ref = cellRef(token.value);
      if (ref) {
        const number = rangeCellNumber(grid, ref.row, ref.col, state);
        if (number !== null) values.push(number);
      }
      current += 1;
    } else if (token) {
      const scalar = parseAddSub(tokens, current, grid, state);
      const numeric = numericValue(scalar.value);
      if (numeric !== null) values.push(numeric);
      current = scalar.next;
    }
  }
  return { values, next: current };
};

const applyFunction = (name: string, numbers: number[]): CellValue => {
  switch (name) {
    case 'SUM':
      return numbers.reduce((total, n) => total + n, 0);
    case 'AVG':
    case 'AVERAGE':
      return numbers.length === 0
        ? '#DIV/0!'
        : numbers.reduce((total, n) => total + n, 0) / numbers.length;
    case 'COUNT':
      return numbers.length;
    case 'MIN':
      return numbers.length === 0 ? '#DIV/0!' : Math.min(...numbers);
    case 'MAX':
      return numbers.length === 0 ? '#DIV/0!' : Math.max(...numbers);
    default:
      return '#ERROR';
  }
};

type Token =
  | { type: 'number' | 'cell' | 'range' | 'name'; value: string }
  | { type: 'op' | 'lparen' | 'rparen' | 'comma'; value: string };

const tokenize = (source: string): Token[] => {
  const tokens: Token[] = [];
  const pattern =
    /(\d+(?:\.\d+)?)|([A-Z]+\d+:[A-Z]+\d+|[A-Z]+\d+|[A-Za-z_][A-Za-z0-9_]*)|([+\-*/^(),])/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    const [, number, word, op] = match;
    if (number !== undefined) {
      tokens.push({ type: 'number', value: number });
    } else if (word !== undefined) {
      const upper = word.toUpperCase();
      if (upper.includes(':')) tokens.push({ type: 'range', value: upper });
      else if (/^[A-Z]+\d+$/.test(upper)) tokens.push({ type: 'cell', value: upper });
      else tokens.push({ type: 'name', value: upper });
    } else if (op !== undefined) {
      if (op === '(') tokens.push({ type: 'lparen', value: op });
      else if (op === ')') tokens.push({ type: 'rparen', value: op });
      else if (op === ',') tokens.push({ type: 'comma', value: op });
      else tokens.push({ type: 'op', value: op });
    }
  }
  return tokens;
};

interface EvalResult {
  value: CellValue;
  next: number;
}

const evaluateExpression = (source: string, grid: Grid, state: EvalState): CellValue => {
  const tokens = tokenize(source);
  if (tokens.length === 0) return '#ERROR';
  const result = parseAddSub(tokens, 0, grid, state);
  if (result.next !== tokens.length) return '#ERROR';
  return result.value;
};

const parseAddSub = (tokens: Token[], index: number, grid: Grid, state: EvalState): EvalResult => {
  let left = parseMulDiv(tokens, index, grid, state);
  while (
    left.next < tokens.length &&
    tokens[left.next].type === 'op' &&
    (tokens[left.next].value === '+' || tokens[left.next].value === '-')
  ) {
    const op = tokens[left.next].value;
    const right = parseMulDiv(tokens, left.next + 1, grid, state);
    left = {
      value: applyArithmetic(op, left.value, right.value),
      next: right.next,
    };
  }
  return left;
};

const parseMulDiv = (tokens: Token[], index: number, grid: Grid, state: EvalState): EvalResult => {
  let left = parsePower(tokens, index, grid, state);
  while (
    left.next < tokens.length &&
    tokens[left.next].type === 'op' &&
    (tokens[left.next].value === '*' || tokens[left.next].value === '/')
  ) {
    const op = tokens[left.next].value;
    const right = parsePower(tokens, left.next + 1, grid, state);
    left = {
      value: applyArithmetic(op, left.value, right.value),
      next: right.next,
    };
  }
  return left;
};

const parsePower = (tokens: Token[], index: number, grid: Grid, state: EvalState): EvalResult => {
  const left = parseUnary(tokens, index, grid, state);
  if (
    left.next < tokens.length &&
    tokens[left.next].type === 'op' &&
    tokens[left.next].value === '^'
  ) {
    const right = parsePower(tokens, left.next + 1, grid, state);
    return {
      value: applyArithmetic('^', left.value, right.value),
      next: right.next,
    };
  }
  return left;
};

const parseUnary = (tokens: Token[], index: number, grid: Grid, state: EvalState): EvalResult => {
  const token = tokens[index];
  if (token?.type === 'op' && (token.value === '-' || token.value === '+')) {
    const operand = parseUnary(tokens, index + 1, grid, state);
    if (token.value === '-' && typeof operand.value === 'number') {
      return { value: -operand.value, next: operand.next };
    }
    return operand;
  }
  return parsePrimary(tokens, index, grid, state);
};

const parsePrimary = (tokens: Token[], index: number, grid: Grid, state: EvalState): EvalResult => {
  const token = tokens[index];
  if (!token) return { value: '#ERROR', next: index };
  if (token.type === 'number') {
    return { value: Number(token.value), next: index + 1 };
  }
  if (token.type === 'cell') {
    const ref = cellRef(token.value);
    if (!ref) return { value: '#ERROR', next: index + 1 };
    return {
      value: evaluateCell(grid, ref.row, ref.col, state),
      next: index + 1,
    };
  }
  if (token.type === 'name') {
    if (tokens[index + 1]?.type === 'lparen') {
      return parseFunction(token.value, tokens, index + 2, grid, state);
    }
    return { value: '#ERROR', next: index + 1 };
  }
  if (token.type === 'range' || token.type === 'op') {
    return { value: '#ERROR', next: index + 1 };
  }
  if (token.type === 'lparen') {
    const inner = parseAddSub(tokens, index + 1, grid, state);
    if (tokens[inner.next]?.type !== 'rparen') {
      return { value: '#ERROR', next: tokens.length };
    }
    return { value: inner.value, next: inner.next + 1 };
  }
  return { value: '#ERROR', next: index + 1 };
};

const parseFunction = (
  name: string,
  tokens: Token[],
  index: number,
  grid: Grid,
  state: EvalState,
): EvalResult => {
  const collected = collectArgs(tokens, index, grid, state);
  if (tokens[collected.next]?.type !== 'rparen') {
    return { value: '#ERROR', next: tokens.length };
  }
  return {
    value: applyFunction(name, collected.values),
    next: collected.next + 1,
  };
};

const applyArithmetic = (op: string, left: CellValue, right: CellValue): CellValue => {
  if (isError(left)) return left;
  if (isError(right)) return right;
  if (op === '+') return left + right;
  if (op === '-') return left - right;
  if (op === '*') return left * right;
  if (op === '^') return Math.pow(left, right);
  return right === 0 ? '#DIV/0!' : left / right;
};

const isError = (value: CellValue): value is FormulaError => typeof value !== 'number';

const formatNumber = (value: number): string => String(Number(value.toPrecision(12)));

export const computeDisplayGrid = (grid: Grid): Grid => {
  const state: EvalState = { memo: new Map(), visiting: new Set() };
  return grid.map((row) =>
    row.map((raw) =>
      isFormula(raw) ? formatResult(evaluateExpression(raw.slice(1), grid, state)) : raw,
    ),
  );
};

const formatResult = (value: CellValue): string =>
  typeof value === 'number' ? formatNumber(value) : value;
