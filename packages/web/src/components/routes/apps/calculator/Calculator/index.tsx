import { FC, useEffect, useRef, useState } from 'react';
import { converterCategories } from './convert';

interface GridBtn {
  label: string;
  append?: string;
  variant: 'sci' | 'mem' | 'num' | 'op' | 'del' | 'clear' | 'eq';
  span?: number;
}

export const Calculator: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [expression, setExpression] = useState('');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState(converterCategories.length.defaultFrom);
  const [toUnit, setToUnit] = useState(converterCategories.length.defaultTo);
  const [showFromUnits, setShowFromUnits] = useState(false);
  const [showToUnits, setShowToUnits] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const append = (v: string) => setExpression((p) => p + v);
  const del = () => setExpression((p) => p.slice(0, -1));
  const clearExpr = () => setExpression('');

  const calculate = () => {
    try {
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
        .replace(/cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
        .replace(/tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
      setExpression(String(Function(`"use strict"; return (${sanitized})`)()));
    } catch {
      setExpression('Error');
    }
  };

  const config = converterCategories[category];
  const inputNum = parseFloat(expression) || 0;
  const result = config.convert(inputNum, fromUnit, toUnit);
  const numResult = parseFloat(result);
  const formattedResult = isNaN(numResult) ? result : formatNumber(numResult);

  const swap = () => {
    const u = fromUnit;
    setFromUnit(toUnit);
    setToUnit(u);
  };

  const switchCategory = (key: string) => {
    setCategory(key);
    const c = converterCategories[key];
    setFromUnit(c.defaultFrom);
    setToUnit(c.defaultTo);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Enter') {
      calculate();
      return;
    }
    if (e.key === 'Backspace') {
      del();
      return;
    }
    if (e.key === 'Delete') {
      clearExpr();
      return;
    }
    if (/^[0-9+\-*/.%^()]$/.test(e.key)) append(e.key);
  };

  const rows: GridBtn[][] = [
    [
      { label: 'sin(', variant: 'sci' },
      { label: 'cos(', variant: 'sci' },
      { label: 'tan(', variant: 'sci' },
      { label: 'AC', variant: 'mem' },
      { label: '+/-', variant: 'mem' },
      { label: '%', variant: 'mem' },
      { label: '÷', variant: 'op' },
      { label: '⌫', variant: 'del' },
    ],
    [
      { label: 'log(', variant: 'sci' },
      { label: 'ln(', variant: 'sci' },
      { label: '√(', variant: 'sci' },
      { label: '7', variant: 'num' },
      { label: '8', variant: 'num' },
      { label: '9', variant: 'num' },
      { label: '×', variant: 'op' },
      { label: 'C', variant: 'clear' },
    ],
    [
      { label: 'π', variant: 'sci' },
      { label: 'e', variant: 'sci' },
      { label: '^', variant: 'sci' },
      { label: '4', variant: 'num' },
      { label: '5', variant: 'num' },
      { label: '6', variant: 'num' },
      { label: '-', variant: 'op' },
      { label: '', variant: 'mem' },
    ],
    [
      { label: 'x²', variant: 'sci', append: '^2' },
      { label: '10^', variant: 'sci', append: '10**' },
      { label: 'n!', variant: 'sci', append: '!' },
      { label: '1', variant: 'num' },
      { label: '2', variant: 'num' },
      { label: '3', variant: 'num' },
      { label: '+', variant: 'op' },
      { label: '=', variant: 'eq' },
    ],
    [
      { label: '(', variant: 'sci' },
      { label: ')', variant: 'sci' },
      { label: '', variant: 'mem' },
      { label: '0', variant: 'num', span: 2 },
      { label: '.', variant: 'num' },
      { label: '', variant: 'mem' },
      { label: '', variant: 'mem' },
      { label: '', variant: 'mem' },
    ],
  ];

  const vc = (v: GridBtn['variant']) => {
    switch (v) {
      case 'sci':
        return 'bg-base-300 text-base-content/50 text-[10px] py-2';
      case 'mem':
        return 'bg-base-300 text-base-content/40 text-[10px] py-2';
      case 'num':
        return 'bg-base-300 text-base-content text-xs py-2';
      case 'op':
        return 'bg-base-300 text-base-content text-xs py-2';
      case 'del':
        return 'bg-base-300 text-base-content text-xs py-2';
      case 'clear':
        return 'bg-base-300 text-base-content text-xs py-2';
      case 'eq':
        return 'bg-primary text-primary-content text-xs py-2';
    }
  };

  const gridClick = (b: GridBtn) => {
    if (b.variant === 'eq') {
      calculate();
      return;
    }
    if (b.variant === 'clear') {
      clearExpr();
      return;
    }
    if (b.variant === 'del') {
      del();
      return;
    }
    append(b.append ?? b.label);
  };

  const isError = expression === 'Error';
  const displayValue = expression || '0';

  return (
    <div className='rounded-box bg-base-200 flex w-full max-w-xs flex-col gap-3 p-4 shadow-xl'>
      <div className='flex flex-wrap gap-1'>
        {Object.entries(converterCategories).map(([key]) => (
          <button
            key={key}
            onClick={() => switchCategory(key)}
            className={`rounded-full px-2.5 py-1 text-[10px] transition-colors ${
              category === key
                ? 'bg-primary text-primary-content'
                : 'bg-base-300 text-base-content/50 hover:text-base-content/80'
            }`}>
            {converterCategories[key].label}
          </button>
        ))}
      </div>

      <div ref={containerRef} tabIndex={0} onKeyDown={onKeyDown} className='outline-none'>
        <input
          type='text'
          value={displayValue}
          readOnly
          className={`mb-2 w-full bg-transparent text-right text-xl font-light tracking-tight tabular-nums focus:outline-none ${
            isError ? 'text-error' : 'text-base-content'
          }`}
        />

        <div className='mb-3 space-y-2'>
          <div className='rounded-field bg-base-300 flex items-center justify-between px-3 py-2'>
            <div className='relative'>
              <button
                onClick={() => {
                  setShowFromUnits(!showFromUnits);
                  setShowToUnits(false);
                }}
                className='rounded-field bg-base-200 text-base-content/70 flex items-center gap-1 px-2 py-1 text-[11px]'>
                {config.units.find((u) => u.key === fromUnit)?.label}
                <span className='text-[9px] opacity-50'>▼</span>
              </button>
              {showFromUnits && (
                <div className='rounded-field bg-base-300 absolute top-full left-0 z-10 mt-1 max-h-36 overflow-y-auto p-1 shadow-lg'>
                  {config.units.map((u) => (
                    <button
                      key={u.key}
                      onClick={() => {
                        setFromUnit(u.key);
                        setShowFromUnits(false);
                      }}
                      className={`rounded-field block w-full px-2.5 py-1.5 text-left text-[11px] whitespace-nowrap transition-colors ${
                        fromUnit === u.key
                          ? 'bg-primary text-primary-content'
                          : 'text-base-content/60 hover:bg-base-200'
                      }`}>
                      {u.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className='text-base-content text-sm'>{formatNumber(inputNum)}</span>
          </div>

          <button
            onClick={swap}
            className='bg-base-300 text-base-content/50 hover:bg-base-200 mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors'>
            ⇅
          </button>

          <div className='rounded-field bg-base-300 flex items-center justify-between px-3 py-2'>
            <div className='relative'>
              <button
                onClick={() => {
                  setShowToUnits(!showToUnits);
                  setShowFromUnits(false);
                }}
                className='rounded-field bg-base-200 text-base-content/70 flex items-center gap-1 px-2 py-1 text-[11px]'>
                {config.units.find((u) => u.key === toUnit)?.label}
                <span className='text-[9px] opacity-50'>▼</span>
              </button>
              {showToUnits && (
                <div className='rounded-field bg-base-300 absolute top-full left-0 z-10 mt-1 max-h-36 overflow-y-auto p-1 shadow-lg'>
                  {config.units.map((u) => (
                    <button
                      key={u.key}
                      onClick={() => {
                        setToUnit(u.key);
                        setShowToUnits(false);
                      }}
                      className={`rounded-field block w-full px-2.5 py-1.5 text-left text-[11px] whitespace-nowrap transition-colors ${
                        toUnit === u.key
                          ? 'bg-primary text-primary-content'
                          : 'text-base-content/60 hover:bg-base-200'
                      }`}>
                      {u.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className='text-base-content text-sm'>{formattedResult}</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-8 gap-1.5'>
        {rows.map((row, rIdx) => (
          <div key={rIdx} className='contents'>
            {row.map((b, bIdx) => {
              if (b.variant === 'mem' && b.label === '') return <div key={bIdx} />;
              return (
                <button
                  key={bIdx}
                  className={`rounded-field transition-colors active:opacity-70 ${vc(b.variant)} ${b.span ? `col-span-${b.span}` : ''}`}
                  onClick={() => gridClick(b)}>
                  {b.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

Calculator.displayName = 'Calculator';

function formatNumber(n: number): string {
  if (!isFinite(n)) return String(n);
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toLocaleString('en-US');
  const s = n.toFixed(6).replace(/\.?0+$/, '');
  if (s.length > 16) return n.toExponential(4);
  return s;
}
