'use client';

import { FC } from 'react';
import { FiX } from 'react-icons/fi';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string; label: string }> = [
  { keys: '↑ ↓ ← →', label: 'Move selection' },
  { keys: 'Shift + Arrows', label: 'Extend selection' },
  { keys: 'Tab', label: 'Move right' },
  { keys: 'Enter / F2', label: 'Edit cell' },
  { keys: 'Escape', label: 'Cancel edit / close panels' },
  { keys: 'Backspace / Delete', label: 'Clear cells' },
  { keys: 'Ctrl/⌘ + C / X / V', label: 'Copy / cut / paste' },
  { keys: 'Ctrl/⌘ + F', label: 'Find & replace' },
  { keys: 'Ctrl/⌘ + K', label: 'This panel' },
];

const ShortcutsModal: FC<ShortcutsModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      onClick={onClose}>
      <div
        className='border-base-300 bg-base-100 w-full max-w-md rounded-xl border p-4 shadow-2xl'
        onClick={(event) => event.stopPropagation()}
        role='dialog'
        aria-label='Keyboard shortcuts'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold'>Keyboard shortcuts</h2>
          <button className='btn btn-ghost btn-xs' aria-label='Close shortcuts' onClick={onClose}>
            <FiX />
          </button>
        </div>
        <ul className='divide-base-300 divide-y'>
          {SHORTCUTS.map(({ keys, label }) => (
            <li key={label} className='flex items-center justify-between py-2 text-sm'>
              <span>{label}</span>
              <kbd className='bg-base-300 rounded-md px-2 py-0.5 font-mono text-xs'>{keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ShortcutsModal;
