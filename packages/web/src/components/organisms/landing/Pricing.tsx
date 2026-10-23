import { FC } from 'react';

interface PricingProps {
  onPlanClick?: (tier: string) => void;
}

const plans = [
  {
    tier: 'Starter',
    price: 'Free',
    period: 'forever',
    features: ['47 base components', 'Community support', 'MIT license'],
    cta: 'Get started',
    featured: false,
    primary: false,
  },
  {
    tier: 'Pro',
    price: '$29',
    period: 'per seat / month',
    features: [
      'Everything in Starter',
      'Figma kit included',
      'Priority support',
      'Private Slack channel',
    ],
    cta: 'Start free trial',
    featured: true,
    primary: true,
  },
  {
    tier: 'Enterprise',
    price: 'Custom',
    period: 'talk to us',
    features: [
      'Everything in Pro',
      'White-label rights',
      'SLA & dedicated support',
      'Custom token generation',
    ],
    cta: 'Contact sales',
    featured: false,
    primary: false,
  },
];

export const Pricing: FC<PricingProps> = ({ onPlanClick }) => {
  return (
    <section id='pricing' className='mx-auto max-w-5xl px-12 py-24 text-center'>
      <p className='text-primary mb-3 text-xs font-medium tracking-[0.14em] uppercase'>Pricing</p>
      <h2 className='mb-4 font-serif text-4xl leading-snug font-bold'>Simple, honest pricing</h2>
      <p className='text-base-content/60 mx-auto mb-12 max-w-xl text-base leading-relaxed'>
        No hidden fees. Cancel anytime. Every plan includes the full component library.
      </p>
      <div className='grid grid-cols-3 gap-5 text-left'>
        {plans.map(({ tier, price, period, features, cta, featured, primary }) => (
          <div
            key={tier}
            className={`card border ${featured ? 'border-primary relative' : 'border-base-300'} bg-base-200`}>
            {featured && (
              <div className='bg-primary text-primary-content absolute -top-px right-5 rounded-b-lg px-3 py-1 text-[11px] font-semibold tracking-wider'>
                POPULAR
              </div>
            )}
            <div className='card-body p-8'>
              <p className='text-base-content/40 mb-3 text-xs font-medium tracking-widest uppercase'>
                {tier}
              </p>
              <p className={`mb-1 font-serif text-4xl font-bold ${featured ? 'text-primary' : ''}`}>
                {price}
              </p>
              <p className='text-base-content/40 mb-7 text-sm'>{period}</p>
              <ul className='text-base-content/50 mb-7 flex flex-col gap-2 text-sm'>
                {features.map((f) => (
                  <li
                    key={f}
                    className="before:text-primary before:font-semibold before:content-['✓_']">
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type='button'
                className={`btn w-full ${primary ? 'btn-primary' : 'btn-ghost border-base-300'}`}
                onClick={() => onPlanClick?.(tier)}>
                {cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
Pricing.displayName = 'Pricing';
