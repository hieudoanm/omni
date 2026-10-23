import { JsonObject, JsonValue, StackFrame, OpenAPISpec } from '../types';

export const parseYAML = (text: string): JsonObject => {
  const lines = text.split('\n');
  const root: JsonObject = {};
  const stack: StackFrame[] = [{ obj: root, indent: -1 }];

  lines.forEach((raw) => {
    if (!raw.trim() || raw.trim().startsWith('#')) return;
    const indent = raw.search(/\S/);
    const content = raw.trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;

    if (content.startsWith('- ')) {
      const key = Object.keys(parent)[Object.keys(parent).length - 1];
      if (!Array.isArray(parent[key])) parent[key] = [];
      const arr = parent[key] as JsonValue[];
      const val = content.slice(2).trim();
      if (val.includes(': ')) {
        const obj: JsonObject = {};
        const [k, v] = val.split(/:\s+(.+)/);
        obj[k] = v;
        arr.push(obj);
        stack.push({ obj, indent });
      } else if (val) {
        arr.push(val);
      } else {
        const obj: JsonObject = {};
        arr.push(obj);
        stack.push({ obj, indent });
      }
    } else if (content.includes(': ')) {
      const colonIdx = content.indexOf(': ');
      const k = content.slice(0, colonIdx).replace(/^['"]|['"]$/g, '');
      const rawV = content
        .slice(colonIdx + 2)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      if (rawV === '' || rawV === '|' || rawV === '>') {
        const obj: JsonObject = {};
        parent[k] = obj;
        stack.push({ obj, indent });
      } else {
        parent[k] =
          rawV === 'true'
            ? true
            : rawV === 'false'
              ? false
              : !isNaN(Number(rawV))
                ? Number(rawV)
                : rawV;
      }
    } else if (content.endsWith(':')) {
      const k = content.slice(0, -1).replace(/^['"]|['"]$/g, '');
      const obj: JsonObject = {};
      parent[k] = obj;
      stack.push({ obj, indent });
    }
  });
  return root;
};

export const parseOpenAPI = (text: string): OpenAPISpec => {
  try {
    return JSON.parse(text) as OpenAPISpec;
  } catch {
    return parseYAML(text) as unknown as OpenAPISpec;
  }
};
