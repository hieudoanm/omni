import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Finding {
  label: string;
  value: string;
  significant?: boolean;
}

export const Results: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Results';
  const findings = (data.findings as Finding[]) ?? [
    {
      label: 'Main effect of X on Y',
      value: 'F(1, 238) = 14.72, p < .001',
      significant: true,
    },
    {
      label: 'Interaction effect',
      value: 'F(2, 238) = 3.89, p = .021',
      significant: true,
    },
    {
      label: 'Effect of covariate',
      value: 'F(1, 238) = 1.02, p = .313',
      significant: false,
    },
  ];
  const statistic = (data.statistic as string) ?? 'η² = 0.058';
  const effectSize = (data.effectSize as string) ?? 'Medium effect';
  const chart = (data.chart as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>Results</span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <div className='mt-6 flex gap-3'>
        <div className='bg-base-200 flex-1 rounded-2xl p-3 text-center'>
          <span className='text-accent text-2xl font-black'>{statistic}</span>
          <span className='text-neutral mt-2 block text-sm'>Effect Size</span>
        </div>
        <div className='bg-base-200 flex-1 rounded-2xl p-3 text-center'>
          <span className='text-base-content text-2xl font-black'>{effectSize}</span>
          <span className='text-neutral mt-2 block text-sm'>Interpretation</span>
        </div>
      </div>

      <ul className='mt-6 flex flex-col gap-2'>
        {findings.map((f, i) => (
          <li
            key={i}
            className={`flex items-start gap-4 rounded-2xl border p-4 ${
              f.significant
                ? 'border-[#ff0030]/20 bg-[#ff0030]/5'
                : 'border-[#e5e7eb] bg-transparent'
            }`}>
            <span
              className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                f.significant ? 'bg-[#ff0030]' : 'bg-[#d1d5db]'
              }`}
            />
            <div>
              <span className='text-base-content text-sm font-medium'>{f.label}</span>
              <span className='text-neutral mt-2 block font-mono text-sm'>{f.value}</span>
            </div>
          </li>
        ))}
      </ul>

      {chart && (
        <div className='bg-base-200 mt-6 flex items-center justify-center rounded-2xl p-3'>
          <span className='text-neutral text-sm'>{chart}</span>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

Results.displayName = 'Results';
