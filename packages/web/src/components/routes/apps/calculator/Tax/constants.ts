import type { TaxBracket } from './types';

export const PERSONAL_DEDUCTION = 11_000_000;
export const DEPENDENT_DEDUCTION = 4_400_000;
export const INSURANCE_CAP = 36_000_000;

export const EMPLOYEE_INSURANCE = { BHXH: 0.08, BHYT: 0.015, BHTN: 0.01 };
export const EMPLOYER_INSURANCE = { BHXH: 0.175, BHYT: 0.03, BHTN: 0.01 };

export const TAX_BRACKETS: readonly TaxBracket[] = [
  { limit: 5_000_000, rate: 0.05 },
  { limit: 5_000_000, rate: 0.1 },
  { limit: 8_000_000, rate: 0.15 },
  { limit: 14_000_000, rate: 0.2 },
  { limit: 20_000_000, rate: 0.25 },
  { limit: 28_000_000, rate: 0.3 },
  { limit: Infinity, rate: 0.35 },
];

export const PERIOD_LABELS: Record<string, string> = {
  monthly: 'Thang',
  annual: 'Nam',
};

export const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`;
