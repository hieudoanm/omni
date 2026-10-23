import type { FC } from 'react';

const RATIO_GROUPS: Record<string, string[]> = {
  Square: ['1:1'],
  Portrait: ['4:5', '9:16', '2:3', '3:4'],
  Landscape: ['16:9', '4:3', '3:2'],
  Print: ['A4', 'Letter'],
};

export const AspectRatioSelect: FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <label className='flex flex-col gap-1'>
    <span className='text-neutral text-center text-xs font-semibold tracking-widest uppercase'>
      Aspect Ratio
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='rounded-box border-base-300 bg-base-200 text-neutral hover:border-neutral hover:text-base-content cursor-pointer border px-3 py-1.5 text-xs font-medium tracking-wider transition-all duration-200'>
      {Object.entries(RATIO_GROUPS).map(([group, ratios]) => (
        <optgroup key={group} label={group}>
          {ratios.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </label>
);
