import { formatCurrency } from '@/lib/lodashx';

import html2canvas from 'html2canvas-pro';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

import { PersonRow, Settlement } from './types';
import { CURRENCIES } from './constants';
import { calculateSettlements } from './utils/calculate';

export const SplitBill: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tab, setTab] = useState<'equal' | 'settle'>('equal');
  const [bill, setBill] = useState(100);
  const [people, setPeople] = useState(2);
  const [tip, setTip] = useState(10);
  const [tax, setTax] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [persons, setPersons] = useState<PersonRow[]>([
    { name: 'Alice', paid: 100, owes: 25 },
    { name: 'Bob', paid: 0, owes: 40 },
    { name: 'Carol', paid: 0, owes: 35 },
  ]);
  const [splitEqually, setSplitEqually] = useState(true);
  const [settlements, setSettlements] = useState<Settlement[] | null>(null);
  const [capturing, setCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const eqResult = useMemo(() => {
    const tipA = bill * (tip / 100);
    const taxA = bill * (tax / 100);
    return {
      tipAmount: tipA,
      taxAmount: taxA,
      total: bill + tipA + taxA,
      perPerson: (bill + tipA + taxA) / people,
    };
  }, [bill, people, tip, tax]);
  const totalPaid = useMemo(() => persons.reduce((s, p) => s + (p.paid || 0), 0), [persons]);
  const equalShare = useMemo(() => totalPaid / (persons.length || 1), [totalPaid, persons.length]);
  const computedPersons = useMemo(
    () => (splitEqually ? persons.map((p) => ({ ...p, owes: equalShare })) : persons),
    [persons, splitEqually, equalShare],
  );
  const computedTotalOwes = useMemo(
    () => computedPersons.reduce((s, p) => s + (p.owes || 0), 0),
    [computedPersons],
  );

  const updatePerson = useCallback((index: number, field: keyof PersonRow, value: string) => {
    setSettlements(null);
    setPersons((prev) => {
      const copy = prev.map((p) => ({ ...p }));
      if (field === 'name') copy[index].name = value;
      else copy[index][field] = Number.parseFloat(value) || 0;
      return copy;
    });
  }, []);

  const addPerson = useCallback(() => {
    setSettlements(null);
    setPersons((prev) => [...prev, { name: '', paid: 0, owes: 0 }]);
  }, []);
  const removePerson = useCallback((index: number) => {
    setSettlements(null);
    setPersons((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSettle = useCallback(
    () => setSettlements(calculateSettlements(computedPersons)),
    [computedPersons],
  );

  const capture = useCallback(async (fn: (c: HTMLCanvasElement) => void) => {
    if (!captureRef.current) return;
    setCapturing(true);
    await new Promise((r) => requestAnimationFrame(r));
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
      });
      fn(canvas);
    } finally {
      setCapturing(false);
    }
  }, []);

  const handleDownload = useCallback(
    () =>
      capture((c) => {
        const a = document.createElement('a');
        a.href = c.toDataURL('image/png');
        a.download = 'split-bill.png';
        a.click();
      }),
    [capture],
  );
  const handleCopy = useCallback(
    () =>
      capture((c) =>
        c.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          } catch {
            /* */
          }
        }),
      ),
    [capture],
  );

  return (
    <div className='rounded-box border-base-300 bg-base-200 border p-4'>
      <div className='border-base-300 mb-4 flex w-full border-b'>
        <button
          className={`flex-1 border-b-2 px-3 py-2 text-sm transition-colors ${
            tab === 'equal'
              ? 'border-primary text-primary'
              : 'text-base-content/40 border-transparent'
          }`}
          onClick={() => setTab('equal')}>
          Equal Split
        </button>
        <button
          className={`flex-1 border-b-2 px-3 py-2 text-sm transition-colors ${
            tab === 'settle'
              ? 'border-primary text-primary'
              : 'text-base-content/40 border-transparent'
          }`}
          onClick={() => setTab('settle')}>
          Who Owes Who
        </button>
      </div>
      <div ref={captureRef} className={`space-y-3 ${capturing ? 'relative' : ''}`}>
        {capturing && (
          <div className='bg-base-100/80 absolute inset-0 z-10 flex items-center justify-center'>
            <span className='loading loading-spinner loading-md' />
          </div>
        )}
        {tab === 'equal' && (
          <>
            <div className='form-control'>
              <label className='label mb-1 p-0'>
                <span className='label-text text-xs font-normal opacity-70'>Total Bill</span>
              </label>
              <input
                type='number'
                className='input input-sm input-bordered w-full text-right'
                value={bill}
                min={0}
                step={0.01}
                onChange={(e) => setBill(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className='form-control'>
              <label className='label mb-1 p-0'>
                <span className='label-text text-xs font-normal opacity-70'>Number of People</span>
              </label>
              <input
                type='number'
                className='input input-sm input-bordered w-full text-right'
                value={people}
                min={1}
                onChange={(e) => setPeople(Math.max(1, Number.parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <div className='form-control'>
              <label className='label mb-1 p-0'>
                <span className='label-text text-xs font-normal opacity-70'>Tip (%)</span>
              </label>
              <input
                type='number'
                className='input input-sm input-bordered w-full text-right'
                value={tip}
                min={0}
                step={0.5}
                onChange={(e) => setTip(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className='form-control'>
              <label className='label mb-1 p-0'>
                <span className='label-text text-xs font-normal opacity-70'>Tax (%)</span>
              </label>
              <input
                type='number'
                className='input input-sm input-bordered w-full text-right'
                value={tax}
                min={0}
                step={0.5}
                onChange={(e) => setTax(Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className='bg-base-200 mt-4 space-y-2 rounded-xl p-3'>
              <div className='flex items-center justify-between'>
                <span className='text-xs opacity-70'>Tip Amount</span>
                <span className='text-sm font-normal'>
                  {formatCurrency(eqResult.tipAmount, currency)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-xs opacity-70'>Tax Amount</span>
                <span className='text-sm font-normal'>
                  {formatCurrency(eqResult.taxAmount, currency)}
                </span>
              </div>
              <div className='divider my-1' />
              <div className='flex items-center justify-between'>
                <span className='text-xs opacity-70'>Total</span>
                <span className='text-sm font-normal'>
                  {formatCurrency(eqResult.total, currency)}
                </span>
              </div>
              <div className='divider my-1' />
              <div className='flex items-center justify-between'>
                <span className='text-xs font-normal'>Per Person</span>
                <span className='text-lg font-normal'>
                  {formatCurrency(eqResult.perPerson, currency)}
                </span>
              </div>
            </div>
          </>
        )}
        {tab === 'settle' && (
          <>
            <p className='text-xs opacity-60'>
              Enter what each person paid. The calculator figures out who owes whom to settle up.
            </p>
            <label className='flex items-center gap-2 text-xs'>
              <input
                type='checkbox'
                className='toggle toggle-xs'
                checked={splitEqually}
                onChange={() => {
                  setSplitEqually((p) => !p);
                  setSettlements(null);
                }}
              />
              Split equally — auto-fill owes as {formatCurrency(equalShare, currency)} each
            </label>
            <div className='max-h-44 space-y-2 overflow-y-auto pr-1'>
              {computedPersons.map((p, i) => (
                <div key={i} className='flex items-center gap-1.5'>
                  <input
                    type='text'
                    placeholder='Name'
                    className='input input-sm input-bordered w-28'
                    value={p.name}
                    onChange={(e) => updatePerson(i, 'name', e.target.value)}
                  />
                  <input
                    type='number'
                    placeholder='Paid'
                    className='input input-sm input-bordered w-28 text-right'
                    value={p.paid || ''}
                    min={0}
                    step={0.01}
                    onChange={(e) => updatePerson(i, 'paid', e.target.value)}
                  />
                  <span className='text-xs opacity-50'>/</span>
                  {splitEqually ? (
                    <span className='bg-base-200 flex h-8 w-28 items-center justify-end rounded-md px-2 text-sm font-normal opacity-80'>
                      {formatCurrency(p.owes, currency)}
                    </span>
                  ) : (
                    <input
                      type='number'
                      placeholder='Owes'
                      className='input input-sm input-bordered w-28 text-right'
                      value={p.owes || ''}
                      min={0}
                      step={0.01}
                      onChange={(e) => updatePerson(i, 'owes', e.target.value)}
                    />
                  )}
                  <button className='btn btn-ghost btn-xs' onClick={() => removePerson(i)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className='flex gap-2'>
              <button
                className='btn btn-outline btn-sm border-base-content/20 bg-base-100/10 hover:bg-base-100/20 flex-1 backdrop-blur'
                onClick={addPerson}>
                + Add Person
              </button>
              <button
                className='btn btn-primary btn-sm flex-1'
                onClick={handleSettle}
                disabled={persons.length < 2}>
                Settle Up
              </button>
            </div>
            {totalPaid > 0 || computedTotalOwes > 0 ? (
              <div className='flex items-center justify-between text-xs opacity-60'>
                <span>
                  Total Paid: <strong>{formatCurrency(totalPaid, currency)}</strong>
                </span>
                <span>
                  Total Owes: <strong>{formatCurrency(computedTotalOwes, currency)}</strong>
                </span>
              </div>
            ) : null}
            {settlements && settlements.length > 0 && (
              <div className='bg-base-200 mt-2 flex flex-col space-y-2 gap-y-2 rounded-xl p-3'>
                <span className='text-xs font-normal'>Settle Up</span>
                {settlements.map((s, i) => (
                  <div
                    key={i}
                    className='bg-base-100/50 flex items-center justify-between rounded-lg px-3 py-2'>
                    <span className='text-sm font-normal'>
                      {s.from} <span className='text-xs opacity-50'>pays</span> {s.to}
                    </span>
                    <span className='text-sm font-normal'>
                      {formatCurrency(s.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {settlements && settlements.length === 0 && (
              <div className='bg-base-200 mt-2 rounded-xl p-3 text-center text-sm font-normal text-green-600'>
                All settled ✓
              </div>
            )}
          </>
        )}
      </div>
      <div className='border-base-content/10 flex items-center justify-between gap-2 border-t pt-3'>
        <div className='flex items-center gap-1.5'>
          <span className='text-xs opacity-60'>Currency</span>
          <select
            className='select select-xs select-bordered w-20'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className='flex items-center gap-1.5'>
          <button
            className='btn btn-outline btn-xs border-base-content/20 bg-base-100/10 hover:bg-base-100/20 backdrop-blur'
            onClick={handleDownload}
            disabled={capturing}>
            {capturing ? 'Capturing…' : '⬇ PNG'}
          </button>
          <button
            className='btn btn-outline btn-xs border-base-content/20 bg-base-100/10 hover:bg-base-100/20 backdrop-blur'
            onClick={handleCopy}
            disabled={capturing}>
            {capturing ? 'Capturing…' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
SplitBill.displayName = 'SplitBill';
