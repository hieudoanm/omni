import { LanguageExt, DataFormatExt, TabExt } from './types';

export const INITIAL_JSON = {
  id: 1,
  name: 'John Doe',
  active: true,
  age: 30,
  balance: 1234.56,
  tags: ['dev', 'typescript', 'json'],
  address: { street: '123 Main St', city: 'HCM', zip: '700000' },
  createdAt: '2024-01-01T12:00:00Z',
  nullable: null,
  nested: [
    { id: 1, value: 'A' },
    { id: 2, value: 'B' },
  ],
};

export const LANGUAGE_TABS: LanguageExt[] = ['java', 'py', 'rs', 'ts'];
export const DATA_FORMAT_TABS: DataFormatExt[] = ['json', 'xml', 'yaml'];
export const TAB_LABELS: Record<TabExt, string> = {
  java: 'Java',
  py: 'Python',
  rs: 'Rust',
  ts: 'TypeScript',
  json: 'JSON',
  xml: 'XML',
  yaml: 'YAML',
};
