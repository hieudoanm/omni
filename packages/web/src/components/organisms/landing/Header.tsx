import { FC } from 'react';

interface HeaderProps {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
}

export const Header: FC<HeaderProps> = ({ onSignInClick, onGetStartedClick }) => {
  return (
    <div className='navbar bg-base-100/85 border-base-300 sticky top-0 z-50 min-h-[60px] border-b px-12 backdrop-blur-xl'>
      <div className='navbar-start'>
        <span className='text-primary font-serif text-2xl font-bold tracking-widest'>DaisyX</span>
      </div>
      <div className='navbar-center hidden lg:flex'>
        <ul className='menu menu-horizontal text-base-content/60 gap-2 px-1 text-sm'>
          <li>
            <a href='#primitives' className='hover:text-base-content'>
              Components
            </a>
          </li>
          <li>
            <a href='#forms' className='hover:text-base-content'>
              Forms
            </a>
          </li>
          <li>
            <a href='#feedback' className='hover:text-base-content'>
              Feedback
            </a>
          </li>
          <li>
            <a href='#navigation' className='hover:text-base-content'>
              Navigation
            </a>
          </li>
          <li>
            <a href='#data' className='hover:text-base-content'>
              Data
            </a>
          </li>
          <li>
            <a href='#pricing' className='hover:text-base-content'>
              Pricing
            </a>
          </li>
        </ul>
      </div>
      <div className='navbar-end gap-2'>
        <button type='button' className='btn btn-ghost btn-sm' onClick={onSignInClick}>
          Sign in
        </button>
        <button type='button' className='btn btn-primary btn-sm' onClick={onGetStartedClick}>
          Get started
        </button>
      </div>
    </div>
  );
};
Header.displayName = 'Header';
