'use client';

import { type FC } from 'react';
import { useData } from '@/lib/office/tasks/data-provider';
import { formatDate } from '@/lib/office/tasks/format';
import type { Card } from '@/lib/office/tasks/types';

interface TimelineViewProps {
  boardId: string;
}

export const TimelineView: FC<TimelineViewProps> = ({ boardId }) => {
  const { boards, lists, cards } = useData();
  const board = boards.find((b) => b.id === boardId);
  const boardLists = board
    ? board.listIds.map((id) => lists.find((l) => l.id === id)).filter(Boolean)
    : [];
  const boardCards = boardLists.flatMap((list) =>
    (list?.cardIds ?? [])
      .map((cid) => cards.find((c) => c.id === cid))
      .filter((c): c is Card => Boolean(c)),
  );
  const datedCards = boardCards
    .filter((c) => !c.archived && c.dueDate)
    .sort((a, b) => a.dueDate! - b.dueDate!);

  const minDate = datedCards.length > 0 ? datedCards[0].dueDate! : Date.now();
  const maxDate =
    datedCards.length > 0 ? datedCards[datedCards.length - 1].dueDate! : Date.now() + 86400000 * 30;
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / 86400000));

  return (
    <div className='bg-base-300 flex h-full min-w-0 flex-1 flex-col'>
      <div className='flex-1 overflow-auto p-6'>
        <div className='mx-auto max-w-5xl'>
          {datedCards.length === 0 ? (
            <p className='text-base-content/50 py-8 text-center'>No cards with due dates</p>
          ) : (
            <div className='space-y-2'>
              {datedCards.map((card) => {
                const offset = Math.max(0, Math.ceil((card.dueDate! - minDate) / 86400000));
                const pct = (offset / totalDays) * 100;
                return (
                  <div key={card.id} className='flex items-center gap-3'>
                    <span className='w-48 truncate text-xs font-medium'>{card.title}</span>
                    <div className='bg-base-200 relative h-6 flex-1 rounded'>
                      <div
                        className='absolute top-0 left-0 h-full rounded'
                        style={{
                          left: `${pct}%`,
                          width: '60px',
                          backgroundColor: card.coverColor ?? '#3b82f6',
                        }}>
                        <span className='absolute inset-0 flex items-center justify-center text-[9px] text-white drop-shadow'>
                          {formatDate(card.dueDate!)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TimelineView.displayName = 'TimelineView';
