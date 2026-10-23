import { Dropzone } from '@/components/atoms';
import { FC, useCallback, useState } from 'react';
import { FileEntry, createZipBlob, downloadBlob } from './utils';

export const CreateZip: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [zipName, setZipName] = useState('archive.zip');

  const handleAddFile = useCallback((f: File) => {
    setFiles((prev) => [...prev, { file: f, name: f.name }]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const createZip = useCallback(async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const blob = await createZipBlob(files);
      downloadBlob(blob, zipName);
    } catch (err) {
      alert('Failed to create ZIP: ' + (err instanceof Error ? err.message : 'unknown error'));
    }
    setLoading(false);
  }, [files, zipName]);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <Dropzone multiple onFile={handleAddFile} />

        <label className='flex items-center gap-2 text-sm'>
          <span>Archive name:</span>
          <input
            type='text'
            className='input input-bordered input-sm flex-1 font-mono text-xs'
            value={zipName}
            onChange={(e) => setZipName(e.target.value)}
          />
        </label>

        {files.length > 0 && (
          <div className='bg-base-200 max-h-40 overflow-auto rounded p-2'>
            {files.map((f, i) => (
              <div key={i} className='flex items-center justify-between py-1 text-xs'>
                <span className='truncate font-mono'>{f.name}</span>
                <span className='text-base-content/40'>{(f.file.size / 1024).toFixed(1)} KB</span>
                <button
                  className='btn btn-ghost btn-xs text-base-content/60'
                  onClick={() => removeFile(i)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className='btn btn-primary btn-sm'
          disabled={files.length === 0 || loading}
          onClick={createZip}>
          {loading ? (
            <span className='loading loading-spinner' />
          ) : (
            `Create ZIP (${files.length} files)`
          )}
        </button>
      </div>
    </div>
  );
};

CreateZip.displayName = 'CreateZip';
