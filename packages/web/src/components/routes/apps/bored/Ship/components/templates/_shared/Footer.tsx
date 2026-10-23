import type { FC } from 'react';

interface FooterProps {
  citation?: string;
}

export const Footer: FC<FooterProps> = ({ citation }) => {
  if (!citation) return null;

  return <p className='text-base-content/40 mt-auto pt-4 text-center text-[10px]'>{citation}</p>;
};
