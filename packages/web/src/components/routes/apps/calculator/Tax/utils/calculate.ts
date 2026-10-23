import type { Period, SalaryMode, TaxBreakdownItem, TaxResult } from '../types';
import {
  TAX_BRACKETS,
  EMPLOYEE_INSURANCE,
  EMPLOYER_INSURANCE,
  INSURANCE_CAP,
  PERSONAL_DEDUCTION,
  DEPENDENT_DEDUCTION,
} from '../constants';

export const toMonthly = (value: number, period: Period): number =>
  period === 'annual' ? value / 12 : value;

export const sumRates = (rates: Record<string, number>): number =>
  Object.values(rates).reduce((a, b) => a + b, 0);

export const clampInsuranceBase = (gross: number, enabled: boolean): number =>
  enabled ? Math.min(gross, INSURANCE_CAP) : 0;

export const calculateTaxBreakdown = (
  taxableIncome: number,
): { breakdown: TaxBreakdownItem[]; totalTax: number } => {
  let remaining = taxableIncome;
  let totalTax = 0;
  const breakdown: TaxBreakdownItem[] = [];
  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const applied = Math.min(bracket.limit, remaining);
    const tax = applied * bracket.rate;
    breakdown.push({ rate: bracket.rate, taxable: applied, tax });
    totalTax += tax;
    remaining -= applied;
  }
  return { breakdown, totalTax };
};

export const solveGrossFromNet = (
  targetNet: number,
  dependents: number,
  insuranceEnabled: boolean,
): number => {
  let gross = targetNet;
  for (let i = 0; i < 20; i++) {
    const insuranceBase = clampInsuranceBase(gross, insuranceEnabled);
    const insurance = insuranceBase * sumRates(EMPLOYEE_INSURANCE);
    const deductions = PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION + insurance;
    const taxable = Math.max(0, gross - deductions);
    const { totalTax } = calculateTaxBreakdown(taxable);
    const net = gross - insurance - totalTax;
    gross += targetNet - net;
  }
  return Math.max(0, gross);
};

export const calculateTax = (
  income: number,
  dependents: number,
  period: Period,
  salaryMode: SalaryMode,
  insuranceEnabled: boolean,
): TaxResult => {
  const grossBase =
    salaryMode === 'gross' ? income : solveGrossFromNet(income, dependents, insuranceEnabled);
  const grossMonthly = toMonthly(grossBase, period);
  const insuranceBase = clampInsuranceBase(grossMonthly, insuranceEnabled);
  const employeeInsurance = insuranceBase * sumRates(EMPLOYEE_INSURANCE);
  const employerInsurance = insuranceBase * sumRates(EMPLOYER_INSURANCE);
  const totalDeductions = PERSONAL_DEDUCTION + dependents * DEPENDENT_DEDUCTION + employeeInsurance;
  const taxableIncome = Math.max(0, grossMonthly - totalDeductions);
  const { breakdown, totalTax } = calculateTaxBreakdown(taxableIncome);
  const netMonthly = grossMonthly - employeeInsurance - totalTax;

  return {
    grossMonthly,
    insuranceBase,
    employeeInsurance,
    employerInsurance,
    personalDeduction: PERSONAL_DEDUCTION,
    dependentDeduction: dependents * DEPENDENT_DEDUCTION,
    totalDeductions,
    taxableIncome,
    breakdown,
    totalTax,
    netMonthly,
    effectiveTaxRate: grossMonthly ? totalTax / grossMonthly : 0,
    totalLaborCost: grossMonthly + employerInsurance,
  };
};
