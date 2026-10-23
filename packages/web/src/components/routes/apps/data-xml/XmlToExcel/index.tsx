'use client';

import { FC, useState } from 'react';
import { Dropzone } from '@/components/atoms';
import { downloadBlob, readFileAsText } from './utils';

export const XmlToExcel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const XLSX = await import('@e965/xlsx');
      const text = await readFileAsText(file);
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const rows: string[][] = [['Tag', 'Attribute', 'Value']];
      const walk = (node: Element, path: string) => {
        for (let i = 0; i < node.attributes.length; i++) {
          rows.push([path, node.attributes[i].name, node.attributes[i].value]);
        }
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.children.length === 0 && child.textContent) {
            rows.push([`${path}/${child.tagName}`, '', child.textContent]);
          } else walk(child, `${path}/${child.tagName}`);
        }
      };
      walk(doc.documentElement, doc.documentElement.tagName);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      downloadBlob(new Blob([out]), file.name.replace('.xml', '.xlsx'));
    } catch (err) {
      console.error(err);
      setError('Failed to convert XML to Excel.');
    }
    setLoading(false);
  };

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <Dropzone accept='.xml' onFile={handleConvert} />
        {loading && <span className='loading loading-spinner' />}
        {error && <p className='text-base-content/60 text-sm'>{error}</p>}
      </div>
    </div>
  );
};
XmlToExcel.displayName = 'XmlToExcel';
