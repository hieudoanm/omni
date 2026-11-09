export interface TemplateDef {
  id: string;
  label: string;
  description: string;
  category: string;
  group: string;
  schema: FieldDef[];
  defaultContent: Record<string, unknown>;
}

export interface FieldDef {
  key: string;
  type: string;
  description: string;
}

export interface PostItem {
  id: string;
  templateId: string;
  content: Record<string, unknown>;
  label?: string;
}
