import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Limitation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export const Limitations: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Limitations';
  const limitations = (data.limitations as Limitation[]) ?? [
    {
      title: 'Sample generalizability',
      description: 'Convenience sample from a single university limits external validity',
      impact: 'High',
    },
    {
      title: 'Self-report measures',
      description: 'Potential social desirability bias in survey responses',
      impact: 'Medium',
    },
    {
      title: 'Cross-sectional design',
      description: 'Causal inferences cannot be drawn from correlational data',
      impact: 'High',
    },
  ];
  const recommendations = (data.recommendations as string[]) ?? [
    'Replicate with community samples',
    'Include behavioural measures alongside self-report',
    'Conduct longitudinal follow-up studies',
  ];

  const impactColor = (impact: string) => {
    if (impact === 'High') return 'bg-[#ff0030] text-white';
    if (impact === 'Medium') return 'bg-[#d90029]/20 text-[#d90029]';
    return 'bg-[#e5e7eb] text-[#6b7280]';
  };

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <span className='text-accent mb-3 text-sm font-bold tracking-[0.2em] uppercase'>
        Limitations
      </span>
      <h1 className='text-base-content text-4xl leading-tight font-bold'>{title}</h1>

      <ul className='mt-6 flex flex-col gap-3'>
        {limitations.map((lim, i) => (
          <li key={i} className='rounded-2xl border border-[#e5e7eb] p-3'>
            <div className='flex items-center justify-between'>
              <span className='text-base-content text-sm font-semibold'>{lim.title}</span>
              <span
                className={`rounded-2xl px-2 py-2 text-sm font-bold tracking-[0.1em] uppercase ${impactColor(lim.impact)}`}>
                {lim.impact}
              </span>
            </div>
            <p className='text-neutral mt-1 text-sm leading-relaxed'>{lim.description}</p>
          </li>
        ))}
      </ul>

      <div className='mt-6'>
        <span className='text-neutral text-sm font-bold tracking-[0.15em] uppercase'>
          Recommendations
        </span>
        <ol className='mt-2 flex flex-col gap-2'>
          {recommendations.map((r, i) => (
            <li key={i} className='flex items-start gap-3'>
              <span className='text-accent mt-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                {i + 1}
              </span>
              <span className='text-base-content text-sm leading-relaxed'>{r}</span>
            </li>
          ))}
        </ol>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Limitations.displayName = 'Limitations';
