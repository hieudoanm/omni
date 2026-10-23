import { FC } from 'react';

interface HeroProps {
  onViewDemoClick?: () => void;
  onDocsClick?: () => void;
}

export const Hero: FC<HeroProps> = ({ onViewDemoClick, onDocsClick }) => {
  return (
    <section id='hero' className='relative mx-auto max-w-5xl px-12 py-36 text-center'>
      <div className='bg-primary/5 pointer-events-none absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-3xl' />
      <p className='text-primary mb-7 text-xs tracking-[0.2em] uppercase'>
        v2.4.0 · 47 components · MIT license
      </p>
      <h1 className='mb-6 font-serif text-7xl leading-[1.05] font-black tracking-tight'>
        Build interfaces
        <br />
        that <span className='text-primary'>feel</span> right
      </h1>
      <p className='text-base-content/60 mx-auto mb-11 max-w-xl text-lg leading-relaxed'>
        DaisyX is a refined design system for teams who care about every pixel. Accessible,
        composable, and darkly beautiful.
      </p>
      <div className='flex flex-wrap justify-center gap-3'>
        <button type='button' className='btn btn-primary' onClick={onViewDemoClick}>
          ▶ View demo
        </button>
        <button type='button' className='btn btn-ghost' onClick={onDocsClick}>
          Read the docs
        </button>
        <button type='button' className='btn btn-ghost text-primary font-mono text-sm'>
          npm i @forma/ui
        </button>
      </div>
      <div className='mt-16 flex flex-wrap justify-center gap-3'>
        <span className='badge badge-success gap-1'>● Stable</span>
        <span className='badge badge-info'>TypeScript</span>
        <span className='badge badge-warning text-warning-content'>React 18</span>
        <span className='badge badge-neutral'>Next.js ready</span>
        <span className='badge badge-ghost border-base-300 border'>WCAG 2.1 AA</span>
      </div>
    </section>
  );
};
Hero.displayName = 'Hero';
