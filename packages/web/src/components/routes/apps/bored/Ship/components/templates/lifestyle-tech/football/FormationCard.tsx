import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Player {
  name: string;
  number: number;
  position: string;
  rating?: number;
}

export const FormationCard: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const formation = (data.formation as string) ?? '4-3-3';
  const players = (data.players as Player[]) ?? [];

  const positions = [
    { top: '85%', left: '50%' },
    { top: '70%', left: '20%' },
    { top: '70%', left: '40%' },
    { top: '70%', left: '60%' },
    { top: '70%', left: '80%' },
    { top: '50%', left: '25%' },
    { top: '50%', left: '50%' },
    { top: '50%', left: '75%' },
    { top: '30%', left: '20%' },
    { top: '30%', left: '50%' },
    { top: '30%', left: '80%' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-3 text-center'>
        <h2 className='text-accent text-xs font-bold tracking-[0.2em] uppercase'>Formation</h2>
        {title && <h3 className='text-base-content mt-1 text-base font-bold'>{title}</h3>}
        <div className='text-primary mt-1 text-lg font-black'>{formation}</div>
      </div>
      <div className='border-base-300 relative flex-1 overflow-hidden rounded border'>
        <div className='bg-success/10 absolute inset-0' />
        <div className='bg-base-300 absolute top-1/2 left-0 h-px w-full opacity-50' />
        <div className='border-base-300 absolute top-[25%] left-1/2 h-[50%] w-[40%] -translate-x-1/2 rounded-full border opacity-30' />
        {players.slice(0, 11).map((player, i) => {
          const pos = positions[i] ?? { top: '50%', left: '50%' };
          return (
            <div
              key={i}
              className='absolute flex flex-col items-center'
              style={{
                top: pos.top,
                left: pos.left,
                transform: 'translate(-50%, -50%)',
              }}>
              <div className='bg-primary text-primary-content flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow'>
                {player.number}
              </div>
              <div className='text-base-content mt-0.5 text-xs leading-none font-semibold'>
                {player.name}
              </div>
              {player.rating && (
                <div className='text-accent text-xs font-bold'>{player.rating}</div>
              )}
              <Footer citation={citation} />
            </div>
          );
        })}
      </div>
    </Background>
  );
};

FormationCard.displayName = 'FormationCard';
