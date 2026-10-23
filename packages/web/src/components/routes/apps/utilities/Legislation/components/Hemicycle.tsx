import { FC } from 'react';

import { Chamber, Party } from '../types';

interface Dot {
  x: number;
  y: number;
  color: string;
}

const buildHemicycle = (parties: Party[], totalSeats: number): Dot[] => {
  const seatColors: string[] = [];
  for (const p of parties) {
    for (let i = 0; i < p.seats; i++) seatColors.push(p.color);
  }
  const dots: Dot[] = [];
  const ROWS = 6,
    CX = 50,
    CY = 54,
    R_INNER = 22,
    R_OUTER = 46;
  const rowWeights = [1, 1.4, 1.8, 2.2, 2.6, 3.0];
  const totalWeight = rowWeights.reduce((a, b) => a + b, 0);
  const rowCounts = rowWeights.map((w) => Math.round((w / totalWeight) * seatColors.length));
  rowCounts[rowCounts.length - 1] += seatColors.length - rowCounts.reduce((a, b) => a + b, 0);
  let seatIdx = 0;
  for (let row = 0; row < ROWS; row++) {
    const t = row / (ROWS - 1);
    const r = R_INNER + t * (R_OUTER - R_INNER);
    const count = rowCounts[row];
    for (let i = 0; i < count; i++) {
      if (seatIdx >= seatColors.length) break;
      const angle = Math.PI * (i / (count - 1 || 1));
      dots.push({
        x: CX - r * Math.cos(angle),
        y: CY - r * Math.sin(angle),
        color: seatColors[seatIdx++],
      });
    }
  }
  return dots;
};

export const Hemicycle: FC<{ chamber: Chamber }> = ({ chamber }) => {
  const dots = buildHemicycle(chamber.parties, chamber.totalSeats);
  const dotR = Math.max(0.8, Math.min(2.0, 40 / Math.sqrt(chamber.totalSeats)));
  return (
    <svg viewBox='0 0 100 58' className='w-full' xmlns='http://www.w3.org/2000/svg'>
      <line x1='2' y1='54' x2='98' y2='54' stroke='currentColor' strokeWidth='0.3' opacity='0.15' />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={dotR} fill={d.color} opacity={0.9} />
      ))}
    </svg>
  );
};
Hemicycle.displayName = 'Hemicycle';
