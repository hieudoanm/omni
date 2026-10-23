import { type FC, useMemo, useState } from 'react';

import type { Period, SalaryMode, Tab } from './types';
import { PERIOD_LABELS } from './constants';
import { calculateTax } from './utils/calculate';
import { TaxResults } from './TaxResults';

export const Tax: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<Tab>('options');
  const [income, setIncome] = useState(20_000_000);
  const [dependents, setDependents] = useState(0);
  const [period, setPeriod] = useState<Period>('monthly');
  const [salaryMode, setSalaryMode] = useState<SalaryMode>('gross');
  const [insuranceEnabled, setInsuranceEnabled] = useState(true);

  const data = useMemo(
    () => calculateTax(income, dependents, period, salaryMode, insuranceEnabled),
    [income, dependents, period, salaryMode, insuranceEnabled],
  );

  const toggleSalaryMode = () => setSalaryMode((mode) => (mode === 'gross' ? 'net' : 'gross'));

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h2 className='text-sm'>Tinh Thue Ca Nhan</h2>
          <p className='text-xs opacity-60'>Tinh thue thu nhap ca nhan Viet Nam (PIT)</p>
        </div>
        <button className='btn btn-ghost btn-xs' onClick={onClose}>
          Close
        </button>
      </div>

      <div role='tablist' className='tabs tabs-boxed mb-4'>
        <a
          role='tab'
          className={`tab flex-1 ${tab === 'options' ? 'tab-active' : ''}`}
          onClick={() => setTab('options')}>
          Input
        </a>
        <a
          role='tab'
          className={`tab flex-1 ${tab === 'result' ? 'tab-active' : ''}`}
          onClick={() => setTab('result')}>
          Results
        </a>
      </div>

      {tab === 'options' && (
        <div className='space-y-3'>
          <div className='form-control'>
            <label className='label mb-1 p-0'>
              <span className='label-text text-xs font-normal opacity-70'>Ky tinh thue</span>
            </label>
            <select
              className='select select-bordered select-sm w-full'
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}>
              {Object.entries(PERIOD_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className='btn btn-primary btn-sm w-full' onClick={toggleSalaryMode}>
            {salaryMode === 'gross' ? 'Gross → Net' : 'Net → Gross'}
          </button>
          <div className='form-control'>
            <label className='label mb-1 p-0'>
              <span className='label-text text-xs font-normal opacity-70'>
                {salaryMode === 'gross' ? 'Thu nhap gop (Gross)' : 'Thu nhap thuc linh (Net)'}
              </span>
            </label>
            <input
              type='number'
              aria-label='Thu nhap'
              className='input input-sm input-bordered w-full'
              value={income}
              onChange={(e) => setIncome(+e.target.value)}
            />
          </div>
          <div className='form-control'>
            <label className='label mb-1 p-0'>
              <span className='label-text text-xs font-normal opacity-70'>Nguoi phu thuoc</span>
            </label>
            <input
              type='number'
              aria-label='Nguoi phu thuoc'
              className='input input-sm input-bordered w-full'
              value={dependents}
              onChange={(e) => setDependents(+e.target.value)}
            />
          </div>
          <div className='form-control'>
            <label className='label cursor-pointer p-0'>
              <span className='label-text text-xs font-normal opacity-70'>Tinh bao hiem</span>
              <input
                type='checkbox'
                aria-label='Tinh bao hiem'
                className='toggle toggle-primary toggle-sm'
                checked={insuranceEnabled}
                onChange={() => setInsuranceEnabled((v) => !v)}
              />
            </label>
          </div>
          <button className='btn btn-primary btn-sm w-full' onClick={() => setTab('result')}>
            Tinh thue →
          </button>
        </div>
      )}

      {tab === 'result' && (
        <div>
          <TaxResults data={data} insuranceEnabled={insuranceEnabled} />
          <button className='btn btn-ghost btn-sm mt-4 w-full' onClick={() => setTab('options')}>
            ← Back to input
          </button>
        </div>
      )}
    </div>
  );
};
Tax.displayName = 'Tax';
