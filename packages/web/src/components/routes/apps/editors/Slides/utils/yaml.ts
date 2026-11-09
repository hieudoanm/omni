import { PitchDeck, SlideBlock, SlideLayout, ValidationError } from '../types';
import { formatCurrency } from './formatCurrency';

export const validate = (data: PitchDeck): ValidationError[] => {
  if (!data || typeof data !== 'object') {
    return [
      {
        path: '',
        message: 'Root YAML must be an object',
        hint: 'Start with keys like `title`, `problems`',
      },
    ];
  }
  const errors: ValidationError[] = [];
  if (!data.title)
    errors.push({
      path: 'title',
      message: 'Missing title section',
      hint: 'Add a `title:` section',
    });
  if (typeof data.title?.product !== 'string')
    errors.push({
      path: 'title.product',
      message: 'Product name is required',
      hint: 'Example: product: InvoiceMate',
    });
  if (typeof data.title?.tagline !== 'string')
    errors.push({ path: 'title.tagline', message: 'Tagline is required' });
  if (typeof data.title?.audience !== 'string')
    errors.push({ path: 'title.audience', message: 'Audience is required' });
  return errors;
};

export const mapYamlToSlides = (data: PitchDeck): SlideLayout[] => [
  {
    kicker: 'Introduction',
    blocks: [
      {
        type: 'center',
        blocks: [
          { type: 'title', text: data.title?.product ?? '' },
          { type: 'subtitle', text: data.title?.tagline ?? '' },
          { type: 'text', text: data.title?.audience ?? '' },
        ],
      },
    ],
  },
  {
    kicker: 'Problems',
    blocks: [
      { type: 'title', text: data.problems?.title ?? '' },
      { type: 'subtitle', text: data.problems?.subtitle ?? '' },
      {
        type: 'bullets',
        items: (data.problems?.items ?? []).map((p) => ({
          emoji: p.emoji,
          title: p.title,
          description: p.description,
        })),
      },
    ],
  },
  {
    kicker: 'Solution',
    blocks: [
      { type: 'title', text: data.solutions?.title ?? '' },
      { type: 'subtitle', text: data.solutions?.subtitle ?? '' },
      {
        type: 'bullets',
        items: (data.solutions?.items ?? []).map((item) => ({
          emoji: item.emoji,
          title: item.title,
          description: item.description,
        })),
      },
    ],
  },
  {
    kicker: 'Product',
    blocks: [
      { type: 'title', text: data.product?.title ?? '' },
      { type: 'subtitle', text: data.product?.subtitle ?? '' },
      {
        type: 'bullets',
        items: (data.product?.features ?? []).map((f) => ({
          emoji: f.emoji,
          title: f.title,
          description: f.description,
        })),
      },
    ],
  },
  {
    kicker: 'Pricing Model',
    blocks: [
      {
        type: 'center',
        blocks: [
          { type: 'title', text: data.pricing?.title ?? '' },
          { type: 'subtitle', text: data.pricing?.subtitle ?? '' },
          ...(data.pricing?.plans ?? []).map((plan) => ({
            type: 'pricing-plan' as const,
            name: plan?.name ?? '',
            price: formatCurrency(plan?.amount ?? 0, data?.pricing?.currency ?? ''),
            frequency: plan?.frequency ?? '',
          })),
        ],
      },
    ],
  },
];
