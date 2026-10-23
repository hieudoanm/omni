'use client';

import { type FC } from 'react';
import { FiCrosshair, FiDelete, FiPenTool, FiTool, FiTrash2 } from 'react-icons/fi';
import type { AnnotationTool } from '@/lib/office/keynotes/annotations';

export const ANNOT_COLORS = ['#ffffff', '#ffd60a', '#ff453a', '#32d74b', '#0a84ff', '#ff9f0a'];

const TOOLS: Array<{
  id: AnnotationTool;
  icon: typeof FiPenTool;
  label: string;
}> = [
  { id: 'laser', icon: FiCrosshair, label: 'Laser pointer (L)' },
  { id: 'pen', icon: FiPenTool, label: 'Pen (P)' },
  { id: 'highlighter', icon: FiTool, label: 'Highlighter (H)' },
  { id: 'eraser', icon: FiDelete, label: 'Eraser (E)' },
];

export const AnnotationToolbar: FC<{
  tool: AnnotationTool | 'off';
  onTool: (t: AnnotationTool | 'off') => void;
  color: string;
  onColor: (c: string) => void;
  onClear: () => void;
}> = ({ tool, onTool, color, onColor, onClear }) => (
  <div className='flex items-center gap-1 rounded-full bg-black/70 p-1.5 backdrop-blur'>
    {TOOLS.map((t) => {
      const Icon = t.icon;
      const active = tool === t.id;
      return (
        <button
          key={t.id}
          type='button'
          title={t.label}
          onClick={() => onTool(active ? 'off' : t.id)}
          className={`rounded-full p-2 transition ${
            active ? 'bg-white/90 text-black' : 'text-white/80 hover:bg-white/15'
          }`}>
          <Icon className='size-4' />
        </button>
      );
    })}
    {tool !== 'off' && tool !== 'eraser' && (
      <div className='mx-1 flex items-center gap-1 border-l border-white/20 pl-2'>
        {ANNOT_COLORS.map((c) => (
          <button
            key={c}
            type='button'
            title={`Color ${c}`}
            onClick={() => onColor(c)}
            className={`size-4 rounded-full border border-white/40 transition ${
              color === c ? 'scale-125 ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    )}
    <button
      type='button'
      title='Clear annotations (C)'
      onClick={onClear}
      className='rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white'>
      <FiTrash2 className='size-4' />
    </button>
  </div>
);
