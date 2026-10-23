import { FC, memo } from 'react';

export interface SectionProps {
  label: string;
  count?: number;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export const Section: FC<SectionProps> = memo(
  ({ label, count, open = true, onToggle, children }) => (
    <section aria-label={label} className='w-full max-w-3xl pt-6'>
      <div className='border-base-300 collapse-arrow collapse rounded-none border-b bg-transparent'>
        <input type='checkbox' className='peer' checked={open} onChange={onToggle} />
        <div className='text-base-content/70 collapse-title flex min-h-0 items-center justify-center gap-2 px-5 py-4 font-mono text-xs tracking-widest uppercase'>
          {label}
          {count !== undefined && (
            <span className='bg-primary/20 text-primary border-primary/30 badge badge-xs font-mono tracking-normal normal-case'>
              {count}
            </span>
          )}
        </div>
        <div className='collapse-content px-5 pb-6'>{children}</div>
      </div>
    </section>
  ),
);

Section.displayName = 'Section';
