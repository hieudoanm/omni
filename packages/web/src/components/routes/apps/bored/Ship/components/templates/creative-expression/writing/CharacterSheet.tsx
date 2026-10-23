import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const CharacterSheet: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? 'Character';
  const role = (data.role as string) ?? 'Protagonist';
  const subtitle = (data.subtitle as string) ?? '';
  const traits = (data.traits as string[]) ?? ['Brave', 'Curious', 'Flawed'];
  const motivation = (data.motivation as string) ?? '';
  const flaw = (data.flaw as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <h1 className='text-base-content mb-0.5 text-4xl font-black tracking-tight'>{name}</h1>
      <span className='badge badge-primary badge-sm mb-3'>{role}</span>
      {subtitle && <p className='text-neutral mb-2 max-w-sm text-xs leading-relaxed'>{subtitle}</p>}
      <ul className='mb-2 flex flex-wrap justify-center gap-1'>
        {traits.map((trait) => (
          <li key={trait} className='badge badge-outline badge-sm'>
            {trait}
          </li>
        ))}
      </ul>
      {motivation && (
        <p className='text-base-content mb-0.5 max-w-sm text-xs'>
          <strong className='font-bold'>Motivation:</strong> {motivation}
        </p>
      )}
      {flaw && (
        <p className='text-error max-w-sm text-xs'>
          <strong className='font-bold'>Flaw:</strong> {flaw}
        </p>
      )}
      <Footer citation={citation} />
    </Background>
  );
};

CharacterSheet.displayName = 'CharacterSheet';
