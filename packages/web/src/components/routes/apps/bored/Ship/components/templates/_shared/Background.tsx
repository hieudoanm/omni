import type { CSSProperties, FC, ReactNode } from 'react';

export interface BackgroundProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export const Background: FC<BackgroundProps> = ({ className = '', style, children }) => {
  const classes = [
    'bg-base-100',
    'flex',
    'h-full',
    'w-full',
    'flex-col',
    'items-center',
    'justify-center',
    'text-center',
    'gap-4',
    'p-8',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};
