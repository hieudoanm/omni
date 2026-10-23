import {
  OpenAPISpec,
  PostmanBody,
  PostmanCollection,
  PostmanHeader,
  PostmanItem,
  PostmanQueryParam,
  PostmanVariable,
} from '../types';
import { schemaToExample } from './schemaHelpers';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

export const convertToPostman = (spec: OpenAPISpec): PostmanCollection => {
  const info = {
    name: spec.info?.title ?? 'Imported Collection',
    _postman_id: crypto.randomUUID(),
    description: spec.info?.description ?? '',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  };

  const baseUrl = spec.servers?.[0]?.url ?? '';
  const tagMap: Record<string, PostmanItem[]> = {};

  Object.entries(spec.paths ?? {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, op]) => {
      if (!HTTP_METHODS.includes(method)) return;
      const tag = op.tags?.[0] ?? 'default';
      if (!tagMap[tag]) tagMap[tag] = [];
      const rawUrl = `${baseUrl}${path}`;
      const pathParts = rawUrl
        .split('?')[0]
        .replace(/^https?:\/\/[^/]+/, '')
        .split('/')
        .filter(Boolean);
      const host = rawUrl.match(/^https?:\/\/([^/]+)/)?.[1]?.split('.') ?? ['{{baseUrl}}'];
      const params = op.parameters ?? [];

      const query: PostmanQueryParam[] = params
        .filter((p) => p.in === 'query')
        .map((p) => ({
          key: p.name,
          value: p.example !== undefined ? String(p.example) : '',
          description: p.description ?? '',
          disabled: !p.required,
        }));

      const variable: PostmanVariable[] = params
        .filter((p) => p.in === 'path')
        .map((p) => ({
          key: p.name,
          value: p.example !== undefined ? String(p.example) : p.name,
          description: p.description ?? '',
        }));

      const header: PostmanHeader[] = params
        .filter((p) => p.in === 'header')
        .map((p) => ({
          key: p.name,
          value: p.example !== undefined ? String(p.example) : '',
          description: p.description ?? '',
        }));

      let body: PostmanBody | undefined;
      const content = op.requestBody?.content ?? {};
      if (content['application/json']) {
        const mt = content['application/json'];
        const example =
          mt.example ??
          (mt.examples ? Object.values(mt.examples)[0]?.value : null) ??
          schemaToExample(mt.schema, spec);
        body = {
          mode: 'raw',
          raw: JSON.stringify(example, null, 2),
          options: { raw: { language: 'json' } },
        };
        header.push({ key: 'Content-Type', value: 'application/json' });
      } else if (content['application/x-www-form-urlencoded']) {
        const props = content['application/x-www-form-urlencoded'].schema?.properties ?? {};
        body = {
          mode: 'urlencoded',
          urlencoded: Object.entries(props).map(([k, v]) => ({
            key: k,
            value: v.example !== undefined ? String(v.example) : '',
            description: v.description ?? '',
          })),
        };
      } else if (content['multipart/form-data']) {
        const props = content['multipart/form-data'].schema?.properties ?? {};
        body = {
          mode: 'formdata',
          formdata: Object.entries(props).map(([k, v]) => ({
            key: k,
            value: v.example !== undefined ? String(v.example) : '',
            description: v.description ?? '',
            type: v.format === 'binary' ? 'file' : 'text',
          })),
        };
      }

      tagMap[tag].push({
        name: op.summary ?? op.operationId ?? `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header,
          url: {
            raw: rawUrl,
            protocol: rawUrl.startsWith('https') ? 'https' : 'http',
            host,
            path: pathParts,
            query,
            variable,
          },
          ...(body ? { body } : {}),
          description: op.description ?? '',
        },
        response: [],
      });
    });
  });

  return {
    info,
    item: Object.entries(tagMap).map(([name, items]) => ({
      name,
      item: items,
    })),
    variable: [{ key: 'baseUrl', value: baseUrl, type: 'string' }],
  };
};
