'use client';

import { FC, useRef, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import type { Sheet } from '@/lib/office/csv/types';

interface SheetTabsProps {
  sheets: Sheet[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const SheetTabs: FC<SheetTabsProps> = ({
  sheets,
  activeId,
  onSelect,
  onAdd,
  onRemove,
  onRename,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const beginRename = (id: string, name: string): void => {
    setRenamingId(id);
    setDraft(name);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const commitRename = (id: string): void => {
    const name = draft.trim();
    if (name) onRename(id, name);
    setRenamingId(null);
  };

  return (
    <div className='no-print border-base-300 bg-base-200 flex items-center gap-1 overflow-x-auto border-t px-2 py-1'>
      {sheets.map((sheet) => {
        const isActive = sheet.id === activeId;
        const isRenaming = sheet.id === renamingId;
        return (
          <div
            key={sheet.id}
            className={`flex items-center gap-1 rounded-t-md px-3 py-1 text-xs ${
              isActive
                ? 'bg-base-100 text-base-content'
                : 'bg-base-300 text-base-content/70 hover:text-base-content'
            }`}
            onClick={() => onSelect(sheet.id)}
            onDoubleClick={() => beginRename(sheet.id, sheet.name)}
            role='tab'
            aria-selected={isActive}
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSelect(sheet.id);
            }}>
            {isRenaming ? (
              <input
                ref={inputRef}
                aria-label='Sheet name'
                className='bg-base-100 w-24 outline-none'
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                onBlur={() => commitRename(sheet.id)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === 'Enter') commitRename(sheet.id);
                  if (event.key === 'Escape') setRenamingId(null);
                }}
              />
            ) : (
              sheet.name
            )}
            {!isRenaming && sheets.length > 1 && (
              <button
                aria-label={`Delete sheet ${sheet.name}`}
                className='hover:text-error text-base-content/50'
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(sheet.id);
                }}>
                <FiX />
              </button>
            )}
          </div>
        );
      })}
      <button aria-label='Add sheet' className='btn btn-ghost btn-xs' onClick={onAdd}>
        <FiPlus />
      </button>
    </div>
  );
};

export default SheetTabs;
