import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface WorldAspect {
  name: string;
  detail: string;
}

export const WorldBuilding: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'World Building';
  const worldName = (data.worldName as string) ?? 'New World';
  const subtitle = (data.subtitle as string) ?? '';
  const aspects = (data.aspects as WorldAspect[]) ?? [
    { name: 'Geography', detail: 'Diverse landscapes and climates' },
    { name: 'Culture', detail: 'Unique traditions and beliefs' },
    { name: 'Technology', detail: 'Level of advancement' },
  ];
  const rules = (data.rules as string[]) ?? ['Magic has a cost', 'Actions have consequences'];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <Header title={worldName} subtitle={subtitle} />
      <ul className='mb-3 grid w-full max-w-md grid-cols-2 gap-1'>
        {aspects.map((a) => (
          <li key={a.name} className='bg-base-200 rounded-lg p-2 text-left'>
            <h3 className='text-base-content text-xs font-bold'>{a.name}</h3>
            <p className='text-neutral text-xs leading-relaxed'>{a.detail}</p>
          </li>
        ))}
      </ul>
      {rules.length > 0 && (
        <div className='w-full max-w-md text-left'>
          <h2 className='text-base-content mb-1 block text-xs font-bold tracking-wider uppercase'>
            World Rules
          </h2>
          <ul className='space-y-1'>
            {rules.map((rule) => (
              <li key={rule} className='text-neutral flex items-start gap-1 text-xs'>
                <span className='text-primary mt-0.5'>&#10003;</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

WorldBuilding.displayName = 'WorldBuilding';
