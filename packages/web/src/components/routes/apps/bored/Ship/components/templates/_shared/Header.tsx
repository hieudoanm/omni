import type { FC } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: FC<HeaderProps> = ({ title, subtitle }) => (
  <>
    <h1 className='text-base-content text-4xl font-bold'>{title}</h1>
    {subtitle && <p className='text-neutral text-sm'>{subtitle}</p>}
  </>
);
