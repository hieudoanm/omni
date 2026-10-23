import type { SelectionEdit } from '@/lib/office/md/format';

export type CaseKind = 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab';

export const toTitleCase = (text: string): string =>
  text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

export const toCamelCase = (text: string): string =>
  text.replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase());

export const toSnakeCase = (text: string): string => text.replace(/\s+/g, '_').toLowerCase();

export const toKebabCase = (text: string): string => text.replace(/\s+/g, '-').toLowerCase();

const CONVERTERS: Record<CaseKind, (text: string) => string> = {
  upper: (text) => text.toUpperCase(),
  lower: (text) => text.toLowerCase(),
  title: toTitleCase,
  camel: toCamelCase,
  snake: toSnakeCase,
  kebab: toKebabCase,
};

export const applyCase = (
  doc: string,
  start: number,
  end: number,
  kind: CaseKind,
): SelectionEdit => {
  const convert = CONVERTERS[kind];
  const hasSelection = start !== end;
  const targetStart = hasSelection ? start : 0;
  const targetEnd = hasSelection ? end : doc.length;
  const converted = convert(doc.slice(targetStart, targetEnd));

  return {
    text: `${doc.slice(0, targetStart)}${converted}${doc.slice(targetEnd)}`,
    selectionStart: targetStart,
    selectionEnd: targetStart + converted.length,
  };
};
