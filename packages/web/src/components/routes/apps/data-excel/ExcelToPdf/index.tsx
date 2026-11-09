'use client';

import { FC, useState, useCallback, useRef } from 'react';
import { Dropzone } from '@/components/atoms';
import { Row, downloadBlob } from './utils';

export const ExcelToPdf: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const XLSX = await import('@e965/xlsx');
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Row[];
      if (json.length > 0) {
        setCols(Object.keys(json[0]));
      }
      setRows(json);
    } catch {
      setError('Failed to parse Excel file');
    }
    setLoading(false);
  }, []);

  const exportPdf = useCallback(() => {
    if (rows.length === 0) return;
    const table = tableRef.current;
    if (!table) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Excel Export</title>
      <style>table { border-collapse: collapse; width: 100%; font: 12px monospace; }
      th, td { border: 1px solid #999; padding: 4px 8px; text-align: left; }
      th { background: #eee; }</style></head>
      <body>${table.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [rows]);

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='flex flex-col gap-4 overflow-auto p-6'>
        <Dropzone accept='.xlsx,.xls' onFile={handleFile} />
        {loading && <span className='loading loading-spinner' />}
        {error && <p className='text-base-content/60 text-xs'>{error}</p>}
        {rows.length > 0 && (
          <>
            <div className='flex items-center justify-between'>
              <p className='text-base-content/40 text-xs'>
                {rows.length} rows × {cols.length} cols
              </p>
              <button className='btn btn-primary btn-sm' onClick={exportPdf}>
                Print as PDF
              </button>
            </div>
            <div ref={tableRef} className='overflow-auto'>
              <table className='table-zebra table-xs table'>
                <thead>
                  <tr>
                    {cols.map((c) => (
                      <th key={c} className='text-xs'>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row, i) => (
                    <tr key={i}>
                      {cols.map((c) => (
                        <td key={c} className='text-xs'>
                          {row[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 100 && (
                <p className='text-base-content/40 mt-2 text-center text-xs'>
                  Showing first 100 of {rows.length} rows
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
ExcelToPdf.displayName = 'ExcelToPdf';
