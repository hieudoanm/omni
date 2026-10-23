import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Param {
  name: string;
  type: string;
  desc: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-success text-success-content',
  POST: 'bg-primary text-primary-content',
  PUT: 'bg-warning text-warning-content',
  DELETE: 'bg-error text-error-content',
  PATCH: 'bg-info text-info-content',
};

export const ApiEndpoint: FC<TemplateProps> = ({ data }) => {
  const method = (data.method as string) ?? 'GET';
  const path = (data.path as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const params = (data.params as Param[]) ?? [];
  const responseExample = (data.responseExample as string) ?? '';

  const color = METHOD_COLORS[method.toUpperCase()] ?? 'bg-neutral text-neutral-content';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>
          API Endpoint
        </h2>
      </div>
      <div className='border-base-300 rounded-xl border p-4'>
        <div className='mb-2 flex items-center gap-1'>
          <span className={`${color} rounded px-2 py-0.5 text-[10px] font-bold tracking-wider`}>
            {method.toUpperCase()}
          </span>
          <span className='text-base-content font-mono text-sm font-semibold'>{path}</span>
        </div>
        {subtitle && <p className='text-neutral mb-2 text-[10px] leading-relaxed'>{subtitle}</p>}
        {params.length > 0 && (
          <div className='mb-2 text-left'>
            <h3 className='text-neutral mb-1 text-[9px] font-bold tracking-wider uppercase'>
              Parameters
            </h3>
            <ul>
              {params.map((p, i) => (
                <li key={i} className='border-base-300 flex gap-1 border-t py-1'>
                  <span className='text-primary font-mono text-[10px] font-semibold'>{p.name}</span>
                  <span className='text-accent text-[9px]'>{p.type}</span>
                  <span className='text-neutral text-[9px]'>{p.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {responseExample && (
          <div className='text-left'>
            <h3 className='text-neutral mb-1 text-[9px] font-bold tracking-wider uppercase'>
              Response
            </h3>
            <pre className='bg-base-200 rounded p-1 font-mono text-[9px] leading-relaxed'>
              {responseExample}
            </pre>
          </div>
        )}
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

ApiEndpoint.displayName = 'ApiEndpoint';
