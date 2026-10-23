export const toSchema = (data: unknown, rootName = 'Root', indentSize = 2): string => {
  const buildType = (value: unknown): Record<string, unknown> => {
    if (value === null) return { type: 'null' };

    if (Array.isArray(value)) {
      if (value.length === 0) return { type: 'array', items: {} };

      const itemSchemas = value.map((v) => buildType(v));
      const merged = mergeSchemas(itemSchemas);
      return { type: 'array', items: merged };
    }

    if (typeof value === 'object') {
      return buildObjectSchema(value as Record<string, unknown>);
    }

    if (typeof value === 'string') return { type: 'string' };
    if (typeof value === 'number') {
      return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' };
    }
    if (typeof value === 'boolean') return { type: 'boolean' };

    return {};
  };

  const buildObjectSchema = (obj: Record<string, unknown>): Record<string, unknown> => {
    const required: string[] = [];
    const properties: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== null) required.push(key);
      properties[key] = value === null ? { type: 'null' } : buildType(value);
    }

    const schema: Record<string, unknown> = {
      type: 'object',
      properties,
    };

    if (required.length > 0) schema.required = required;

    return schema;
  };

  const mergeSchemas = (schemas: Record<string, unknown>[]): Record<string, unknown> => {
    if (schemas.length === 1) return schemas[0]!;

    const types = [...new Set(schemas.map((s) => s.type as string))];

    if (types.length === 1 && types[0] === 'object') {
      const allKeys = [
        ...new Set(
          schemas.flatMap((s) => Object.keys((s.properties as Record<string, unknown>) ?? {})),
        ),
      ];

      const merged: Record<string, unknown> = {
        type: 'object',
        properties: {},
      };
      const required: string[] = [];

      for (const key of allKeys) {
        const keySchemas = schemas
          .map((s) => (s.properties as Record<string, unknown> | undefined)?.[key])
          .filter((s): s is Record<string, unknown> => s !== undefined);

        if (keySchemas.length === schemas.length) required.push(key);
        (merged.properties as Record<string, unknown>)[key] =
          keySchemas.length > 0 ? mergeSchemas(keySchemas) : {};
      }

      if (required.length > 0) merged.required = required;
      return merged;
    }

    if (types.length === 1) return { type: types[0] };

    return { oneOf: types.map((t) => ({ type: t })) };
  };

  const root = buildType(data);
  const $id = rootName;

  return JSON.stringify(
    {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id,
      title: rootName,
      ...root,
    },
    null,
    indentSize,
  );
};
