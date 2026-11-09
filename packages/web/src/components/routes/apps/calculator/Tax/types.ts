export type Period = 'monthly' | 'annual';

export type SalaryMode = 'gross' | 'net';

export type Tab = 'options' | 'result';

export interface TaxBracket {
  limit: number;
  rate: number;
}

export interface TaxBreakdownItem {
  rate: number;
  taxable: number;
  tax: number;
}

export interface TaxResult {
  grossMonthly: number;
  insuranceBase: number;
  employeeInsurance: number;
  employerInsurance: number;
  personalDeduction: number;
  dependentDeduction: number;
  totalDeductions: number;
  taxableIncome: number;
  breakdown: TaxBreakdownItem[];
  totalTax: number;
  netMonthly: number;
  effectiveTaxRate: number;
  totalLaborCost: number;
}
