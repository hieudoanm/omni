'use client';

import { type ButtonHTMLAttributes, type FC } from 'react';
import type { IconType } from 'react-icons';

export const IconButton: FC<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: IconType;
    label: string;
    active?: boolean;
    variant?: 'ghost' | 'primary' | 'danger';
    size?: 'sm' | 'md';
  }
> = ({ icon: Icon, label, active, variant = 'ghost', size = 'md', className, ...rest }) => (
  <button
    type='button'
    aria-label={label}
    title={label}
    className={`tooltip tooltip-bottom btn btn-ghost btn-square min-h-0 p-0 ${
      size === 'sm' ? 'size-7' : 'size-9'
    } text-base-content/80 hover:text-base-content ${
      active ? 'bg-primary/15 text-primary' : ''
    } ${variant === 'primary' ? 'btn-primary' : ''} ${
      variant === 'danger' ? 'btn-error btn-outline' : ''
    } ${className ?? ''}`}
    {...rest}>
    <Icon className={size === 'sm' ? 'size-3.5' : 'size-4.5'} />
  </button>
);
