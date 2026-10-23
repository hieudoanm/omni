export const toRust = (data: unknown, rootName = 'Root'): string => {
  const indent = (level: number) => ' '.repeat(level * 4);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const parseType = (value: unknown, key?: string): string => {
    if (value === null) return 'Option<serde_json::Value>';

    if (Array.isArray(value)) {
      if (value.length === 0) return 'Vec<serde_json::Value>';

      const types = [...new Set(value.map((v) => parseType(v)))];

      return types.length === 1 ? `Vec<${types[0]}>` : `Vec<serde_json::Value>`;
    }

    if (typeof value === 'object') {
      return key ? capitalize(key) : 'serde_json::Value';
    }

    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'i64' : 'f64';
    if (typeof value === 'boolean') return 'bool';

    return 'serde_json::Value';
  };

  const structs: string[] = [];
  const visited = new Set<string>();

  const parseObject = (obj: Record<string, unknown>, structName: string) => {
    if (visited.has(structName)) return;
    visited.add(structName);

    const lines: string[] = [];

    lines.push(`# [derive(Debug, Serialize, Deserialize)]`);
    lines.push(`pub struct ${structName} {`);

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

      if (value === null) {
        fieldType = `Option<${fieldType.replace(
          'Option<serde_json::Value>',
          'serde_json::Value',
        )}>`;
      }

      const safeKey = key === 'type' ? 'r#type' : key;

      lines.push(`${indent(1)}pub ${safeKey}: ${fieldType},`);
    }

    lines.push(`}`);

    structs.push(lines.join('\n'));
  };

  parseObject(data as Record<string, unknown>, rootName);

  return `use serde::{Serialize, Deserialize};

${structs.join('\n\n')}`;
};
