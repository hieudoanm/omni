export type SlideBlock =
  | { type: 'title'; text: string }
  | { type: 'subtitle'; text: string }
  | { type: 'text'; text: string }
  | {
      type: 'bullets';
      items: { emoji?: string; title?: string; description?: string }[];
    }
  | { type: 'highlight'; text?: string; subtext?: string }
  | { type: 'pricing-plan'; name: string; price: string; frequency: string }
  | { type: 'center'; blocks: SlideBlock[] };

export interface SlideLayout {
  kicker?: string;
  blocks: SlideBlock[];
}

export interface PitchDeck {
  title?: { product?: string; tagline?: string; audience?: string };
  problems?: {
    title?: string;
    subtitle?: string;
    items?: {
      emoji?: string;
      title?: string;
      description?: string;
      impact?: string;
      severity?: string;
      userType?: string;
    }[];
  };
  solutions?: {
    title?: string;
    subtitle?: string;
    items?: {
      step?: number;
      emoji?: string;
      title?: string;
      description?: string;
    }[];
  };
  product?: {
    title?: string;
    subtitle?: string;
    features?: { emoji?: string; title?: string; description?: string }[];
  };
  pricing?: {
    title?: string;
    subtitle?: string;
    model?: string;
    currency?: string;
    plans?: {
      name?: string;
      amount?: number;
      frequency?: string;
      description?: string;
    }[];
  };
}

export interface ValidationError {
  path: string;
  message: string;
  hint?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}
