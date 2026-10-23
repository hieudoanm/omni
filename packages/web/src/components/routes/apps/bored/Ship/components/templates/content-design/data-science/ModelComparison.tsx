import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Model {
  name: string;
  accuracy: string;
  f1: string;
  precision: string;
  recall: string;
  latency: string;
}

export const ModelComparison: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const models = (data.models as Model[]) ?? [];

  const metrics = ['accuracy', 'f1', 'precision', 'recall', 'latency'] as const;

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-2 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>
          Model Comparison
        </h2>
        {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
      </div>
      <div className='flex flex-1 flex-col justify-center'>
        <div className='border-base-300 overflow-hidden rounded-xl border text-[10px]'>
          <div className='bg-base-200 flex'>
            <div className='w-24 px-2 py-1.5 font-bold'>Model</div>
            {metrics.map((m) => (
              <div
                key={m}
                className='flex-1 px-2 py-1.5 text-center font-bold tracking-wider uppercase'>
                {m}
              </div>
            ))}
          </div>
          {models.map((model, i) => (
            <div key={i} className='border-base-300 flex border-t'>
              <div className='text-primary w-24 px-2 py-1.5 font-semibold'>{model.name}</div>
              {metrics.map((m) => (
                <div key={m} className='text-base-content flex-1 px-2 py-1.5 text-center'>
                  {model[m]}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

ModelComparison.displayName = 'ModelComparison';
