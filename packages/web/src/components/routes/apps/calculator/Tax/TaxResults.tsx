import { type FC } from 'react';
import { formatCurrency } from '@/lib/lodashx';

import type { TaxResult } from './types';
import { formatPercent } from './constants';

export const TaxResults: FC<{
  data: TaxResult;
  insuranceEnabled: boolean;
}> = ({ data, insuranceEnabled }) => (
  <div className='space-y-4'>
    <div className='rounded-box bg-base-200 p-3 text-sm'>
      <h4 className='mb-2 font-normal'>Khau tru</h4>
      <div className='space-y-1 text-xs'>
        <div className='flex justify-between'>
          <span className='opacity-70'>Ca nhan:</span>
          <span>{formatCurrency(data.personalDeduction, 'VND')}</span>
        </div>
        <div className='flex justify-between'>
          <span className='opacity-70'>Phu thuoc:</span>
          <span>{formatCurrency(data.dependentDeduction, 'VND')}</span>
        </div>
        <div className='flex justify-between'>
          <span className='opacity-70'>Bao hiem NLĐ:</span>
          <span>{formatCurrency(data.employeeInsurance, 'VND')}</span>
        </div>
        <div className='divider my-1 h-1' />
        <div className='flex justify-between font-normal'>
          <span>Tong:</span>
          <span>{formatCurrency(data.totalDeductions, 'VND')}</span>
        </div>
      </div>
      {insuranceEnabled && data.insuranceBase < data.grossMonthly && (
        <p className='mt-2 text-xs opacity-60'>Ap dung truong bao hiem</p>
      )}
    </div>

    <div className='rounded-box bg-base-200 p-3 text-sm'>
      <div className='space-y-1'>
        <div className='flex justify-between text-xs'>
          <span className='opacity-70'>Thu nhap chiu thue:</span>
          <span>{formatCurrency(data.taxableIncome, 'VND')}</span>
        </div>
        <div className='flex justify-between text-xs'>
          <span className='opacity-70'>Thue hieu dung:</span>
          <span>{formatPercent(data.effectiveTaxRate)}</span>
        </div>
        <div className='divider my-1 h-1' />
        <div className='text-primary flex justify-between font-normal'>
          <span>Thuc linh:</span>
          <span>{formatCurrency(data.netMonthly, 'VND')}</span>
        </div>
        <div className='flex justify-between text-[10px] opacity-70'>
          <span>Tong chi phi DN:</span>
          <span>{formatCurrency(data.totalLaborCost, 'VND')}</span>
        </div>
      </div>
    </div>

    {data.breakdown.length > 0 && (
      <div className='rounded-box bg-base-200 p-3'>
        <h4 className='mb-2 text-xs font-normal'>Chi tiet thue</h4>
        <table className='table-sm table w-full text-[10px]'>
          <thead>
            <tr>
              <th className='px-0'>Thue suat</th>
              <th className='px-0 text-right'>Chiu thue</th>
              <th className='px-0 text-right'>Thue</th>
            </tr>
          </thead>
          <tbody>
            {data.breakdown.map((b, i) => (
              <tr key={i}>
                <td className='px-0'>{b.rate * 100}%</td>
                <td className='px-0 text-right'>{formatCurrency(b.taxable, 'VND')}</td>
                <td className='px-0 text-right'>{formatCurrency(b.tax, 'VND')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
