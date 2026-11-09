export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

export const jsonToXml = (json: string): string => {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return '<root></root>';
  const keys = Object.keys(arr[0]);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  for (const item of arr) {
    xml += '  <item>\n';
    for (const k of keys) {
      const safeTag = k.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeVal = String(item[k] ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      xml += `    <${safeTag}>${safeVal}</${safeTag}>\n`;
    }
    xml += '  </item>\n';
  }
  xml += '</root>';
  return xml;
};
