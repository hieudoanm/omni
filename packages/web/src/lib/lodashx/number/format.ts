export const padZero = (number: number, length: number = 2): string => {
  const numberLength: number = number.toString().length;
  const gap: number = length >= numberLength ? length - numberLength : 0;
  return `${'0'.repeat(gap)}${number}`;
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  const formatted = new Intl.NumberFormat('vi', {
    style: 'currency',
    currency,
  }).format(amount);
  return formatted;
};

export const formatComma = (number: number | bigint) => {
  if (typeof number !== 'number' && typeof number !== 'bigint') return '';
  return number.toLocaleString('en-US');
};
