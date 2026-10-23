import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const DataTable: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Data Overview';
  const columns = (data.columns as string[]) ?? ['Name', 'Category', 'Value', 'Status'];
  const rows = (data.rows as string[][]) ?? [
    ['Project Alpha', 'Design', '85%', 'Active'],
    ['Project Beta', 'Dev', '72%', 'Pending'],
    ['Project Gamma', 'Marketing', '91%', 'Complete'],
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-4'>
        <Header title={title} />
        <div className='border-base-300 flex-1 overflow-hidden rounded border'>
          <table className='w-full text-left text-[10px]'>
            <thead>
              <tr className='bg-primary/10'>
                {columns.map((col, i) => (
                  <th key={i} className='text-primary px-3 py-2 font-bold'>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-base-300 border-t ${i % 2 === 0 ? 'bg-base-200/50' : ''}`}>
                  {row.map((cell, j) => (
                    <td key={j} className='text-base-content px-3 py-2'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

DataTable.displayName = 'DataTable';
