'use client';

import BoardFilterBar from '@/components/office/tasks/organisms/BoardFilterBar';
import { generateId } from '@/data/office/tasks/models';
import { useData } from '@/lib/office/tasks/data-provider';
import { useToast } from '@/lib/office/tasks/toast';
import type {
  BoardRole,
  CardComment,
  Card as CardType,
  DueFilter,
  List as ListType,
  PriorityFilter,
} from '@/lib/office/tasks/types';
import { CURRENT_USER_ID, CURRENT_USER_NAME, getBoardRole } from '@/lib/office/tasks/collab';
import { formatDate, formatRelativeTime } from '@/lib/office/tasks/format';
import { motion } from 'motion/react';
import { useEffect, useRef, useState, type FC } from 'react';
import {
  FiArchive,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCopy,
  FiMoreHorizontal,
  FiPlus,
  FiRotateCcw,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

type SortMode = 'manual' | 'due' | 'priority' | 'name' | 'created';
const SORT_OPTIONS: SortMode[] = ['manual', 'due', 'priority', 'name', 'created'];
const priorityRank: Record<CardType['priority'], number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
};

const applySort = (cardList: CardType[], mode: SortMode): CardType[] => {
  if (mode === 'manual') return cardList;
  const sorted = [...cardList];
  switch (mode) {
    case 'due':
      sorted.sort(
        (a, b) => (a.dueDate ?? Number.POSITIVE_INFINITY) - (b.dueDate ?? Number.POSITIVE_INFINITY),
      );
      break;
    case 'priority':
      sorted.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
      break;
    case 'name':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'created':
      sorted.sort((a, b) => a.createdAt - b.createdAt);
      break;
  }
  return sorted;
};

const priorityColors: Record<string, string> = {
  low: 'badge-success',
  medium: 'badge-warning',
  high: 'badge-error',
  urgent: 'badge-error',
};

const Highlight: FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className='rounded px-0.5'>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const renderMentions = (text: string) =>
  text.split(/(@[A-Za-z][\w\s]*)/g).map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className='text-primary font-semibold'>
        {part}
      </span>
    ) : (
      part
    ),
  );

const matchesDue = (due: number | null, filter: DueFilter): boolean => {
  if (filter === 'all') return true;
  if (filter === 'none') return due == null;
  if (due == null) return false;
  const now = Date.now();
  if (filter === 'overdue') return due < now;
  if (filter === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return due >= start.getTime() && due < start.getTime() + 86400000;
  }
  return due <= now + 86400000 * 7;
};
const LONG_PRESS_MS = 500;
const TOUCH_MOVE_TOLERANCE = 10;

interface KanbanBoardProps {
  boardId: string;
  search: string;
  searchRef: React.RefObject<HTMLInputElement | null>;
  showArchive: boolean;
  setShowArchive: (v: boolean) => void;
}

