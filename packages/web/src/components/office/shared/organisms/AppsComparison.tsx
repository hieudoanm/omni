'use client';

import { FC } from 'react';

const ROWS: { label: string; google: string; microsoft: string }[] = [
  {
    label: 'Calendar',
    google: 'Google Calendar',
    microsoft: 'Microsoft (Outlook) Calendar',
  },
  { label: 'CSV', google: 'Google Sheets', microsoft: 'Microsoft Excel' },
  { label: 'Markdown', google: 'Google Docs', microsoft: 'Microsoft Word' },
  { label: 'Tasks', google: 'Google Tasks', microsoft: 'Microsoft To Do' },
];

export const AppsComparison: FC = () => (
  <section className='mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6'>
    <div className='text-center'>
      <h2 className='text-base-content text-lg font-bold'>Comparison</h2>
      <p className='text-base-content/60 text-xs'>
        How each Office sub-app maps to Google Workspace and Microsoft Office
      </p>
    </div>
    <div className='bg-base-200 border-base-content/10 mt-4 overflow-x-auto rounded-xl border'>
      <table className='table w-full'>
        <thead>
          <tr>
            <th>Office</th>
            <th>Google Workspace</th>
            <th>Microsoft Office</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className='font-medium'>{row.label}</td>
              <td>{row.google}</td>
              <td>{row.microsoft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

AppsComparison.displayName = 'AppsComparison';
