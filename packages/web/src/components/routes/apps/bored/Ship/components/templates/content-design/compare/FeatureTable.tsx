import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Plan {
  name: string;
  values: string[];
}

const CHECK = '✓';
const CROSS = '—';

export const FeatureTable: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Compare Plans';
  const features = (data.features as string[]) ?? [
    'Users',
    'Storage',
    'Support',
    'API Access',
    'Analytics',
  ];
  const plans = (data.plans as Plan[]) ?? [
    { name: 'Free', values: ['1', '5 GB', 'Email', '', 'Basic'] },
    { name: 'Pro', values: ['10', '100 GB', 'Priority', CHECK, 'Advanced'] },
    { name: 'Enterprise', values: ['Unlimited', '1 TB', CHECK, CHECK, CHECK] },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h2 className='text-base-content mb-2 text-center text-sm font-bold'>{title}</h2>
      <div className='flex flex-1 flex-col gap-0.5'>
        <div className='border-base-300 flex border-b'>
          <div className='text-neutral w-1/4 text-[9px] font-bold' />
          {plans.map((p, i) => (
            <div key={i} className='text-primary w-1/4 text-center text-[9px] font-bold'>
              {p.name}
            </div>
          ))}
        </div>
        <ul>
          {features.map((f, fi) => (
            <li key={fi} className='border-base-300 flex items-center border-b'>
              <div className='text-base-content w-1/4 pl-1 text-[9px]'>{f}</div>
              {plans.map((p, pi) => (
                <div key={pi} className='w-1/4 text-center text-[10px] font-bold'>
                  <span className={p.values[fi] ? 'text-primary' : 'text-neutral'}>
                    {p.values[fi] ? CHECK : CROSS}
                  </span>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

FeatureTable.displayName = 'FeatureTable';
