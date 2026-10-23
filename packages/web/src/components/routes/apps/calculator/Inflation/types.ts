export interface Country {
  countryName: string;
  countryCode: string;
  indicatorName: string;
  indicatorCode: string;
  data: Record<string, number | null>;
}

export interface InflationResult {
  adjustedAmount: number;
  cumulativeRate: number;
  averageRate: number;
  health: 'deflation' | 'low' | 'moderate' | 'high';
}

export type Tab = 'result' | 'options';
