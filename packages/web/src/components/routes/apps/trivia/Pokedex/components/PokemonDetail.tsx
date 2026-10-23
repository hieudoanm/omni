import { FC } from 'react';
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

import { Pokemon } from '../types';
import { getTypeColor } from '../constants';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const PokemonDetail: FC<{ p: Pokemon; onClose: () => void }> = ({ p, onClose }) => {
  const labels = ['HP', 'ATK', 'DEF', 'SP.A', 'SP.D', 'SPD'];
  const values = [p.hp, p.attack, p.defense, p.special_attack, p.special_defense, p.speed];
  const total = values.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: 'rgba(96, 165, 250, 0.4)',
        borderColor: '#60a5fa',
        borderWidth: 2,
        pointBackgroundColor: '#60a5fa',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 255,
        ticks: { display: false, stepSize: 50 },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { font: { size: 11 } as any },
      },
    },
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  return (
    <dialog className='modal modal-open' style={{ zIndex: 1001 }}>
      <div className='modal-box w-full max-w-sm'>
        <button
          onClick={onClose}
          className='btn btn-sm btn-circle btn-ghost absolute top-2 right-2'>
          ✕
        </button>
        <div className='mb-3 flex items-center gap-3'>
          <img
            src={`https://raw.githubusercontent.com/hieudoanm/hieudoanm/master/packages/data/pokemon/images/${p.name}.png`}
            className='h-16 w-16'
            alt={p.name}
            loading='lazy'
          />
          <div>
            <p className='text-xs opacity-40'>#{p.id}</p>
            <h3 className='text-lg font-normal capitalize'>{p.name.replaceAll('-', ' ')}</h3>
            <span className={`badge badge-sm ${getTypeColor(p.type)}`}>{p.type}</span>
          </div>
        </div>
        <div className='h-52 w-full'>
          <Radar data={data} options={options} />
        </div>
        <div className='mt-2 space-y-1.5'>
          {labels.map((label, i) => (
            <div key={label} className='flex items-center gap-2 text-xs'>
              <span className='w-10 opacity-50'>{label}</span>
              <progress className='progress progress-info flex-1' value={values[i]} max={255} />
              <span className='w-8 text-right font-mono font-normal'>{values[i]}</span>
            </div>
          ))}
          <div className='flex justify-between pt-1 text-xs'>
            <span className='opacity-40'>Total</span>
            <span className='font-mono font-normal'>{total}</span>
          </div>
        </div>
      </div>
      <div className='modal-backdrop' onClick={onClose} />
    </dialog>
  );
};
PokemonDetail.displayName = 'PokemonDetail';
