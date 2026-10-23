import { FC, ReactNode } from 'react';

interface BrowserProps {
  url?: string;
  children?: ReactNode;
  className?: string;
}

export const Browser: FC<BrowserProps> = ({
  url = 'https://daisyui.com',
  children,
  className = '',
}) => {
  return (
    <div className={`mockup-browser border-base-300 bg-base-100 w-full border ${className}`}>
      <div className='mockup-browser-toolbar'>
        <div className='input'>{url}</div>
      </div>
      <div className='border-base-300 grid border-t'>{children}</div>
    </div>
  );
};
Browser.displayName = 'Browser';
