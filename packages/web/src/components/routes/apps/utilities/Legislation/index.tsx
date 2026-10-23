import { FC, useState } from 'react';

import { Hemicycle } from './components/Hemicycle';
import { COUNTRIES } from './constants';

export const Legislation: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [countryIdx, setCountryIdx] = useState(0);
  const [chamberKey, setChamberKey] = useState<string>(() => Object.keys(COUNTRIES[0].chambers)[0]);
  const country = COUNTRIES[countryIdx];
  const chamberKeys = Object.keys(country.chambers);
  const chamber = country.chambers[chamberKey] ?? country.chambers[chamberKeys[0]];

  const selectCountry = (idx: number) => {
    setCountryIdx(idx);
    setChamberKey(Object.keys(COUNTRIES[idx].chambers)[0]);
  };
  const majority = Math.floor(chamber.totalSeats / 2) + 1;
  const largest = [...chamber.parties].sort((a, b) => b.seats - a.seats)[0];

  return (
    <>
      <div className='mb-3 flex flex-wrap justify-center gap-1'>
        {COUNTRIES.map((c, i) => (
          <button
            key={c.name}
            onClick={() => selectCountry(i)}
            className={`btn btn-xs ${countryIdx === i ? 'btn-primary' : 'btn-ghost'}`}>
            {c.flag} {c.name}
          </button>
        ))}
      </div>
      {chamberKeys.length > 1 && (
        <div className='border-base-300 mb-4 flex w-full border-b'>
          {chamberKeys.map((key) => (
            <button
              key={key}
              className={`flex-1 border-b-2 px-3 py-2 text-xs transition-colors ${
                chamberKey === key
                  ? 'border-primary text-primary'
                  : 'text-base-content/40 border-transparent'
              }`}
              onClick={() => setChamberKey(key)}>
              {key}
            </button>
          ))}
        </div>
      )}
      <div className='bg-base-200 rounded-xl px-4 pt-3 pb-1'>
        <Hemicycle chamber={chamber} />
      </div>
      <div className='mt-3 mb-4 flex justify-center gap-6 text-xs'>
        <div className='text-center'>
          <p className='text-2xl font-normal'>{chamber.totalSeats}</p>
          <p className='opacity-40'>Total seats</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-normal'>{majority}</p>
          <p className='opacity-40'>For majority</p>
        </div>
        <div className='text-center'>
          <p className='text-2xl font-normal' style={{ color: largest.color }}>
            {largest.seats}
          </p>
          <p className='opacity-40'>Largest party</p>
        </div>
      </div>
      <div className='space-y-1.5'>
        {chamber.parties.map((p) => {
          const pct = ((p.seats / chamber.totalSeats) * 100).toFixed(1);
          const hasMajority = p.seats >= majority;
          return (
            <div key={p.name} className='flex items-center gap-2 text-xs'>
              <div className='h-3 w-3 shrink-0 rounded-full' style={{ backgroundColor: p.color }} />
              <span className='min-w-0 flex-1 truncate'>
                {p.name}
                {hasMajority && <span className='badge badge-xs badge-success ml-1'>Majority</span>}
              </span>
              <div className='bg-base-200 relative h-2 w-24 overflow-hidden rounded-full'>
                <div
                  className='h-2 rounded-full transition-all duration-500'
                  style={{ width: `${pct}%`, backgroundColor: p.color }}
                />
              </div>
              <span className='w-14 text-right font-mono'>
                {p.seats} <span className='opacity-40'>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className='mt-3 text-center text-xs opacity-30'>
        Data approximate — last updated 2024–2025
      </p>
    </>
  );
};
Legislation.displayName = 'Legislation';
