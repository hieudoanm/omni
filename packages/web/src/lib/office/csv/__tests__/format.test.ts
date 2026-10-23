import { NUMBER_FORMAT_OPTIONS, applyNumberFormats, formatNumber } from '@/lib/office/csv/format';

describe('formatNumber', () => {
  it('returns the raw value for the general format', () => {
    expect(formatNumber('42.5', 'general')).toBe('42.5');
  });

  it('formats integers with thousands separators', () => {
    expect(formatNumber('1234567', 'number')).toBe('1,234,567');
  });

  it('formats with two decimal places', () => {
    expect(formatNumber('1234.5', 'number2')).toBe('1,234.50');
  });

  it('formats as USD currency', () => {
    expect(formatNumber('12.5', 'currency')).toBe('$12.50');
  });

  it('formats as a percentage', () => {
    expect(formatNumber('0.125', 'percent')).toBe('12.50%');
  });

  it('formats in scientific notation', () => {
    expect(formatNumber('12345', 'scientific')).toBe('1.23E+4');
  });

  it('leaves empty and non-numeric values unchanged', () => {
    expect(formatNumber('', 'currency')).toBe('');
    expect(formatNumber('  ', 'number')).toBe('  ');
    expect(formatNumber('abc', 'percent')).toBe('abc');
    expect(formatNumber('=', 'scientific')).toBe('=');
  });

  it('falls back to the raw value for an unknown format', () => {
    expect(formatNumber('42', 'bogus' as never)).toBe('42');
  });
});

describe('applyNumberFormats', () => {
  it('applies per-cell formats by row:col key', () => {
    const grid = [
      ['1234', 'x'],
      ['0.5', '=SUM'],
    ];
    expect(
      applyNumberFormats(grid, {
        '0:0': 'number',
        '1:0': 'percent',
      }),
    ).toEqual([
      ['1,234', 'x'],
      ['50.00%', '=SUM'],
    ]);
  });

  it('leaves cells without a format untouched', () => {
    const grid = [['1234']];
    expect(applyNumberFormats(grid, undefined)).toEqual(grid);
    expect(applyNumberFormats(grid, {})).toEqual(grid);
  });
});

describe('NUMBER_FORMAT_OPTIONS', () => {
  it('lists every supported format with a label', () => {
    const values = NUMBER_FORMAT_OPTIONS.map((option) => option.value);
    expect(values).toEqual(['general', 'number', 'number2', 'currency', 'percent', 'scientific']);
    expect(NUMBER_FORMAT_OPTIONS.every((option) => option.label.length > 0)).toBe(true);
  });
});
