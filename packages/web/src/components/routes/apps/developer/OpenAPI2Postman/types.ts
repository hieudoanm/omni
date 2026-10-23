export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface StackFrame {
  obj: JsonObject;
  indent: number;
}

export interface OpenAPISchema {
  $ref?: string;
  type?: string;
  example?: JsonValue;
  default?: JsonValue;
  enum?: JsonValue[];
  items?: OpenAPISchema;
  properties?: Record<string, OpenAPISchema>;
  format?: string;
  description?: string;
}

export interface OpenAPIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  example?: JsonValue;
  schema?: OpenAPISchema;
}

export interface OpenAPIMediaType {
  schema?: OpenAPISchema;
  example?: JsonValue;
  examples?: Record<string, { value?: JsonValue }>;
}

export interface OpenAPIOperation {
  summary?: string;
  operationId?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, OpenAPIMediaType>;
  };
  responses?: Record<string, { description?: string }>;
}

export interface OpenAPISpec {
  openapi?: string;
  info?: { title?: string; description?: string; version?: string };
  servers?: { url: string }[];
  paths?: Record<string, Record<string, OpenAPIOperation>>;
  components?: { schemas?: Record<string, OpenAPISchema> };
}

export interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
}
export interface PostmanQueryParam {
  key: string;
  value: string;
  description?: string;
  disabled?: boolean;
}
export interface PostmanVariable {
  key: string;
  value: string;
  description?: string;
  type?: string;
}

export interface PostmanBody {
  mode: 'raw' | 'urlencoded' | 'formdata';
  raw?: string;
  options?: { raw: { language: string } };
  urlencoded?: { key: string; value: string; description: string }[];
  formdata?: {
    key: string;
    value: string;
    description: string;
    type: string;
  }[];
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  url: {
    raw: string;
    protocol: string;
    host: string[];
    path: string[];
    query: PostmanQueryParam[];
    variable: PostmanVariable[];
  };
  body?: PostmanBody;
  description?: string;
}

export interface PostmanItem {
  name: string;
  request: PostmanRequest;
  response: unknown[];
}
export interface PostmanFolder {
  name: string;
  item: PostmanItem[];
}

export interface PostmanCollection {
  info: {
    name: string;
    _postman_id: string;
    description: string;
    schema: string;
  };
  item: PostmanFolder[];
  variable: PostmanVariable[];
}
