'use client';

import { FC, useState } from 'react';
import { Dropzone } from '@/components/atoms';
import { downloadBlob, readFile } from './utils';

export const ExcelToXml: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const XLSX = await import('@e965/xlsx');
      const buf = await readFile(file);
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
        header: 1,
      }) as string[][];
      if (rows.length < 2) {
        setLoading(false);
        return;
      }
      const headers = rows[0];
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
      for (let i = 1; i < rows.length; i++) {
        xml += '  <row>\n';
        for (let j = 0; j < headers.length && j < rows[i].length; j++) {
          xml += `    <${headers[j]}>${rows[i][j]}</${headers[j]}>\n`;
        }
        xml += '  </row>\n';
      }
      xml += '</root>';
      downloadBlob(new Blob([xml], { type: 'text/xml' }), file.name.replace(/\.\w+$/, '.xml'));
    } catch (err) {
      console.error(err);
      setError('Failed to convert Excel to XML.');
    }
    setLoading(false);
  };

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <Dropzone accept='.xlsx,.xls' onFile={handleConvert} />
        {loading && <span className='loading loading-spinner' />}
        {error && <p className='text-base-content/60 text-sm'>{error}</p>}
      </div>
    </div>
  );
};
ExcelToXml.displayName = 'ExcelToXml';
