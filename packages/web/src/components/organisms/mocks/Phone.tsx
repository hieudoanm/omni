import { FC, ReactNode } from 'react';

interface PhoneProps {
  children?: ReactNode;
  className?: string;
}

export const Phone: FC<PhoneProps> = ({ children, className = '' }) => {
  return (
    <div className={`mockup-phone border-gray-400 ${className}`}>
      <div className='mockup-phone-camera' />
      <div className='mockup-phone-display bg-neutral-900 text-white'>{children}</div>
    </div>
  );
};
Phone.displayName = 'Phone';
