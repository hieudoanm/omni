import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export const Certifications: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Certifications';
  const certs = (data.certs as Certification[]) ?? [
    {
      name: 'Google UX Design Professional',
      issuer: 'Google',
      date: '2023',
      credentialId: 'GUXD-12345',
    },
    {
      name: 'AWS Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2022',
      credentialId: 'AWS-CP-67890',
    },
    {
      name: 'Certified Scrum Master',
      issuer: 'Scrum Alliance',
      date: '2021',
    },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-accent mb-2 text-xs font-bold tracking-[0.2em] uppercase'>{title}</h2>

      <ul className='flex flex-1 flex-col gap-1'>
        {certs.map((c, i) => (
          <li key={i} className='rounded-2xl border border-[#e5e7eb] p-2'>
            <div className='flex items-start justify-between'>
              <span className='text-base-content text-xs font-bold'>
                <strong>{c.name}</strong>
              </span>
              <time className='text-accent bg-accent/10 rounded px-2 py-0.5 text-xs font-semibold'>
                {c.date}
              </time>
            </div>
            <span className='text-neutral mt-1 block text-xs'>{c.issuer}</span>
            {c.credentialId && (
              <span className='text-neutral mt-1 block font-mono text-xs'>
                ID: {c.credentialId}
              </span>
            )}
          </li>
        ))}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

Certifications.displayName = 'Certifications';
