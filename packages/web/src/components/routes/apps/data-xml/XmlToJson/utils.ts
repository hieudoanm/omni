export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const xmlToJson = (xml: string): any => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const walk = (node: Element): any => {
    const obj: any = {};
    if (node.attributes.length > 0) {
      for (let i = 0; i < node.attributes.length; i++) {
        obj[`@${node.attributes[i].name}`] = node.attributes[i].value;
      }
    }
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const val = child.children.length > 0 ? walk(child) : child.textContent;
      if (obj[child.tagName]) {
        if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [obj[child.tagName]];
        obj[child.tagName].push(val);
      } else obj[child.tagName] = val;
    }
    if (node.textContent?.trim() && Object.keys(obj).length === 0) return node.textContent.trim();
    return obj;
  };
  return walk(doc.documentElement);
};

export const readFileAsText = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsText(file);
  });
