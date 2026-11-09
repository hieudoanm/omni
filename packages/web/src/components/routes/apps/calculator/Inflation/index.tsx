import { FC, useState } from 'react';

import countriesCurrencies from '@/json/inflation/countries_currencies.json';
import currencies from '@/json/inflation/currencies.json';
import history from '@/json/inflation/history.json';

import { Country, Tab } from './types';
import { currencyLocaleMap, healthConfig } from './constants';
import { calculateInflation } from './utils/calculate';

const allCountries = Object.values(history) as Country[];

export const Inflation: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<Tab>('options');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    () => allCountries.find((c) => c.countryName.toLowerCase() === 'viet nam') ?? null,
  );
  const [currency, setCurrency] = useState(
    () =>
      (countriesCurrencies as Record<string, string[]>)[selectedCountry?.countryCode ?? '']?.at(
        0,
      ) ?? 'VND',
  );
  const years = Object.keys(selectedCountry?.data ?? {}).filter(
    (y) => selectedCountry?.data[y] !== null,
  );
  const [selectedYear, setSelectedYear] = useState(years[0] ?? '');
  const [targetYear, setTargetYear] = useState(years[years.length - 1] ?? '');
  const [amount, setAmount] = useState(1_000_000);

  const result = calculateInflation(
    selectedCountry?.data ?? {},
    Number(selectedYear),
    Number(targetYear),
    amount,
  );
  const locale = currencyLocaleMap[currency] ?? 'en-US';
  const hc = result ? healthConfig[result.health] : null;

  const onCountryChange = (name: string) => {
    const country = allCountries.find((c) => c.countryName === name) ?? null;
    const cur =
      (countriesCurrencies as Record<string, string[]>)[country?.countryCode ?? '']?.at(0) ?? 'USD';
    const yrs = Object.keys(country?.data ?? {}).filter((y) => country?.data[y] !== null);
    setSelectedCountry(country);
    setCurrency(cur);
    setSelectedYear(yrs[0] ?? '');
    setTargetYear(yrs[yrs.length - 1] ?? '');
  };

  const availableYears = Object.keys(selectedCountry?.data ?? {}).filter(
    (y) => selectedCountry?.data[y] !== null,
  );

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div role='tablist' className='tabs tabs-boxed mb-4'>
        <a
          role='tab'
          className={`tab flex-1 ${tab === 'options' ? 'tab-active' : ''}`}
          onClick={() => setTab('options')}>
          Options
        </a>
        <a
          role='tab'
          className={`tab flex-1 ${tab === 'result' ? 'tab-active' : ''}`}
          onClick={() => setTab('result')}>
          Result
        </a>
      </div>
      {tab === 'options' && (
        <div className='space-y-4'>
          <div className='form-control'>
            <label className='label pb-1'>
              <span className='label-text font-normal'>Country</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={selectedCountry?.countryName ?? ''}
              onChange={(e) => onCountryChange(e.target.value)}>
              <option value='' disabled>
                Select a country
              </option>
              {allCountries
                .sort((a, b) => a.countryName.localeCompare(b.countryName))
                .map((c) => (
                  <option key={c.countryCode} value={c.countryName}>
                    {c.countryName}
                  </option>
                ))}
            </select>
          </div>
          <div className='form-control'>
            <label className='label pb-1'>
              <span className='label-text font-normal'>Currency</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              {(currencies as string[]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='form-control'>
              <label className='label pb-1'>
                <span className='label-text font-normal'>From</span>
              </label>
              <select
                className='select select-bordered w-full'
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className='form-control'>
              <label className='label pb-1'>
                <span className='label-text font-normal'>To</span>
              </label>
              <select
                className='select select-bordered w-full'
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}>
                {availableYears
                  .sort((a, b) => Number(b) - Number(a))
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className='form-control'>
            <label className='label pb-1'>
              <span className='label-text font-normal'>Amount</span>
            </label>
            <input
              type='number'
              className='input input-bordered w-full'
              value={amount}
              min={0}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 0) setAmount(v);
              }}
            />
          </div>
          <button className='btn btn-primary w-full' onClick={() => setTab('result')}>
            Calculate →
          </button>
        </div>
      )}
      {tab === 'result' && (
        <div>
          {result && hc ? (
            <div className={`rounded-xl border-2 p-4 ${hc.border} ${hc.bg} ${hc.text}`}>
              <h2 className='mb-3 flex items-center gap-2 font-normal'>
                {hc.emoji} {selectedCountry?.countryName} · {selectedYear}–{targetYear}
              </h2>
              <table className='w-full table-auto text-sm'>
                <tbody>
                  <tr>
                    <td className='py-1 font-normal'>Original</td>
                    <td className='py-1 text-right'>
                      {amount.toLocaleString(locale, {
                        style: 'currency',
                        currency,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className='py-1 font-normal'>Adjusted</td>
                    <td className='py-1 text-right'>
                      {result.adjustedAmount.toLocaleString(locale, {
                        style: 'currency',
                        currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className='py-1 font-normal'>Cumulative</td>
                    <td className='py-1 text-right'>
                      {result.cumulativeRate.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className='py-1 font-normal'>Average/yr</td>
                    <td className='py-1 text-right'>
                      {result.averageRate.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      %
                    </td>
                  </tr>
                  <tr>
                    <td className='py-1 font-normal'>Health</td>
                    <td className='py-1 text-right font-normal capitalize'>{result.health}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className='py-8 text-center text-sm opacity-50'>
              No data available for <em>{selectedCountry?.countryName}</em> in the selected year
              range.
              <br />
              <button className='btn btn-ghost btn-sm mt-4' onClick={() => setTab('options')}>
                ← Back to options
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
Inflation.displayName = 'Inflation';
