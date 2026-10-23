import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const AchievementUnlocked: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Achievement Name';
  const game = (data.game as string) ?? 'Game Title';
  const subtitle = (data.subtitle as string) ?? 'Complete a difficult challenge';
  const rarity = (data.rarity as string) ?? 'Rare';
  const dateUnlocked = (data.dateUnlocked as string) ?? 'Jan 1, 2026';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-4'>
        <div className='mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-full'>
          <span className='text-3xl'>🏆</span>
        </div>
        <Header title={title} subtitle={subtitle} />
        <span className='bg-primary/10 text-primary mx-auto mb-1 w-fit rounded-full px-2 py-0.5 text-xs font-bold'>
          {rarity}
        </span>
        <p className='text-base-300 text-xs'>
          Unlocked <time>{dateUnlocked}</time>
        </p>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

AchievementUnlocked.displayName = 'AchievementUnlocked';
