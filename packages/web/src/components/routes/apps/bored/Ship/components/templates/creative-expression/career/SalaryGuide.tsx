import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface SalaryEntry {
  level: string;
  salary: string;
  location: string;
}

export const SalaryGuide: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Salary Guide';
  const role = (data.role as string) ?? '';
  const entries = (data.entries as SalaryEntry[]) ?? [];
  const note = (data.note as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-primary mb-0.5 text-4xl font-bold'>{title}</h1>
      {role && <p className='badge badge-secondary mb-3'>{role}</p>}
      <div className='w-full max-w-lg overflow-hidden rounded-lg'>
        <table className='text-base-content table w-full text-sm'>
          <thead>
            <tr className='bg-primary text-primary-content'>
              <th className='text-xs'>Level</th>
              <th className='text-xs'>Salary</th>
              <th className='text-xs'>Location</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-base-200' : 'bg-base-100'}>
                <td className='font-medium'>{entry.level}</td>
                <td className='text-secondary font-semibold'>{entry.salary}</td>
                <td className='text-base-content/70'>{entry.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className='text-base-content/50 mt-2 max-w-md text-xs italic'>{note}</p>}
      <Footer citation={citation} />
    </Background>
  );
};
SalaryGuide.displayName = 'SalaryGuide';
