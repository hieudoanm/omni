import { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer className='border-base-300 border-t py-12 text-center'>
      <p className='text-primary mb-3 font-serif text-3xl'>DaisyX</p>
      <p className='text-base-content/30 text-sm'>
        © 2026 DaisyX Design System · Built with care · MIT License
      </p>
    </footer>
  );
};
Footer.displayName = 'Footer';