export const KanbanBoard: FC<KanbanBoardProps> = ({
  boardId,
  search,
  searchRef,
  showArchive,
  setShowArchive,
}) => {
  const {
    boards,
    lists,
    cards,
    labels,
    members,
    createList,
    addActivity,
    createCard,
    moveCard,
    moveList,
    updateCard,
    updateList,
    copyList,
    archiveList,
    archiveCard,
    deleteCard,
    restoreList,
    restoreCard,
    toggleChecklistItem,
  } = useData();
  const { addToast } = useToast();
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [dragCardId, setDragCardId] = useState<string | null>(null);
  const [dragListId, setDragListId] = useState<string | null>(null);
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [dueFilter, setDueFilter] = useState<DueFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [listMenuFor, setListMenuFor] = useState<string | null>(null);
  const [sortModes, setSortModes] = useState<Record<string, SortMode>>({});
  const [newComment, setNewComment] = useState('');
  const [touchDrag, setTouchDrag] = useState<{
    kind: 'card' | 'list';
    id: string;
  } | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  const board = boards.find((b) => b.id === boardId);
  const boardLists = board
    ? (
        board.listIds.map((id) => lists.find((l) => l.id === id)).filter(Boolean) as ListType[]
      ).filter((l) => !l.archived)
    : [];
  const archivedLists = board
    ? (
        board.listIds.map((id) => lists.find((l) => l.id === id)).filter(Boolean) as ListType[]
      ).filter((l) => l.archived)
    : [];
  const archivedCards = cards.filter(
    (c) => c.archived && boardLists.some((l) => l.cardIds.includes(c.id)),
  );
  const query = search.trim().toLowerCase();
  const firstListId = boardLists[0]?.id ?? null;
  const currentRole: BoardRole = getBoardRole(board, CURRENT_USER_ID);
  const canEdit = currentRole !== 'viewer';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const key = e.key.toLowerCase();
      if (key === 'n') {
        e.preventDefault();
        if (firstListId) setAddingToList(firstListId);
      } else if (key === 'q' || key === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [firstListId]);

  const handleCreateList = async () => {
    if (!newListName.trim() || !board) return;
    const list = await createList(board.id, newListName.trim());
    setNewListName('');
    setShowNewList(false);
    addActivity(board.id, null, `${CURRENT_USER_NAME} created list "${list.name}"`);
    addToast('List created', 'success');
  };

  const handleCreateCard = async (listId: string) => {
    if (!newCardTitle.trim()) return;
    const card = await createCard(listId, newCardTitle.trim());
    setNewCardTitle('');
    setAddingToList(null);
    addActivity(boardId, card.id, `${CURRENT_USER_NAME} created "${card.title}"`);
    addToast('Card created', 'success');
  };

  const handleDragStart = (cardId: string) => setDragCardId(cardId);
  const handleListDragStart = (listId: string) => setDragListId(listId);
  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault();
    setDragOverListId(listId);
  };
  const handleDrop = async (e: React.DragEvent, destListId: string) => {
    e.preventDefault();
    if (dragCardId) {
      const sourceList = boardLists.find((l) => l.cardIds.includes(dragCardId));
      if (!sourceList) return;
      const destList = boardLists.find((l) => l.id === destListId);
      if (!destList) return;
      await moveCard(dragCardId, sourceList.id, destListId, destList.cardIds.length);
      const movedCard = cards.find((c) => c.id === dragCardId);
      addActivity(
        boardId,
        dragCardId,
        `${CURRENT_USER_NAME} moved "${movedCard?.title ?? 'card'}" to ${destList.name}`,
      );
    } else if (dragListId) {
      const newIndex = boardLists.findIndex((l) => l.id === destListId);
      if (newIndex !== -1) {
        await moveList(dragListId, boardId, newIndex);
      }
    }
    setDragCardId(null);
    setDragListId(null);
    setDragOverListId(null);
  };

  const clearTouchTimer = () => {
    if (touchTimerRef.current !== null) {
      window.clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const startTouchDrag = (kind: 'card' | 'list', id: string) => {
    clearTouchTimer();
    touchTimerRef.current = window.setTimeout(() => {
      touchTimerRef.current = null;
      setTouchDrag({ kind, id });
      if (kind === 'card') setDragCardId(id);
      else setDragListId(id);
    }, LONG_PRESS_MS);
  };

  const handleCardTouchStart = (e: React.TouchEvent, cardId: string) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    startTouchDrag('card', cardId);
  };

  const handleListTouchStart = (e: React.TouchEvent, listId: string) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    startTouchDrag('list', listId);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchTimerRef.current === null || !touchStartRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    if (Math.hypot(dx, dy) > TOUCH_MOVE_TOLERANCE) clearTouchTimer();
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    clearTouchTimer();
    const drag = touchDrag;
    touchStartRef.current = null;
    if (drag) {
      const t = e.changedTouches[0];
      const listEl = t
        ? (document
            .elementFromPoint(t.clientX, t.clientY)
            ?.closest('[data-list-id]') as HTMLElement | null)
        : null;
      const destId = listEl?.dataset.listId;
      if (destId) {
        if (drag.kind === 'card') {
          const sourceList = boardLists.find((l) => l.cardIds.includes(drag.id));
          const destList = boardLists.find((l) => l.id === destId);
          if (sourceList && destList && sourceList.id !== destId) {
            await moveCard(drag.id, sourceList.id, destId, destList.cardIds.length);
            const movedCard = cards.find((c) => c.id === drag.id);
            addActivity(
              boardId,
              drag.id,
              `${CURRENT_USER_NAME} moved "${movedCard?.title ?? 'card'}" to ${destList.name}`,
            );
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 0);
          }
        } else {
          const newIndex = boardLists.findIndex((l) => l.id === destId);
          if (newIndex !== -1) {
            await moveList(drag.id, boardId, newIndex);
          }
        }
      }
      setTouchDrag(null);
      setDragCardId(null);
      setDragListId(null);
      setDragOverListId(null);
    }
  };

  const handleTouchCancel = () => {
    clearTouchTimer();
    touchStartRef.current = null;
    setTouchDrag(null);
    setDragCardId(null);
    setDragListId(null);
    setDragOverListId(null);
  };

  const handleAddComment = async () => {
    if (!selectedCard || !newComment.trim()) return;
    const comment: CardComment = {
      id: generateId(),
      text: newComment.trim(),
      author: CURRENT_USER_NAME,
      createdAt: Date.now(),
    };
    await updateCard(selectedCard.id, {
      comments: [...selectedCard.comments, comment],
    });
    addActivity(
      boardId,
      selectedCard.id,
      `${CURRENT_USER_NAME} commented on "${selectedCard.title}"`,
    );
    setNewComment('');
  };

  const getDueDateColor = (due: number | null) => {
    if (!due) return '';
    if (due < Date.now()) return 'badge-error';
    if (due < Date.now() + 86400000) return 'badge-warning';
    return 'badge-success';
  };

  if (!board)
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-base-content/50'>Loading...</p>
      </div>
    );

  return (
    <div className='bg-base-300 flex h-full min-w-0 flex-1 flex-col'>
      {(labels.length > 0 || members.length > 0) && (
        <BoardFilterBar
          boardId={boardId}
          labels={labels}
          members={members}
          filters={{ activeLabel, activeMember, dueFilter, priorityFilter }}
          onChange={({ activeLabel: al, activeMember: am, dueFilter: d, priorityFilter: p }) => {
            setActiveLabel(al);
            setActiveMember(am);
            setDueFilter(d);
            setPriorityFilter(p);
          }}
        />
      )}

      <div
        className='flex flex-1 gap-4 overflow-x-auto p-4'
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}>
        {boardLists.map((list) => {
          const allListCards = list.cardIds
            .map((id) => cards.find((c) => c.id === id))
            .filter((c): c is CardType => c != null && !c.archived);
          const listCards = applySort(
            allListCards
              .filter((c) => !query || c.title.toLowerCase().includes(query))
              .filter((c) => !activeLabel || c.labels.includes(activeLabel))
              .filter((c) => !activeMember || c.memberIds.includes(activeMember))
              .filter((c) => matchesDue(c.dueDate, dueFilter))
              .filter((c) => priorityFilter === 'all' || c.priority === priorityFilter),
            sortModes[list.id] ?? 'manual',
          );
          return (
            <div
              key={list.id}
              data-list-id={list.id}
              className={`bg-base-200 relative flex w-72 flex-shrink-0 flex-col rounded-lg ${dragOverListId === list.id ? 'ring-primary ring-2' : ''} ${dragListId === list.id ? 'opacity-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDrop={(e) => handleDrop(e, list.id)}>
              <div
                className='flex cursor-grab items-center justify-between p-3'
                draggable
                onDragStart={() => handleListDragStart(list.id)}
                onTouchStart={(e) => handleListTouchStart(e, list.id)}>
                <div className='flex items-center gap-2'>
                  <h3 className='text-sm font-semibold'>{list.name}</h3>
                  <span className='badge badge-sm'>{allListCards.length}</span>
                  {sortModes[list.id] && sortModes[list.id] !== 'manual' && (
                    <span className='badge badge-ghost badge-xs'>by {sortModes[list.id]}</span>
                  )}
                </div>
                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    aria-label={`Menu for ${list.name}`}
                    onClick={() => setListMenuFor(listMenuFor === list.id ? null : list.id)}
                    className='btn btn-ghost btn-xs btn-circle'>
                    <FiMoreHorizontal className='size-3' />
                  </button>
                  <button
                    type='button'
                    onClick={() => updateList(list.id, { collapsed: !list.collapsed })}
                    className='btn btn-ghost btn-xs btn-circle'>
                    {list.collapsed ? (
                      <FiChevronRight className='size-3' />
                    ) : (
                      <FiChevronDown className='size-3' />
                    )}
                  </button>
                </div>
              </div>

              {listMenuFor === list.id && (
                <div className='bg-base-100 absolute top-9 right-3 z-30 w-44 rounded-lg border p-1 shadow-lg'>
                  <p className='px-2 pt-1 text-[10px] font-bold uppercase opacity-50'>Sort by</p>
                  {SORT_OPTIONS.map((mode) => (
                    <button
                      key={mode}
                      type='button'
                      onClick={() => {
                        setSortModes((p) => ({ ...p, [list.id]: mode }));
                        setListMenuFor(null);
                      }}
                      className={`btn btn-ghost btn-xs w-full justify-start ${sortModes[list.id] === mode ? 'text-primary' : ''}`}>
                      {mode}
                    </button>
                  ))}
                  {canEdit && (
                    <>
                      <div className='divider divider-xs my-1' />
                      <button
                        type='button'
                        onClick={() => {
                          copyList(list.id);
                          setListMenuFor(null);
                          addToast('List copied', 'success');
                        }}
                        className='btn btn-ghost btn-xs w-full justify-start'>
                        <FiCopy className='size-3' /> Copy list
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          archiveList(list.id);
                          setListMenuFor(null);
                          addToast('List archived', 'info');
                        }}
                        className='btn btn-ghost btn-xs text-error w-full justify-start'>
                        <FiArchive className='size-3' /> Archive list
                      </button>
                    </>
                  )}
                </div>
              )}

              {!list.collapsed && (
                <div className='flex-1 space-y-2 overflow-auto px-3 pb-3'>
                  {listCards.map((card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15 }}>
                      <div
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        onClick={() => {
                          if (suppressClickRef.current) {
                            suppressClickRef.current = false;
                            return;
                          }
                          setSelectedCard(card);
                        }}
                        onTouchStart={(e) => handleCardTouchStart(e, card.id)}
                        className={`card bg-base-100 cursor-pointer p-2 shadow-sm transition-all hover:shadow-md ${dragCardId === card.id ? 'opacity-50' : ''} ${touchDrag?.kind === 'card' && touchDrag.id === card.id ? 'ring-primary pointer-events-none ring-2' : ''} ${card.coverColor ? 'border-l-4' : ''}`}
                        style={card.coverColor ? { borderLeftColor: card.coverColor } : undefined}>
                        {card.coverImage && (
                          <img
                            src={card.coverImage}
                            alt='Card cover'
                            className='mb-1 h-16 w-full rounded object-cover'
                          />
                        )}
                        {card.labels.length > 0 && (
                          <div className='mb-1 flex flex-wrap gap-1'>
                            {card.labels.slice(0, 3).map((lid) => {
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
                            {card.labels.length > 3 && (
                              <span className='badge badge-xs'>+{card.labels.length - 3}</span>
                            )}
                          </div>
                        )}
                        <p className='text-xs font-medium'>
                          <Highlight text={card.title} query={query} />
                        </p>
                        <div className='mt-1 flex items-center gap-2 text-xs opacity-50'>
                          {card.dueDate && (
                            <span className={`badge badge-xs ${getDueDateColor(card.dueDate)}`}>
                              <FiCalendar className='size-2' /> {formatDate(card.dueDate)}
                            </span>
                          )}
                          {card.checklistItems.length > 0 && (
                            <span>
                              {card.checklistItems.filter((i) => i.checked).length}/
                              {card.checklistItems.length}
                            </span>
                          )}
                          {card.comments.length > 0 && <span>{card.comments.length} comments</span>}
                          {card.priority !== 'medium' && (
                            <span className={`badge badge-xs ${priorityColors[card.priority]}`}>
                              {card.priority}
                            </span>
                          )}
                        </div>
                        {card.memberIds.length > 0 && (
                          <div className='mt-1 flex -space-x-1'>
                            {card.memberIds.slice(0, 3).map((mid) => {
                              const m = members.find((x) => x.id === mid);
                              return m ? (
                                <div
                                  key={mid}
                                  className='bg-base-300 border-base-100 flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-bold'>
                                  {m.avatar}
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {dragCardId && dragOverListId === list.id && (
                    <div className='border-primary/40 bg-primary/10 rounded-lg border-2 border-dashed px-3 py-4 text-center text-xs opacity-70'>
                      Drop here
                    </div>
                  )}
                </div>
              )}

              {canEdit && (
                <div className='p-3 pt-0'>
                  {addingToList === list.id ? (
                    <div className='flex gap-1'>
                      <input
                        type='text'
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateCard(list.id);
                          if (e.key === 'Escape') {
                            setAddingToList(null);
                            setNewCardTitle('');
                          }
                        }}
                        placeholder='Card title'
                        className='input input-xs flex-1'
                        autoFocus
                      />
                      <button
                        type='button'
                        onClick={() => handleCreateCard(list.id)}
                        className='btn btn-primary btn-xs'>
                        <FiCheck className='size-3' />
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setAddingToList(null);
                          setNewCardTitle('');
                        }}
                        className='btn btn-ghost btn-xs'>
                        <FiX className='size-3' />
                      </button>
                    </div>
                  ) : (
                    <button
                      type='button'
                      onClick={() => setAddingToList(list.id)}
                      className='btn btn-ghost btn-xs w-full justify-start'>
                      <FiPlus className='size-3' /> Add card
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {canEdit && (
          <div className='w-72 flex-shrink-0'>
            {showNewList ? (
              <div className='bg-base-200 rounded-lg p-3'>
                <input
                  type='text'
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateList();
                    if (e.key === 'Escape') {
                      setShowNewList(false);
                      setNewListName('');
                    }
                  }}
                  placeholder='List name'
                  className='input input-sm w-full'
                  autoFocus
                />
                <div className='mt-2 flex gap-2'>
                  <button
                    type='button'
                    onClick={handleCreateList}
                    className='btn btn-primary btn-xs'>
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setShowNewList(false);
                      setNewListName('');
                    }}
                    className='btn btn-ghost btn-xs'>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type='button'
                onClick={() => setShowNewList(true)}
                className='btn btn-ghost w-full justify-start'>
                <FiPlus className='size-4' /> Add list
              </button>
            )}
          </div>
        )}
      </div>

      {selectedCard && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-base-100 card max-h-[80vh] w-full max-w-lg overflow-auto shadow-xl'>
            <div className='card-body'>
              <div className='flex items-center justify-between'>
                <input
                  type='text'
                  value={selectedCard.title}
                  onChange={(e) => updateCard(selectedCard.id, { title: e.target.value })}
                  className='input input-ghost flex-1 font-bold'
                />
                <button
                  type='button'
                  onClick={() => setSelectedCard(null)}
                  className='btn btn-ghost btn-sm btn-circle'>
                  <FiX className='size-4' />
                </button>
              </div>
              <textarea
                value={selectedCard.description}
                onChange={(e) => updateCard(selectedCard.id, { description: e.target.value })}
                placeholder='Add a description...'
                className='textarea textarea-bordered mt-2 w-full'
                rows={3}
              />

              <div className='mt-3 flex flex-wrap gap-2'>
                {labels.map((lbl) => (
                  <button
                    key={lbl.id}
                    type='button'
                    onClick={() => {
                      const newLabels = selectedCard.labels.includes(lbl.id)
                        ? selectedCard.labels.filter((l) => l !== lbl.id)
                        : [...selectedCard.labels, lbl.id];
                      updateCard(selectedCard.id, { labels: newLabels });
                    }}
                    className={`badge badge-sm cursor-pointer ${selectedCard.labels.includes(lbl.id) ? 'opacity-100' : 'opacity-30'}`}
                    style={{ backgroundColor: lbl.color, color: 'white' }}>
                    {lbl.name}
                  </button>
                ))}
              </div>

              <div className='mt-3 flex gap-2'>
                <select
                  aria-label='Card priority'
                  value={selectedCard.priority}
                  onChange={(e) =>
                    updateCard(selectedCard.id, {
                      priority: e.target.value as CardType['priority'],
                    })
                  }
                  className='select select-sm'>
                  <option value='low'>Low</option>
                  <option value='medium'>Medium</option>
                  <option value='high'>High</option>
                  <option value='urgent'>Urgent</option>
                </select>
              </div>

              {selectedCard.checklistItems.length > 0 && (
                <div className='mt-3'>
                  <h4 className='mb-1 text-xs font-semibold'>Checklist</h4>
                  {selectedCard.checklistItems.map((item) => (
                    <label key={item.id} className='label cursor-pointer justify-start gap-2'>
                      <input
                        type='checkbox'
                        className='checkbox checkbox-sm'
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(selectedCard.id, item.id)}
                      />
                      <span className={`text-sm ${item.checked ? 'line-through opacity-50' : ''}`}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className='mt-3'>
                <h4 className='mb-1 text-xs font-semibold'>Comments</h4>
                {selectedCard.comments.length === 0 && (
                  <p className='text-xs opacity-40'>No comments yet.</p>
                )}
                {selectedCard.comments.map((cmt) => (
                  <div key={cmt.id} className='mt-2 flex items-start gap-2 text-xs'>
                    <div className='bg-base-300 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-bold'>
                      {cmt.author.charAt(0)}
                    </div>
                    <div className='min-w-0'>
                      <p className='leading-snug'>
                        <span className='font-semibold'>{cmt.author}</span>{' '}
                        {renderMentions(cmt.text)}
                      </p>
                      <p className='mt-0.5 text-[10px] opacity-40'>
                        {formatRelativeTime(cmt.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {canEdit && (
                  <div className='mt-2 flex gap-1'>
                    <input
                      type='text'
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment();
                      }}
                      placeholder='Write a comment... (@name to mention)'
                      aria-label='Add comment'
                      className='input input-bordered input-xs flex-1'
                    />
                    <button
                      type='button'
                      onClick={handleAddComment}
                      className='btn btn-primary btn-xs'>
                      <FiSend className='size-3' />
                    </button>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className='mt-3 flex gap-2'>
                  <button
                    type='button'
                    onClick={() => {
                      archiveCard(selectedCard.id);
                      addActivity(
                        boardId,
                        selectedCard.id,
                        `${CURRENT_USER_NAME} archived "${selectedCard.title}"`,
                      );
                      setSelectedCard(null);
                      addToast('Card archived', 'info');
                    }}
                    className='btn btn-ghost btn-sm'>
                    <FiArchive className='size-4' /> Archive
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      deleteCard(selectedCard.id);
                      addActivity(
                        boardId,
                        selectedCard.id,
                        `${CURRENT_USER_NAME} deleted "${selectedCard.title}"`,
                      );
                      setSelectedCard(null);
                      addToast('Card deleted', 'info');
                    }}
                    className='btn btn-ghost btn-sm text-error'>
                    <FiTrash2 className='size-4' /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showArchive && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='bg-base-100 card max-h-[70vh] w-full max-w-md overflow-auto shadow-xl'>
            <div className='card-body'>
              <div className='flex items-center justify-between'>
                <h2 className='card-title text-sm'>Archived</h2>
                <button
                  type='button'
                  onClick={() => setShowArchive(false)}
                  className='btn btn-ghost btn-sm btn-circle'>
                  <FiX className='size-4' />
                </button>
              </div>
              {archivedLists.length === 0 && archivedCards.length === 0 && (
                <p className='text-sm opacity-50'>Nothing archived.</p>
              )}
              {archivedLists.length > 0 && (
                <div className='space-y-1'>
                  <h3 className='text-xs font-bold uppercase opacity-50'>Lists</h3>
                  {archivedLists.map((l) => (
                    <div key={l.id} className='flex items-center gap-2 text-sm'>
                      <span className='flex-1'>{l.name}</span>
                      <button
                        type='button'
                        onClick={() => {
                          restoreList(l.id);
                          addToast('List restored', 'success');
                        }}
                        className='btn btn-ghost btn-xs'>
                        <FiRotateCcw className='size-3' /> Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {archivedCards.length > 0 && (
                <div className='space-y-1'>
                  <h3 className='text-xs font-bold uppercase opacity-50'>Cards</h3>
                  {archivedCards.map((c) => (
                    <div key={c.id} className='flex items-center gap-2 text-sm'>
                      <span className='flex-1'>{c.title}</span>
                      <button
                        type='button'
                        onClick={() => {
                          restoreCard(c.id);
                          addToast('Card restored', 'success');
                        }}
                        className='btn btn-ghost btn-xs'>
                        <FiRotateCcw className='size-3' /> Restore
                      </button>
                      <button
                        type='button'
                        aria-label='Delete archived card'
                        onClick={() => {
                          deleteCard(c.id);
                          addToast('Card deleted', 'info');
                        }}
                        className='btn btn-ghost btn-xs text-error'>
                        <FiTrash2 className='size-3' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

KanbanBoard.displayName = 'KanbanBoard';
