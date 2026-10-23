import { FC, ReactNode } from 'react';

interface WindowProps {
  children?: ReactNode;
  className?: string;
}

export const Window: FC<WindowProps> = ({ children, className = '' }) => {
  return (
    <div className={`mockup-window border-base-300 bg-base-100 w-full border ${className}`}>
      <div className='border-base-300 border-t'>{children}</div>
    </div>
  );
};
Window.displayName = 'Window';
