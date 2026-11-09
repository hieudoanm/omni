'use client';

import { FC } from 'react';
import { type CaseKind } from '@/lib/office/md/textCase';

export type ConvertKind = CaseKind | 'braille' | 'morse' | 'leet' | null;

interface ConvertToolbarProps {
  convertKind: ConvertKind;
  onConvertChange: (kind: ConvertKind) => void;
}

const CASES: ReadonlyArray<[CaseKind, string]> = [
  ['upper', 'UPPER'],
  ['lower', 'lower'],
  ['title', 'Title'],
  ['camel', 'camelCase'],
  ['snake', 'snake_case'],
  ['kebab', 'kebab-case'],
];

const isCaseKind = (kind: ConvertKind): kind is CaseKind =>
  kind === 'upper' ||
  kind === 'lower' ||
  kind === 'title' ||
  kind === 'camel' ||
  kind === 'snake' ||
  kind === 'kebab';

export const ConvertToolbar: FC<ConvertToolbarProps> = ({ convertKind, onConvertChange }) => {
  const handleCase = (caseKind: CaseKind): void => {
    onConvertChange(convertKind === caseKind ? null : caseKind);
  };

  const handleSimple = (kind: 'braille' | 'morse' | 'leet'): void => {
    onConvertChange(convertKind === kind ? null : kind);
  };

  const isActive = (kind: ConvertKind): boolean => convertKind === kind;

  return (
    <div className='border-base-content/10 bg-base-200/50 flex flex-wrap items-center gap-1 border-b px-2 py-1'>
      <span className='text-base-content/40 pr-1 text-[10px] tracking-widest uppercase'>Case</span>
      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />
      {CASES.map(([kind, label]) => (
        <button
          key={kind}
          className={`btn btn-xs tooltip tooltip-bottom font-mono text-[11px] ${
            isCaseKind(convertKind) && convertKind === kind ? 'btn-primary' : 'btn-ghost'
          }`}
          data-tip={kind === 'title' ? 'Title case' : label}
          onClick={() => handleCase(kind)}
          aria-label={kind === 'title' ? 'Title case' : `Case ${label}`}>
          {label}
        </button>
      ))}

      <div className='divider divider-horizontal mx-0.5 my-0 w-0' />

      <button
        className={`btn btn-xs font-mono text-[11px] ${
          isActive('braille') ? 'btn-primary' : 'btn-ghost'
        }`}
        onClick={() => handleSimple('braille')}
        aria-label='Convert to Braille'>
        ⠿ Braille
      </button>
      <button
        className={`btn btn-xs font-mono text-[11px] ${
          isActive('morse') ? 'btn-primary' : 'btn-ghost'
        }`}
        onClick={() => handleSimple('morse')}
        aria-label='Convert to Morse'>
        ·− Morse
      </button>
      <button
        className={`btn btn-xs font-mono text-[11px] ${
          isActive('leet') ? 'btn-primary' : 'btn-ghost'
        }`}
        onClick={() => handleSimple('leet')}
        aria-label='Convert to Leet'>
        1337 Leet
      </button>
    </div>
  );
};
