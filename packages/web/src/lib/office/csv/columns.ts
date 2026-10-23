const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const columnToLabel = (index: number): string => {
  let label = '';
  let value = index;
  do {
    label = ALPHABET[value % 26] + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return label;
};

export const columnLabels = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => columnToLabel(index));
