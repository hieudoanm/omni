import { Country, InflationResult } from '../types';

export const calculateInflation = (
  data: Record<string, number | null>,
  startYear: number,
  endYear: number,
  amount: number,
): InflationResult | null => {
  if (startYear >= endYear) return null;
  let adjusted = amount,
    cumulativeRate = 0,
    yearsCount = 0;
  for (let y = startYear; y < endYear; y++) {
    const value = data[y.toString()];
    if (value == null) return null;
    adjusted *= 1 + value / 100;
    cumulativeRate += value;
    yearsCount++;
  }
  const averageRate = cumulativeRate / yearsCount;
  let health: InflationResult['health'] = 'moderate';
  if (averageRate < 0) health = 'deflation';
  else if (averageRate < 3) health = 'low';
  else if (averageRate < 6) health = 'moderate';
  else health = 'high';
  return {
    adjustedAmount: Number(adjusted.toFixed(2)),
    cumulativeRate: Number(cumulativeRate.toFixed(2)),
    averageRate: Number(averageRate.toFixed(2)),
    health,
  };
};
