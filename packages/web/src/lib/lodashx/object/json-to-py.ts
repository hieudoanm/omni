export const toPython = (data: unknown, rootName = 'Root'): string => {
  const indent = (level: number) => ' '.repeat(level * 4);

  const parseType = (value: unknown): string => {
    if (value === null) return 'Any';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'List[Any]';

      const types = [...new Set(value.map(parseType))];
      return types.length === 1 ? `List[${types[0]}]` : `List[Union[${types.join(', ')}]]`;
    }

    if (typeof value === 'object') {
      return 'dict';
    }

    if (typeof value === 'string') return 'str';
    if (typeof value === 'number') return 'float';
    if (typeof value === 'boolean') return 'bool';

    return 'Any';
  };

  const classes: string[] = [];

  const parseObject = (obj: Record<string, unknown>, className: string, level = 0) => {
    const lines: string[] = [];

    lines.push(`${indent(level)}@dataclass`);
    lines.push(`${indent(level)}class ${className}:`);

    const entries = Object.entries(obj);

    if (entries.length === 0) {
      lines.push(`${indent(level + 1)}pass`);
    }

    for (const [key, value] of entries) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedName = className + key.charAt(0).toUpperCase() + key.slice(1);

        parseObject(value as Record<string, unknown>, nestedName, level);

        lines.push(`${indent(level + 1)}${key}: ${nestedName}`);
      } else {
        const optional = value === null ? ' | None' : '';
        const type = parseType(value);

        lines.push(`${indent(level + 1)}${key}: ${type}${optional}`);
      }
    }

    classes.push(lines.join('\n'));
  };

  parseObject(data as Record<string, unknown>, rootName);

  return `from dataclasses import dataclass
from typing import List, Union, Any

${classes.join('\n\n')}`;
};
