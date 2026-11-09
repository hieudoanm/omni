'use client';

import { type FC } from 'react';
import { useData } from '@/lib/office/tasks/data-provider';
import { formatDate } from '@/lib/office/tasks/format';
import type { Card } from '@/lib/office/tasks/types';

interface ListViewProps {
  boardId: string;
}

export const ListView: FC<ListViewProps> = ({ boardId }) => {
  const { boards, lists, cards, labels, members } = useData();
  const board = boards.find((b) => b.id === boardId);
  const boardLists = board
    ? board.listIds.map((id) => lists.find((l) => l.id === id)).filter(Boolean)
    : [];
  const allCards = boardLists.flatMap((list) =>
    (list?.cardIds ?? [])
      .map((cid) => cards.find((c) => c.id === cid))
      .filter((c): c is Card => Boolean(c && !c.archived)),
  );

  return (
    <div className='bg-base-300 flex h-full min-w-0 flex-1 flex-col'>
      <div className='flex-1 overflow-auto p-6'>
        <div className='mx-auto max-w-5xl overflow-x-auto'>
          <table className='table-zebra table w-full'>
            <thead>
              <tr>
                <th>Title</th>
                <th>List</th>
                <th>Labels</th>
                <th>Assignees</th>
                <th>Due</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {allCards.map((card) => {
                const list = boardLists.find((l) => l?.cardIds.includes(card.id));
                return (
                  <tr key={card.id}>
                    <td className='font-medium'>{card.title}</td>
                    <td className='text-sm opacity-70'>{list?.name}</td>
                    <td>
                      <div className='flex flex-wrap gap-1'>
                        {card.labels.map((lid) => {
                          const lbl = labels.find((l) => l.id === lid);
                          return lbl ? (
                            <span
                              key={lid}
                              className='badge badge-xs'
                              style={{
                                backgroundColor: lbl.color,
                                color: 'white',
                              }}>
                              {lbl.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td>
                      <div className='flex -space-x-1'>
                        {card.memberIds.map((mid) => {
                          const m = members.find((x) => x.id === mid);
                          return m ? (
                            <div
                              key={mid}
                              className='bg-base-300 flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold'>
                              {m.avatar}
                            </div>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className='text-sm'>{card.dueDate ? formatDate(card.dueDate) : '—'}</td>
                    <td>
                      <span
                        className={`badge badge-xs ${
                          card.priority === 'urgent' || card.priority === 'high'
                            ? 'badge-error'
                            : card.priority === 'low'
                              ? 'badge-success'
                              : 'badge-warning'
                        }`}>
                        {card.priority}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allCards.length === 0 && (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-xs opacity-50'>
                    No cards on this board.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

ListView.displayName = 'ListView';
