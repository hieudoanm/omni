import { FC } from 'react';

import { formatCurrency } from '../utils/formatCurrency';
import { PitchDeck } from '../types';

export const LandingPage: FC<{ data: PitchDeck }> = ({ data }) => {
  const { title, problems, solutions, product, pricing } = data;
  return (
    <div className='bg-base-100 text-base-content min-h-screen'>
      <section className='bg-base-200 py-16 sm:py-20 lg:py-24'>
        <div className='mx-auto max-w-4xl px-4 text-center'>
          <h1 className='mb-6 text-3xl font-normal sm:text-4xl lg:text-5xl'>
            {title?.product ?? ''}
          </h1>
          <p className='mb-4 text-lg opacity-80 sm:text-xl'>{title?.tagline ?? ''}</p>
          <p className='mb-8 opacity-70'>Built for {title?.audience ?? ''}</p>
        </div>
      </section>
      <section className='py-16 sm:py-20'>
        <div className='mx-auto max-w-6xl px-4'>
          {problems?.title && (
            <h2 className='mb-6 text-center text-2xl font-normal sm:text-3xl lg:text-4xl'>
              {problems.title}
            </h2>
          )}
          {problems?.subtitle && (
            <p className='mb-12 text-center text-base opacity-70 sm:text-lg'>{problems.subtitle}</p>
          )}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {(problems?.items ?? []).map((p, i) => (
              <div key={i} className='card border-base-300 bg-base-200 border shadow-xl'>
                <div className='card-body'>
                  <div className='mb-2 text-3xl'>{p.emoji}</div>
                  <h3 className='card-title'>{p.title}</h3>
                  <p className='opacity-80'>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='bg-base-200 py-16 sm:py-20'>
        <div className='mx-auto max-w-5xl px-4'>
          {solutions?.title && (
            <h2 className='mb-6 text-center text-2xl font-normal sm:text-3xl lg:text-4xl'>
              {solutions.title}
            </h2>
          )}
          {solutions?.subtitle && (
            <p className='mb-12 text-center text-base opacity-70 sm:text-lg'>
              {solutions.subtitle}
            </p>
          )}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {(solutions?.items ?? []).map((s, i) => (
              <div
                key={i}
                className='card border-base-300 bg-base-100 border text-center shadow-xl'>
                <div className='card-body'>
                  <div className='mb-4 text-4xl'>{s.emoji}</div>
                  <span className='badge badge-primary mx-auto mb-2'>Step {s.step}</span>
                  <h3 className='text-lg font-normal sm:text-xl'>{s.title}</h3>
                  <p className='opacity-80'>{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='py-16 sm:py-20'>
        <div className='mx-auto max-w-6xl px-4'>
          {product?.title && (
            <h2 className='mb-6 text-center text-2xl font-normal sm:text-3xl lg:text-4xl'>
              {product.title}
            </h2>
          )}
          {product?.subtitle && (
            <p className='mb-12 text-center text-base opacity-70 sm:text-lg'>{product.subtitle}</p>
          )}
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {(product?.features ?? []).map((f, i) => (
              <div key={i} className='card border-base-300 bg-base-200 border shadow-xl'>
                <div className='card-body'>
                  <div className='mb-2 text-3xl'>{f.emoji}</div>
                  <h3 className='card-title'>{f.title}</h3>
                  <p className='opacity-80'>{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='bg-base-200 py-16 sm:py-20'>
        <div className='mx-auto max-w-6xl px-4'>
          {pricing?.title && (
            <h2 className='mb-6 text-center text-2xl font-normal sm:text-3xl lg:text-4xl'>
              {pricing.title}
            </h2>
          )}
          {pricing?.subtitle && (
            <p className='mb-12 text-center text-base opacity-70 sm:text-lg'>{pricing.subtitle}</p>
          )}
          <div className='mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {(pricing?.plans ?? []).map((plan, i) => (
              <div key={i} className='card bg-base-100 text-center shadow-lg'>
                <div className='card-body'>
                  <h3 className='text-lg font-normal sm:text-xl'>{plan.name}</h3>
                  <p className='my-4 text-3xl font-normal sm:text-4xl'>
                    {formatCurrency(plan?.amount ?? 0, pricing?.currency ?? '')}
                  </p>
                  <p className='mb-2 text-sm opacity-60'>{plan.frequency}</p>
                  <p className='mb-6 opacity-80'>{plan.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className='footer footer-center bg-base-300 text-base-content p-6'>
        <aside>
          <p className='font-normal'>{title?.product}</p>
          <p className='text-sm opacity-60'>
            &copy; {new Date().getFullYear()} — All rights reserved
          </p>
        </aside>
      </footer>
    </div>
  );
};
LandingPage.displayName = 'LandingPage';
