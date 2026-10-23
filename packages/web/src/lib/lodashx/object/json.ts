import { stringify as toYAML } from 'yaml';
import { toPython } from './json-to-py';
import { toSchema } from './json-to-schema';
import { toTS } from './json-to-ts';
import { toXml } from './json-to-xml';
import { toRust } from './json-to-rs';
import { toJava } from './json-to-java';

export const parseJson = <T = unknown>(text: string, defaultValue: T): T => {
  try {
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('error', error);
    return defaultValue;
  }
};

const jsonSort = (json: string) => {
  const object = JSON.parse(json);
  const keys: string[] = Object.keys(object).sort((a, b) => (a > b ? 1 : -1));
  const sortedObject: Record<string, unknown> = {};
  for (const key of keys) {
    sortedObject[key] = object[key];
  }
  return JSON.stringify(sortedObject, null, 2);
};

const jsonBeautify = (json: string): string => {
  return JSON.stringify(JSON.parse(json), null, 2);
};

const jsonMinify = (json: string): string => {
  return JSON.stringify(JSON.parse(json));
};

const json2java = (data: unknown) => {
  return toJava(data);
};

const json2py = (data: unknown): string => {
  return toPython(data);
};

const json2rs = (data: unknown): string => {
  return toRust(data);
};

const json2ts = (data: unknown): string => {
  return toTS(data);
};

const json2schema = (data: unknown): string => {
  return toSchema(data);
};

const json2xml = (json: string) => {
  return toXml(parseJson(json, {}));
};

const json2yaml = (data: unknown): string => {
  return toYAML(data);
};

export const json = <T extends Record<string, unknown>>(
  data: T | T[],
  defaultValue: T = {} as T,
) => {
  return {
    parse: () => parseJson(JSON.stringify(data), defaultValue),
    format: () => {
      return {
        beautify: () => jsonBeautify(JSON.stringify(data)),
        minify: () => jsonMinify(JSON.stringify(data)),
        sort: () => jsonSort(JSON.stringify(data)),
      };
    },
    convert: (format: 'java' | 'py' | 'rs' | 'ts' | 'xml' | 'yaml' | 'schema'): string => {
      try {
        if (format === 'java') return json2java(data);
        if (format === 'py') return json2py(data);
        if (format === 'rs') return json2rs(data);
        if (format === 'ts') return json2ts(data);
        if (format === 'xml') return json2xml(JSON.stringify(data));
        if (format === 'yaml') return json2yaml(data);
        if (format === 'schema') return json2schema(data);
        return 'Invalid Format';
      } catch (error) {
        console.error(error);
        return (error as Error).message;
      }
    },
  };
};
