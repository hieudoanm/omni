'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { FiSave, FiDownload, FiTrash2 } from 'react-icons/fi';
import { BoardFilters, Preset } from '@/lib/office/tasks/types';

interface PresetsMenuProps {
  boardId: string;
  filters: BoardFilters;
  onApply: (filters: BoardFilters) => void;
}

const STORAGE_KEY = (boardId: string) => `board-filters:${boardId}`;

const PresetsMenu: FC<PresetsMenuProps> = ({ boardId, filters, onApply }) => {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(boardId));
      if (raw) setPresets(JSON.parse(raw));
    } catch {
      setPresets([]);
    }
  }, [boardId]);

  const save = useCallback(() => {
    const name = window.prompt('Preset name:');
    if (!name) return;
    const preset: Preset = { ...filters, id: Date.now().toString(), name };
    const next = [...presets, preset];
    setPresets(next);
    localStorage.setItem(STORAGE_KEY(boardId), JSON.stringify(next));
  }, [boardId, filters, presets]);

  const load = useCallback(
    (preset: Preset) => {
      const { id: _, name: __, ...rest } = preset;
      onApply(rest);
    },
    [onApply],
  );

  const remove = useCallback(
    (id: string) => {
      const next = presets.filter((p) => p.id !== id);
      setPresets(next);
      localStorage.setItem(STORAGE_KEY(boardId), JSON.stringify(next));
    },
    [boardId, presets],
  );

  return (
    <div className='dropdown dropdown-end'>
      <label tabIndex={0} className='btn btn-sm btn-ghost gap-1'>
        <FiSave size={14} />
        Presets
      </label>
      <ul
        tabIndex={0}
        className='dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow'>
        <li>
          <button onClick={save} className='gap-2'>
            <FiSave size={14} /> Save current
          </button>
        </li>
        {presets.length === 0 && (
          <li className='disabled'>
            <span className='text-base-content/50'>No presets saved</span>
          </li>
        )}
        {presets.map((preset) => (
          <li key={preset.id} className='flex flex-row items-center'>
            <button onClick={() => load(preset)} className='flex-1 gap-2'>
              <FiDownload size={14} /> {preset.name}
            </button>
            <button onClick={() => remove(preset.id)} className='btn btn-ghost btn-xs'>
              <FiTrash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PresetsMenu;
