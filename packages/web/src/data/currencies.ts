const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0816,
  JPY: 161.63,
  BGN: 1.9558,
  CZK: 25.121,
  DKK: 7.4602,
  GBP: 0.8594,
  HUF: 403.33,
  PLN: 4.276,
  RON: 4.9752,
  SEK: 11.0098,
  CHF: 0.9584,
  ISK: 147.3,
  NOK: 11.7965,
  TRY: 42.2174,
  AUD: 1.7099,
  BRL: 6.3081,
  CAD: 1.5657,
  CNY: 7.8696,
  HKD: 8.4041,
  IDR: 18009.52,
  ILS: 3.9589,
  INR: 92.5515,
  KRW: 1567.79,
  MXN: 21.5975,
  MYR: 4.7878,
  NZD: 1.8849,
  PHP: 63.516,
  SGD: 1.4638,
  THB: 36.565,
  ZAR: 19.8877,
};

export const BASE = 'EUR';
export const CURRENCIES = [BASE, ...Object.keys(CURRENCY_RATES)].sort();

export const CURRENCY_NAMES: Record<string, string> = {
  AUD: 'Australian Dollar',
  BRL: 'Brazilian Real',
  CAD: 'Canadian Dollar',
  CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan',
  CZK: 'Czech Koruna',
  DKK: 'Danish Krone',
  EUR: 'Euro',
  GBP: 'British Pound',
  HKD: 'Hong Kong Dollar',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli Shekel',
  INR: 'Indian Rupee',
  ISK: 'Icelandic Króna',
  JPY: 'Japanese Yen',
  KRW: 'South Korean Won',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  NOK: 'Norwegian Krone',
  NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso',
  PLN: 'Polish Złoty',
  RON: 'Romanian Leu',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  THB: 'Thai Baht',
  TRY: 'Turkish Lira',
  USD: 'US Dollar',
  ZAR: 'South African Rand',
};

const toEur = (amount: number, currency: string): number => {
  if (currency === BASE) return amount;
  return amount / CURRENCY_RATES[currency];
};

const fromEur = (amount: number, currency: string): number => {
  if (currency === BASE) return amount;
  return amount * CURRENCY_RATES[currency];
};

export const convert = (amount: number, from: string, to: string): number =>
  fromEur(toEur(amount, from), to);

export const QUICK_PAIRS = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'SGD',
  'CNY',
  'AUD',
  'CAD',
  'CHF',
  'INR',
  'KRW',
  'HKD',
];
