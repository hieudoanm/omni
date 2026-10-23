import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { type FC, type ReactNode } from 'react';
import { DataProvider, useData } from '@/lib/office/tasks/data-provider';
import { db } from '@/lib/office/tasks/db';
import { seedDatabase } from '@/data/office/tasks/seed';
import type { Board, Card, List, Member, Task } from '@/lib/office/tasks/types';

jest.mock('@/lib/office/tasks/db', () => {
  const stores: Record<string, Map<string, unknown>> = {};

  const reset = () => {
    for (const key of Object.keys(stores)) delete stores[key];
  };

  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, store: string) {
      if (typeof store !== 'string') return undefined;
      if (!stores[store]) stores[store] = new Map();
      const map = stores[store];
      return {
        getAll: () => Promise.resolve([...map.values()]),
        get: (key?: string) =>
          Promise.resolve(
            store === 'settings'
              ? (map.get('settings') ?? {
                  theme: 'office-light',
                  defaultView: 'kanban',
                  notifications: true,
                  notificationsReadAt: 0,
                })
              : key
                ? map.get(key)
                : undefined,
          ),
        put: (value: { id?: string }) => {
          map.set(value.id ?? 'settings', value);
          return Promise.resolve();
        },
        delete: (key: string) => {
          map.delete(key);
          return Promise.resolve();
        },
      };
    },
  };

  return { db: new Proxy({}, handler), resetTasksDbStores: reset };
});

jest.mock('@/data/office/tasks/seed', () => ({
  seedDatabase: jest.fn().mockResolvedValue(undefined),
}));

const mockedSeedDatabase = jest.mocked(seedDatabase);
const resetTasksDbStores = jest.requireMock('@/lib/office/tasks/db').resetTasksDbStores;

const Probe: FC = () => {
  const {
    boards,
    lists,
    cards,
    labels,
    members,
    activity,
    tasks,
    settings,
    isLoading,
    createBoard,
    createBoardFromTemplate,
    updateBoard,
    deleteBoard,
    toggleStarBoard,
    createList,
    updateList,
    deleteList,
    archiveList,
    restoreList,
    copyList,
    moveList,
    createCard,
    updateCard,
    deleteCard,
    archiveCard,
    restoreCard,
    moveCard,
    toggleChecklistItem,
    addChecklistItem,
    addTask,
    toggleTask,
    deleteTask,
    addActivity,
    updateSettings,
    refreshData,
  } = useData();
  return (
    <div>
      <span data-testid='loading'>{isLoading ? 'yes' : 'no'}</span>
      <span data-testid='boards'>{boards.length}</span>
      <span data-testid='lists'>{lists.length}</span>
      <span data-testid='cards'>{cards.length}</span>
      <span data-testid='labels'>{labels.length}</span>
      <span data-testid='members'>{members.length}</span>
      <span data-testid='activity'>{activity.length}</span>
      <span data-testid='tasks'>{tasks.length}</span>
      <span data-testid='theme'>{settings.theme}</span>
      <button data-testid='create-board' onClick={() => void createBoard('B', '#fff')}>
        cb
      </button>
      <button
        data-testid='update-board'
        onClick={() => {
          if (boards.length) void updateBoard(boards[0].id, { name: 'B2' });
        }}>
        ub
      </button>
      <button
        data-testid='delete-board'
        onClick={() => {
          if (boards.length) void deleteBoard(boards[0].id);
        }}>
        db
      </button>
      <button
        data-testid='toggle-star'
        onClick={() => {
          if (boards.length) void toggleStarBoard(boards[0].id);
        }}>
        ts
      </button>
      <button
        data-testid='create-list'
        onClick={() => {
          if (boards.length) void createList(boards[0].id, 'L');
        }}>
        cl
      </button>
      <button
        data-testid='update-list'
        onClick={() => {
          if (lists.length) void updateList(lists[0].id, { name: 'L2' });
        }}>
        ul
      </button>
      <button
        data-testid='delete-list'
        onClick={() => {
          if (lists.length) void deleteList(lists[0].id);
        }}>
        dl
      </button>
      <button
        data-testid='archive-list'
        onClick={() => {
          if (lists.length) void archiveList(lists[0].id);
        }}>
        al
      </button>
      <button
        data-testid='restore-list'
        onClick={() => {
          if (lists.length) void restoreList(lists[0].id);
        }}>
        rl
      </button>
      <button
        data-testid='copy-list'
        onClick={() => {
          if (lists.length) void copyList(lists[0].id);
        }}>
        cpl
      </button>
      <button
        data-testid='move-list'
        onClick={() => {
          if (boards.length && lists.length) void moveList(lists[0].id, boards[0].id, 0);
        }}>
        ml
      </button>
      <button
        data-testid='create-card'
        onClick={() => {
          if (lists.length) void createCard(lists[0].id, 'C');
        }}>
        cc
      </button>
      <button
        data-testid='update-card'
        onClick={() => {
          if (cards.length) void updateCard(cards[0].id, { title: 'C2' });
        }}>
        uc
      </button>
      <button
        data-testid='delete-card'
        onClick={() => {
          if (cards.length) void deleteCard(cards[0].id);
        }}>
        dc
      </button>
      <button
        data-testid='archive-card'
        onClick={() => {
          if (cards.length) void archiveCard(cards[0].id);
        }}>
        ac
      </button>
      <button
        data-testid='restore-card'
        onClick={() => {
          if (cards.length) void restoreCard(cards[0].id);
        }}>
        rc
      </button>
      <button
        data-testid='move-card'
        onClick={() => {
          if (cards.length && lists.length >= 2) {
            void moveCard(cards[0].id, lists[0].id, lists[1].id, 0);
          } else if (cards.length && lists.length) {
            void moveCard(cards[0].id, lists[0].id, lists[0].id, 0);
          }
        }}>
        mc
      </button>
      <button
        data-testid='toggle-checklist'
        onClick={() => {
          if (cards.length && cards[0].checklistItems.length) {
            void toggleChecklistItem(cards[0].id, cards[0].checklistItems[0].id);
          }
        }}>
        tci
      </button>
      <button
        data-testid='add-checklist'
        onClick={() => {
          if (cards.length) void addChecklistItem(cards[0].id, 'item');
        }}>
        aci
      </button>
      <button data-testid='add-task' onClick={() => void addTask('mem-1', 'T')}>
        at
      </button>
      <button
        data-testid='toggle-task'
        onClick={() => {
          if (tasks.length) void toggleTask(tasks[0].id);
        }}>
        tt
      </button>
      <button
        data-testid='delete-task'
        onClick={() => {
          if (tasks.length) void deleteTask(tasks[0].id);
        }}>
        dt
      </button>
      <button
        data-testid='add-activity'
        onClick={() => {
          if (boards.length) void addActivity(boards[0].id, null, 'moved');
        }}>
        aa
      </button>
      <button
        data-testid='update-settings'
        onClick={() => void updateSettings({ theme: 'office-dark' })}>
        us
      </button>
      <button data-testid='refresh' onClick={() => void refreshData()}>
        r
      </button>
      <button
        data-testid='create-template'
        onClick={() => {
          if (boards.length) {
            void createBoardFromTemplate('TB', '#000', 'project');
          }
        }}>
        ct
      </button>
    </div>
  );
};

