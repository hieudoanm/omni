import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

export const ProfileHeader: FC<TemplateProps> = ({ data }) => {
  const name = (data.name as string) ?? 'Alex Chen';
  const title = (data.title as string) ?? 'Senior Product Designer';
  const tagline =
    (data.tagline as string) ??
    'Designing meaningful experiences at the intersection of simplicity and functionality.';
  const email = (data.email as string) ?? 'alex@example.com';
  const phone = (data.phone as string) ?? '+1 (555) 123-4567';
  const location = (data.location as string) ?? 'San Francisco, CA';
  const website = (data.website as string) ?? 'alexchen.design';
  const github = (data.github as string) ?? '';
  const linkedin = (data.linkedin as string) ?? '';
  const instagram = (data.instagram as string) ?? '';
  const x = (data.x as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='bg-primary flex aspect-square h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white'>
        {name.charAt(0)}
      </div>

      <h1 className='text-base-content mt-2 text-4xl font-bold'>{name}</h1>
      <span className='text-accent mt-1 text-xs font-semibold'>{title}</span>

      <p className='text-neutral mt-1 max-w-[280px] text-center text-xs leading-relaxed'>
        {tagline}
      </p>

      <ul className='bg-base-200 mt-2 flex flex-col gap-1 rounded-2xl px-3 py-1'>
        {email && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>✉</span>
            <span className='text-base-content text-xs'>{email}</span>
          </li>
        )}
        {phone && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>☎</span>
            <span className='text-base-content text-xs'>{phone}</span>
          </li>
        )}
        {location && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>◎</span>
            <span className='text-base-content text-xs'>{location}</span>
          </li>
        )}
        {website && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>⊞</span>
            <span className='text-base-content text-xs'>{website}</span>
          </li>
        )}
        {github && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>⌘</span>
            <span className='text-base-content text-xs'>github.com/{github}</span>
          </li>
        )}
        {linkedin && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>◫</span>
            <span className='text-base-content text-xs'>linkedin.com/in/{linkedin}</span>
          </li>
        )}
        {instagram && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>◎</span>
            <span className='text-base-content text-xs'>@{instagram}</span>
          </li>
        )}
        {x && (
          <li className='flex items-center gap-1'>
            <span className='text-accent text-xs'>✕</span>
            <span className='text-base-content text-xs'>@{x}</span>
          </li>
        )}
      </ul>
      <Footer citation={citation} />
    </Background>
  );
};

ProfileHeader.displayName = 'ProfileHeader';
