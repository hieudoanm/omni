'use client';

import { type FC, useState } from 'react';
import { useData } from '@/lib/office/tasks/data-provider';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Card } from '@/lib/office/tasks/types';

interface CalendarViewProps {
  boardId: string;
}

export const CalendarView: FC<CalendarViewProps> = ({ boardId }) => {
  const { boards, lists, cards, updateCard } = useData();
  const board = boards.find((b) => b.id === boardId);
  const boardLists = board
    ? board.listIds.map((id) => lists.find((l) => l.id === id)).filter(Boolean)
    : [];
  const boardCards = boardLists.flatMap((list) =>
    (list?.cardIds ?? [])
      .map((cid) => cards.find((c) => c.id === cid))
      .filter((c): c is Card => Boolean(c)),
  );
  const datedCards = boardCards.filter((c) => !c.archived && c.dueDate);

  const [month, setMonth] = useState(new Date());
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  const year = month.getFullYear();
  const m = month.getMonth();

  const handleDrop = (day: number) => {
    if (dragCardId) {
      updateCard(dragCardId, { dueDate: new Date(year, m, day).getTime() });
    }
    setDragCardId(null);
    setDragOverDay(null);
  };

  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const days: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getCardsForDay = (day: number): Card[] => {
    const date = new Date(year, m, day).getTime();
    const next = new Date(year, m, day + 1).getTime();
    return datedCards.filter((c) => c.dueDate! >= date && c.dueDate! < next);
  };

  return (
    <div className='bg-base-300 flex h-full min-w-0 flex-1 flex-col'>
      <div className='flex items-center px-4 py-3'>
        <div className='bg-base-200 flex items-center gap-1 rounded-lg'>
          <button
            type='button'
            onClick={() => setMonth(new Date(year, m - 1))}
            aria-label='Previous month'
            className='btn btn-ghost btn-sm btn-circle'>
            <FiChevronLeft className='size-4' />
          </button>
          <span className='text-sm font-medium'>
            {month.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type='button'
            onClick={() => setMonth(new Date(year, m + 1))}
            aria-label='Next month'
            className='btn btn-ghost btn-sm btn-circle'>
            <FiChevronRight className='size-4' />
          </button>
        </div>
      </div>
      <div className='flex-1 overflow-auto px-4 pb-6'>
        <div className='mx-auto max-w-5xl'>
          <div className='bg-base-300 grid grid-cols-7 gap-px overflow-hidden rounded-lg'>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className='bg-base-200 p-2 text-center text-xs font-semibold'>
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayCards = day ? getCardsForDay(day) : [];
              const isToday =
                day === new Date().getDate() &&
                m === new Date().getMonth() &&
                year === new Date().getFullYear();
              return (
                <div
                  key={i}
                  onDragOver={(e) => {
                    if (!day) return;
                    e.preventDefault();
                    setDragOverDay(day);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={() => day && handleDrop(day)}
                  className={`bg-base-100 min-h-[80px] p-1 ${
                    isToday ? 'bg-primary/10' : ''
                  } ${dragOverDay === day ? 'ring-primary ring-2' : ''}`}>
                  {day && (
                    <span
                      className={`text-xs ${isToday ? 'text-primary font-bold' : 'opacity-50'}`}>
                      {day}
                    </span>
                  )}
                  {dayCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDragCardId(card.id)}
                      className='mt-0.5 truncate rounded px-1 py-0.5 text-[10px]'
                      style={{
                        backgroundColor: card.coverColor ?? '#374151',
                        color: 'white',
                      }}>
                      {card.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

CalendarView.displayName = 'CalendarView';
