'use client';

import { FC, useState } from 'react';
import { Dropzone } from '@/components/atoms';
import { downloadBlob, readFile } from './utils';

export const SplitExcel: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rowsPerFile, setRowsPerFile] = useState(100);
  const [fileCount, setFileCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSplit = async (file: File) => {
    setLoading(true);
    setError(null);
    setFileCount(0);
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
      const header = rows[0];
      const dataRows = rows.slice(1);
      let count = 0;
      for (let i = 0; i < dataRows.length; i += rowsPerFile) {
        const chunk = [header, ...dataRows.slice(i, i + rowsPerFile)];
        const nw = XLSX.utils.book_new();
        const ns = XLSX.utils.aoa_to_sheet(chunk);
        XLSX.utils.book_append_sheet(nw, ns, 'Sheet1');
        const out = XLSX.write(nw, { bookType: 'xlsx', type: 'array' });
        downloadBlob(
          new Blob([out]),
          `${file.name.replace(/\.\w+$/, '')}_part${Math.floor(i / rowsPerFile) + 1}.xlsx`,
        );
        count++;
      }
      setFileCount(count);
    } catch (err) {
      console.error(err);
      setError('Failed to split Excel file.');
    }
    setLoading(false);
  };

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4'>
        <label className='flex flex-col gap-1'>
          <span className='text-sm'>Rows per file:</span>
          <input
            type='number'
            className='input input-bordered'
            min={1}
            value={rowsPerFile}
            onChange={(e) => setRowsPerFile(Math.max(1, Number(e.target.value)))}
          />
        </label>
        <Dropzone accept='.xlsx,.xls' onFile={handleSplit} />
        {loading && <span className='loading loading-spinner' />}
        {error && <p className='text-base-content/60 text-sm'>{error}</p>}
        {fileCount > 0 && <p className='text-sm'>Split into {fileCount} files.</p>}
      </div>
    </div>
  );
};
SplitExcel.displayName = 'SplitExcel';
