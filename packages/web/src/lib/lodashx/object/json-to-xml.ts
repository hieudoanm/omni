type Primitive = string | number | boolean | Date | null | undefined;

type XMLValue = Primitive | XMLObject | XMLValue[];

type XMLObject = {
  [key: string]: XMLValue;
};

interface ToXMLOptions {
  indent?: boolean;
  indentSize?: number;
  declaration?: boolean;
  rootName?: string;
}

export function toXml(obj: XMLObject, options: ToXMLOptions = {}): string {
  const { indent = true, indentSize = 2, declaration = false, rootName } = options;

  const space = (level: number) => (indent ? ' '.repeat(level * indentSize) : '');

  const newline = indent ? '\n' : '';

  const escapeXML = (value: string): string =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');

  const serialize = (key: string, value: XMLValue, level: number): string => {
    if (value === null || value === undefined) return '';

    if (Array.isArray(value)) {
      return value.map((v) => serialize(key, v, level)).join('');
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date
    ) {
      const content = value instanceof Date ? value.toISOString() : escapeXML(String(value));

      return `${space(level)}<${key}>${content}</${key}>` + newline;
    }

    const attributes: string[] = [];
    const children: string[] = [];

    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey.startsWith('@')) {
        attributes.push(`${childKey.slice(1)}="${escapeXML(String(childValue))}"`);
      } else {
        children.push(serialize(childKey, childValue, level + 1));
      }
    }

    const attrString = attributes.length ? ' ' + attributes.join(' ') : '';

    if (children.length === 0) {
      return `${space(level)}<${key}${attrString} />${newline}`;
    }

    return (
      `${space(level)}<${key}${attrString}>${newline}` +
      children.join('') +
      `${space(level)}</${key}>${newline}`
    );
  };

  const body = Object.entries(obj)
    .map(([key, value]) => serialize(key, value, 0))
    .join('');

  const wrappedBody = rootName
    ? `${space(0)}<${rootName}>${newline}${body}${space(0)}</${rootName}>`
    : body.trimEnd();

  const xmlDecl = declaration ? `<?xml version="1.0" encoding="UTF-8"?>${newline}` : '';

  return xmlDecl + wrappedBody;
}
