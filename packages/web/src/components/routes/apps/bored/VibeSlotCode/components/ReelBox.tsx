import { FC } from 'react';

interface ReelBoxProps {
  label: string;
  name: string;
  link: string;
  spinning: boolean;
}

export const ReelBox: FC<ReelBoxProps> = ({ label, name, link, spinning }) => {
  const borderClass = spinning
    ? 'border-base-content/10 bg-base-content/5'
    : 'border-base-content/20 bg-base-200';

  let textClass = spinning ? 'text-base-content/50' : 'text-base-content';
  if (!spinning && label === 'Project Idea') {
    textClass = 'text-primary';
  }

  const box = (
    <div
      className={`flex min-h-[4.5rem] w-full items-center justify-center rounded-2xl border px-2 py-2 text-center transition-all duration-300 sm:min-h-24 sm:px-3 sm:py-3 ${borderClass}`}>
      <p
        className={`font-mono text-base leading-snug font-medium tracking-tight transition-all duration-200 ${textClass}`}>
        {name}
      </p>
    </div>
  );

  if (!spinning && link) {
    return (
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e) => e.stopPropagation()}
        className='block w-full no-underline'>
        {box}
      </a>
    );
  }

  return box;
};
