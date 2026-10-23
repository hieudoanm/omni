import { JsonObject, JsonValue, OpenAPISchema, OpenAPISpec } from '../types';

export const resolveRef = (schema: OpenAPISchema | undefined, root: OpenAPISpec): OpenAPISchema => {
  if (!schema || typeof schema !== 'object') return schema ?? {};
  if (!schema.$ref) return schema;
  const parts = schema.$ref.replace(/^#\//, '').split('/');
  let cur: JsonValue = root as unknown as JsonValue;
  for (const p of parts) cur = (cur as JsonObject)?.[p] ?? null;
  return (cur as unknown as OpenAPISchema) || {};
};

export const schemaToExample = (
  schema: OpenAPISchema | undefined,
  root: OpenAPISpec,
  depth = 0,
): JsonValue => {
  if (depth > 5 || !schema) return null;
  const s = resolveRef(schema, root);
  if (s.example !== undefined) return s.example;
  if (s.default !== undefined) return s.default;
  switch (s.type) {
    case 'string':
      return s.enum ? s.enum[0] : 'string';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'array': {
      const item = schemaToExample(s.items, root, depth + 1);
      return item !== null ? [item] : [];
    }
    case 'object':
    default: {
      if (!s.properties) return null;
      const obj: JsonObject = {};
      Object.entries(s.properties).forEach(([k, v]) => {
        obj[k] = schemaToExample(v, root, depth + 1);
      });
      return obj;
    }
  }
};
