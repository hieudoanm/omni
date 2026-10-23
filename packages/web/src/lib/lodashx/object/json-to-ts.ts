export const toTS = (data: unknown, rootName = 'Root', indentSize = 2): string => {
  const indent = (level: number) => ' '.repeat(level * indentSize);

  const parseType = (value: unknown, level: number): string => {
    if (value === null) return 'null';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';

      const types = [...new Set(value.map((v) => parseType(v, level)))];

      if (types.length === 1) {
        return `${types[0]}[]`;
      }

      return `(${types.join(' | ')})[]`;
    }

    if (typeof value === 'object') {
      return parseObject(value as Record<string, unknown>, level);
    }

    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';

    return 'any';
  };

  const parseObject = (obj: Record<string, unknown>, level: number): string => {
    const entries = Object.entries(obj);

    if (entries.length === 0) return '{}';

    const lines = entries.map(([key, value]) => {
      const optional = value === null ? '?' : '';
      const type = value === null ? 'any' : parseType(value, level + 1);

      return `${indent(level + 1)}${key}${optional}: ${type};`;
    });

    return ['{', ...lines, `${indent(level)}}`].join('\n');
  };

  return `type ${rootName} = ${parseType(data, 0)};\n`;
};
