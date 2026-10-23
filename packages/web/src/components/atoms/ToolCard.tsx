import Link from 'next/link';
import type { ComponentType, FC } from 'react';

export interface Action {
  label: string;
  url: string;
}

export interface Tool {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  href: string;
  badge?: string;
  type?: string;
  typeId?: string;
  actions?: Action[];
}

export const ToolCard: FC<Tool> = ({ label, description, icon: Icon, href, badge, actions }) => (
  <Link
    href={href}
    className='card bg-base-200 border-base-300 hover:bg-base-300 group relative w-full border text-left transition-all duration-300 hover:scale-[1.03] hover:shadow-lg'>
    {badge && (
      <span className='bg-primary/20 text-primary border-primary/30 absolute -top-2 right-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] leading-none font-bold tracking-widest uppercase'>
        {badge}
      </span>
    )}
    <div className='card-body flex-col items-center justify-center gap-2 p-4 text-center'>
      <div className='bg-primary/20 border-primary/30 flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-inner transition-transform duration-300 group-hover:scale-110'>
        <Icon className='text-xl' size={24} />
      </div>
      <div className='w-full text-center'>
        <div className='truncate text-sm font-normal tracking-tight'>{label}</div>
        <div className='text-base-content/40 mt-0.5 truncate text-[10px] tracking-widest uppercase'>
          {description ?? label}
        </div>
      </div>
      {(actions ?? [{ label: 'Open in new tab', url: href }]).map((action, i) => (
        <button
          key={`${action.url}-${i}`}
          type='button'
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const anchor = e.currentTarget.closest('a');
            const url = action.url === href ? (anchor?.href ?? href) : action.url;
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
          className='btn btn-primary btn-xs w-full no-underline transition-all'
          aria-label={`Open ${label} in new tab`}>
          {action.label}
        </button>
      ))}
    </div>
  </Link>
);
ToolCard.displayName = 'ToolCard';
