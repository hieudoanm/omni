'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useData } from '@/lib/office/tasks/data-provider';
import { useToast } from '@/lib/office/tasks/toast';
import { mockTemplates } from '@/data/office/tasks/models';
import {
  FiPlus,
  FiLayout,
  FiTrash2,
  FiSearch,
  FiStar,
  FiArchive,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi';
import { MemberSwitcher } from '@/components/office/tasks/organisms/MemberSwitcher';

const COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#06b6d4',
  '#eab308',
];

interface ProjectSidebarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onOpenArchive: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export const ProjectSidebar: FC<ProjectSidebarProps> = ({
  search,
  onSearchChange,
  searchRef,
  onOpenArchive,
  collapsed,
  onToggleCollapsed,
}) => {
  const { boards, createBoard, createBoardFromTemplate, deleteBoard, toggleStarBoard } = useData();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeId = searchParams.get('id');
  const activeBoard = boards.find((b) => b.id === activeId) ?? boards[0];
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBg, setNewBg] = useState('#3b82f6');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');

  const makeHref = (id: string) =>
    `${pathname === '/apps/office' ? '/apps/office' : '/board'}?id=${id}`;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    if (selectedTemplate === 'blank') {
      await createBoard(newName.trim(), newBg);
    } else {
      await createBoardFromTemplate(newName.trim(), newBg, selectedTemplate);
    }
    setNewName('');
    setSelectedTemplate('blank');
    setShowCreate(false);
    addToast('Board created', 'success');
  };

  if (collapsed) {
    return (
      <aside className='border-base-300 bg-base-100 flex w-12 flex-shrink-0 flex-col items-center border-r'>
        <button
          type='button'
          onClick={onToggleCollapsed}
          aria-label='Expand sidebar'
          title='Expand sidebar'
          className='btn btn-ghost btn-sm btn-circle mt-2'>
          <FiChevronsRight className='size-4' />
        </button>
        <nav className='mt-2 space-y-2'>
          {boards.map((board) => (
            <Link
              key={board.id}
              href={makeHref(board.id)}
              title={board.name}
              className={`mx-auto block h-3 w-3 rounded-full ${
                board.id === activeId ? 'ring-primary ring-2 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: board.background }}
            />
          ))}
        </nav>
        <button
          type='button'
          onClick={() => setShowCreate(true)}
          aria-label='Add project'
          className='btn btn-ghost btn-sm btn-circle mt-2'>
          <FiPlus className='size-4' />
        </button>
        <div className='mt-auto mb-2 flex flex-col items-center gap-2'>
          <MemberSwitcher collapsed />
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className='border-base-300 bg-base-100 flex w-64 flex-shrink-0 flex-col border-r'>
        <div className='border-base-300 flex items-center gap-2 border-b px-4 py-3'>
          <span className='text-sm font-bold'>Projects</span>
          <button
            type='button'
            onClick={onToggleCollapsed}
            aria-label='Collapse sidebar'
            title='Collapse sidebar'
            className='btn btn-ghost btn-xs btn-circle ml-auto'>
            <FiChevronsLeft className='size-4' />
          </button>
          <button
            type='button'
            onClick={() => setShowCreate(true)}
            aria-label='Add project'
            className='btn btn-ghost btn-xs btn-circle'>
            <FiPlus className='size-4' />
          </button>
        </div>

        {activeBoard && (
          <div className='border-base-300 flex items-center gap-3 border-b px-4 py-2'>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className='h-3 w-3 flex-shrink-0 rounded-full'
                  style={{ backgroundColor: activeBoard.background }}
                />
                <h1 className='text-base-content truncate text-sm font-bold'>{activeBoard.name}</h1>
              </div>
              <div className='relative mt-1.5'>
                <FiSearch className='text-base-content/50 absolute top-1/2 left-2 z-50 size-3.5 -translate-y-1/2' />
                <input
                  ref={searchRef}
                  type='text'
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder='Search cards'
                  aria-label='Search cards'
                  className='input input-bordered input-xs w-full pl-7'
                />
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <button
                type='button'
                onClick={() => toggleStarBoard(activeBoard.id)}
                className='btn btn-ghost btn-xs btn-circle'
                aria-label='Toggle star'>
                <FiStar
                  className={`size-4 ${activeBoard.starred ? 'fill-warning text-warning' : ''}`}
                />
              </button>
              <button
                type='button'
                onClick={onOpenArchive}
                className='btn btn-ghost btn-xs btn-circle'
                aria-label='Open archive'>
                <FiArchive className='size-4' />
              </button>
            </div>
          </div>
        )}

        <nav className='flex-1 space-y-0.5 overflow-y-auto p-2'>
          {boards.map((board) => {
            const active = board.id === activeId;
            return (
              <Link
                key={board.id}
                href={makeHref(board.id)}
                className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                  active ? 'bg-base-200' : 'hover:bg-base-200'
                }`}>
                <span
                  className='h-3 w-3 flex-shrink-0 rounded-full'
                  style={{ backgroundColor: board.background }}
                />
                <span className={`flex-1 truncate ${active ? 'font-semibold' : ''}`}>
                  {board.name}
                </span>
                <button
                  type='button'
                  aria-label={`Delete ${board.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    deleteBoard(board.id);
                    addToast('Board deleted', 'info');
                  }}
                  className='btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 hover:opacity-100'>
                  <FiTrash2 className='size-3' />
                </button>
              </Link>
            );
          })}
          {boards.length === 0 && (
            <p className='px-2 py-2 text-xs opacity-50'>No projects yet. Add one!</p>
          )}
        </nav>

        <div className='border-base-300 border-t p-2'>
          <MemberSwitcher />
        </div>
      </aside>

      {showCreate && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-base-100 card w-full max-w-md shadow-xl'>
            <div className='card-body'>
              <h2 className='card-title'>New Board</h2>
              <input
                type='text'
                placeholder='Board name'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className='input input-bordered w-full'
              />
              <div className='flex gap-2'>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type='button'
                    aria-label={`Background color ${c}`}
                    onClick={() => setNewBg(c)}
                    className={`h-8 w-8 rounded-full ${newBg === c ? 'ring-primary ring-2 ring-offset-2' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div>
                <p className='mb-2 text-xs font-semibold opacity-70'>Template</p>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => setSelectedTemplate('blank')}
                    className={`card bg-base-200 p-3 text-left ${selectedTemplate === 'blank' ? 'ring-primary ring-2' : ''}`}>
                    <span className='flex items-center gap-1 text-sm font-semibold'>
                      <FiLayout className='size-4' /> Blank
                    </span>
                    <span className='text-xs opacity-50'>Start from scratch</span>
                  </button>
                  {mockTemplates.map((t) => (
                    <button
                      key={t.id}
                      type='button'
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`card bg-base-200 p-3 text-left ${selectedTemplate === t.id ? 'ring-primary ring-2' : ''}`}>
                      <span className='text-sm font-semibold'>{t.name}</span>
                      <span className='text-xs opacity-50'>{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className='card-actions justify-end'>
                <button
                  type='button'
                  onClick={() => setShowCreate(false)}
                  className='btn btn-ghost'>
                  Cancel
                </button>
                <button type='button' onClick={handleCreate} className='btn btn-primary'>
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ProjectSidebar.displayName = 'ProjectSidebar';
