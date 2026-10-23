import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Column {
  name: string;
  type: string;
  pk?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
}

export const DatabaseSchema: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Database Schema';
  const tables = (data.tables as Table[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>Schema</h2>
        {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
      </div>
      <div className='flex flex-1 flex-wrap justify-center gap-2'>
        {tables.map((table) => (
          <div key={table.name} className='border-base-300 w-[45%] min-w-[180px] rounded-xl border'>
            <h4 className='bg-primary/10 text-primary rounded-t px-3 py-1.5 text-sm font-bold'>
              {table.name}
            </h4>
            <ul className='p-1'>
              {table.columns.map((col) => (
                <li
                  key={col.name}
                  className='border-base-300 flex items-center justify-between border-t py-1'>
                  <span className='text-base-content text-[10px]'>
                    {col.pk && <span className='mr-1'>&#128273;</span>}
                    {col.name}
                  </span>
                  <span className='text-neutral font-mono text-[9px]'>{col.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

DatabaseSchema.displayName = 'DatabaseSchema';