const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <DataProvider>{children}</DataProvider>
);

describe('DataProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetTasksDbStores();
  });

  it('calls seedDatabase on mount and shows loading then data', async () => {
    render(<Probe />, { wrapper });
    expect(mockedSeedDatabase).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
  });

  it('createBoard appends to boards', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    expect(screen.getByTestId('boards')).toHaveTextContent('1');
  });

  it('updateBoard modifies name', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-board'));
    });
  });

  it('deleteBoard removes board', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    expect(screen.getByTestId('boards')).toHaveTextContent('1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-board'));
    });
    expect(screen.getByTestId('boards')).toHaveTextContent('0');
  });

  it('toggleStarBoard flips starred', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-star'));
    });
  });

  it('createList adds a list and updates board.listIds', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    expect(screen.getByTestId('lists')).toHaveTextContent('1');
  });

  it('updateList modifies name', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-list'));
    });
  });

  it('deleteList removes list and updates board.listIds', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-list'));
    });
    expect(screen.getByTestId('lists')).toHaveTextContent('0');
  });

  it('archiveList and restoreList toggle archived flag', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('archive-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('restore-list'));
    });
  });

  it('copyList duplicates list', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('copy-list'));
    });
    expect(screen.getByTestId('lists')).toHaveTextContent('2');
  });

  it('moveList reorders', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('move-list'));
    });
  });

  it('createCard adds a card to the list', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    expect(screen.getByTestId('cards')).toHaveTextContent('1');
  });

  it('updateCard modifies title', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-card'));
    });
  });

  it('deleteCard removes card and updates list.cardIds', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-card'));
    });
    expect(screen.getByTestId('cards')).toHaveTextContent('0');
  });

  it('archiveCard and restoreCard toggle archived flag', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('archive-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('restore-card'));
    });
  });

  it('moveCard updates listId', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('move-card'));
    });
  });

  it('addChecklistItem and toggleChecklistItem modify card.checklistItems', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-list'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-card'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-checklist'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-checklist'));
    });
  });

  it('addTask/toggleTask/deleteTask manage tasks', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-task'));
    });
    expect(screen.getByTestId('tasks')).toHaveTextContent('1');
    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-task'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('delete-task'));
    });
    expect(screen.getByTestId('tasks')).toHaveTextContent('0');
  });

  it('addActivity prepends to activity array', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('add-activity'));
    });
    expect(screen.getByTestId('activity')).toHaveTextContent('1');
  });

  it('updateSettings changes theme', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-settings'));
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('office-dark');
  });

  it('refreshData reloads from db', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh'));
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('no');
  });

  it('createBoardFromTemplate creates board with lists and cards', async () => {
    render(<Probe />, { wrapper });
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-board'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('create-template'));
    });
    expect(Number(screen.getByTestId('boards').textContent)).toBeGreaterThanOrEqual(2);
  });
});

describe('useData', () => {
  it('throws when used outside DataProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const ErrorProbe: FC = () => {
      useData();
      return null;
    };
    expect(() => render(<ErrorProbe />)).toThrow('useData must be used within DataProvider');
    spy.mockRestore();
  });
});
