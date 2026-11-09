'use client';

import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';

const APP_NAME: string = 'Office';
const THEME_KEY: string = 'office-theme';
const THEME_DARK: string = 'office-dark';
const THEME_LIGHT: string = 'office-light';

const getInitialTheme = (): string => {
  if (typeof window === 'undefined') return THEME_DARK;
  return localStorage.getItem(THEME_KEY) || THEME_DARK;
};

export const Header: FC = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const officeRoot = document.getElementById('office-root');
    (officeRoot ?? document.documentElement).setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) => (current === THEME_LIGHT ? THEME_DARK : THEME_LIGHT));

  return (
    <header className='border-base-300 bg-base-100 sticky top-0 z-10 w-full border-b px-4 py-3 sm:px-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Link
            href='/apps/office'
            className='text-base-content font-display text-sm font-bold tracking-widest uppercase'>
            {APP_NAME}
          </Link>
        </div>

        <nav className='flex w-auto items-center gap-1'>
          <button
            type='button'
            className='btn btn-ghost btn-sm'
            onClick={toggleTheme}
            aria-label='Toggle theme'
            data-testid='theme-toggle'>
            {theme === THEME_DARK ? <FiSun className='text-lg' /> : <FiMoon className='text-lg' />}
          </button>
        </nav>
      </div>
    </header>
  );
};

Header.displayName = 'Header';
