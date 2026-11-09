import type { Grid, NumberFormat } from '@/lib/office/csv/types';

export const NUMBER_FORMAT_OPTIONS: { value: NumberFormat; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'number', label: 'Number (0 dp)' },
  { value: 'number2', label: 'Number (2 dp)' },
  { value: 'currency', label: 'Currency ($)' },
  { value: 'percent', label: 'Percent (%)' },
  { value: 'scientific', label: 'Scientific' },
];

export const formatNumber = (value: string, format: NumberFormat): string => {
  if (format === 'general') return value;
  const trimmed = value.trim();
  if (trimmed === '') return value;
  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) return value;
  switch (format) {
    case 'number':
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(numeric);
    case 'number2':
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric);
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(numeric);
    case 'percent':
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric);
    case 'scientific':
      return numeric.toExponential(2).toUpperCase();
    default:
      return value;
  }
};

export const applyNumberFormats = (
  displayGrid: Grid,
  formats: Record<string, NumberFormat> | undefined,
): Grid =>
  displayGrid.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      const format = formats?.[`${rowIndex}:${colIndex}`];
      if (!format || format === 'general') return value;
      return formatNumber(value, format);
    }),
  );
