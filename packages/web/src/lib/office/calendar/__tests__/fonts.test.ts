jest.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-sans' }),
  JetBrains_Mono: () => ({ variable: '--font-mono' }),
  Lora: () => ({ variable: '--font-serif' }),
}));

import { sans, mono, serif } from '../fonts';

describe('fonts', () => {
  it('exports sans font with variable', () => {
    expect(sans).toBeDefined();
    expect(sans.variable).toBe('--font-sans');
  });

  it('exports mono font with variable', () => {
    expect(mono).toBeDefined();
    expect(mono.variable).toBe('--font-mono');
  });

  it('exports serif font with variable', () => {
    expect(serif).toBeDefined();
    expect(serif.variable).toBe('--font-serif');
  });
});
