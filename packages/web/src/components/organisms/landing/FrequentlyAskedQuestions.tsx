import { FC } from 'react';

const faqs = [
  {
    q: 'What tokens does DaisyX export?',
    a: 'DaisyX exports CSS custom properties for color, spacing, radius, shadow, and typography — plus a JS token object for use in styled-components or Tailwind configs.',
  },
  {
    q: 'Is it framework-agnostic?',
    a: 'The core tokens and CSS utilities work anywhere. React components are available via @forma/react, with Vue and Svelte packages coming soon.',
  },
  {
    q: 'How are accessibility levels tested?',
    a: 'We run automated axe-core tests in CI and manual audits with NVDA and VoiceOver on every major release. All interactive components meet WCAG 2.1 AA criteria.',
  },
  {
    q: 'Can I use DaisyX in a commercial project?',
    a: 'Yes — DaisyX is MIT licensed. You can use it in personal, open-source, and commercial projects with no restrictions.',
  },
];

export const FrequentlyAskedQuestions: FC = () => {
  return (
    <section className='mx-auto max-w-3xl px-12 py-24'>
      <p className='text-primary mb-3 text-center text-xs font-medium tracking-[0.14em] uppercase'>
        FAQ
      </p>
      <h2 className='mb-4 text-center font-serif text-4xl leading-snug font-bold'>
        Frequently asked questions
      </h2>
      <p className='text-base-content/60 mx-auto mb-12 max-w-xl text-center text-base leading-relaxed'>
        Everything you need to know about DaisyX.
      </p>
      <div className='border-base-300 overflow-hidden rounded-2xl border'>
        {faqs.map(({ q, a }, i) => (
          <div
            key={i}
            className='collapse-arrow border-base-300 collapse border-b bg-transparent last:border-b-0'>
            <input type='radio' name='faq' defaultChecked={i === 0} />
            <div className='collapse-title text-base-content px-5 py-4 text-sm font-medium'>
              {q}
            </div>
            <div className='collapse-content px-5'>
              <p className='text-base-content/50 pb-2 text-sm leading-relaxed'>{a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
FrequentlyAskedQuestions.displayName = 'FrequentlyAskedQuestions';
