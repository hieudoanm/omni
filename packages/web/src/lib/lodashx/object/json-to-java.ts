export const toJava = (data: unknown, rootName = 'Root'): string => {
  const indent = (level: number) => '    '.repeat(level);
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const parseType = (value: unknown, key?: string): string => {
    if (value === null) return 'Object';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'List<Object>';

      const types = [...new Set(value.map((v) => parseType(v)))];

      return types.length === 1 ? `List<${types[0]}>` : 'List<Object>';
    }

    if (typeof value === 'object') {
      return key ? capitalize(key) : 'Object';
    }

    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
    if (typeof value === 'boolean') return 'boolean';

    return 'Object';
  };

  const classes: string[] = [];
  const visited = new Set<string>();

  const parseObject = (obj: Record<string, unknown>, className: string) => {
    if (visited.has(className)) return;
    visited.add(className);

    const lines: string[] = [];
    lines.push(`public class ${className} {`);

    const entries = Object.entries(obj);

    if (entries.length === 0) {
      lines.push(`${indent(1)}// empty`);
    }

    for (const [key, value] of entries) {
      let fieldType: string;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedName = capitalize(key);
        parseObject(value as Record<string, unknown>, nestedName);
        fieldType = nestedName;
      } else {
        fieldType = parseType(value, key);
      }

      const nullable = value === null ? ' @Nullable' : '';
      lines.push(`${indent(1)}${nullable} private ${fieldType} ${key};`);
    }

    lines.push(`}`);

    classes.push(lines.join('\n'));
  };

  parseObject(data as Record<string, unknown>, rootName);

  return `import java.util.List;
import javax.annotation.Nullable;

${classes.join('\n\n')}`;
};
