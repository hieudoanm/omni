'use client';

import { FC, useState } from 'react';
import { Dropzone } from '@/components/atoms';
import { downloadBlob, xmlToJson, readFileAsText } from './utils';

export const XmlToJson: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await readFileAsText(file);
      const json = xmlToJson(text);
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json',
      });
      downloadBlob(blob, file.name.replace('.xml', '.json'));
    } catch (err) {
      console.error(err);
      setError('Failed to convert XML to JSON.');
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
XmlToJson.displayName = 'XmlToJson';
