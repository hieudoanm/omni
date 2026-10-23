import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, type RefObject } from 'react';
import { DataProvider } from '@/lib/office/tasks/data-provider';
import { ToastProvider } from '@/lib/office/tasks/toast';
import { KanbanBoard } from '@/components/office/tasks/organisms/KanbanBoard';

jest.mock('@/lib/office/tasks/db', () => {
  const storeMaps: Record<string, Map<string, unknown>> = {};

  const reset = () => {
    for (const key of Object.keys(storeMaps)) delete storeMaps[key];
  };

  const handler: ProxyHandler<Record<string, unknown>> = {
    get(_target, store: string) {
      if (typeof store !== 'string') return undefined;
      if (!storeMaps[store]) storeMaps[store] = new Map();
      const map = storeMaps[store];
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

const resetTasksDbStores = jest.requireMock('@/lib/office/tasks/db')
  .resetTasksDbStores as () => void;
const { db } = jest.requireMock('@/lib/office/tasks/db') as {
  db: Record<string, any>;
};

const seedBoard = () => {
  const now = Date.now();
  const fixture = {
    boards: [
      {
        id: 'b1',
        name: 'Roadmap',
        background: '#fff',
        starred: false,
        listIds: ['l1', 'l2'],
        roles: { 'mem-1': 'admin' },
        shareEnabled: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    lists: [
      {
        id: 'l1',
        boardId: 'b1',
        name: 'To Do',
        cardIds: ['c1', 'c2'],
        collapsed: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'l2',
        boardId: 'b1',
        name: 'Done',
        cardIds: [],
        collapsed: false,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    cards: [
      {
        id: 'c1',
        listId: 'l1',
        title: 'Fix bug',
        description: 'Investigate crash',
        labels: ['lb1'],
        dueDate: now + 86400000,
        priority: 'high',
        memberIds: ['mem-1'],
        checklistItems: [{ id: 'i1', text: 'Reproduce', checked: false }],
        comments: [
          {
            id: 'cm1',
            text: 'WIP @Alice',
            author: 'Alice Chen',
            createdAt: now,
          },
        ],
        attachments: [],
        coverColor: null,
        coverImage: null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'c2',
        listId: 'l1',
        title: 'Ship v2',
        description: '',
        labels: [],
        dueDate: null,
        priority: 'medium',
        memberIds: [],
        checklistItems: [],
        comments: [],
        attachments: [],
        coverColor: null,
        coverImage: null,
        archived: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    labels: [{ id: 'lb1', name: 'Bug', color: '#ff0000' }],
    members: [{ id: 'mem-1', name: 'Alice Chen', email: 'alice@x.io', avatar: 'AL' }],
    activity: [],
    tasks: [],
    settings: {
      id: 'settings',
      theme: 'office-light',
      defaultView: 'kanban',
      notifications: true,
      notificationsReadAt: 0,
    },
    session: [{ id: 'session', userId: 'mem-1' }],
  };

  for (const store of Object.keys(fixture) as (keyof typeof fixture)[]) {
    const items = fixture[store] as Array<{ id: string }> | { id: string } | undefined;
    if (Array.isArray(items)) {
      for (const item of items) {
        void db[store].put(item);
      }
    } else if (items) {
      void db[store].put(items);
    }
  }
};

const renderBoard = (
  props: {
    search?: string;
    showArchive?: boolean;
    setShowArchive?: (v: boolean) => void;
  } = {},
) => {
  const searchRef: RefObject<HTMLInputElement | null> = createRef();
  return render(
    <DataProvider>
      <ToastProvider>
        <KanbanBoard
          boardId='b1'
          search={props.search ?? ''}
          searchRef={searchRef}
          showArchive={props.showArchive ?? false}
          setShowArchive={props.setShowArchive ?? jest.fn()}
        />
      </ToastProvider>
    </DataProvider>,
  );
};

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetTasksDbStores();
    seedBoard();
  });

  it('renders lists and cards after data loads', async () => {
    renderBoard();
    expect(await screen.findByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('Ship v2')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows a loading message until the board is available', async () => {
    resetTasksDbStores();
    renderBoard();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('adds a new card to a list', async () => {
    renderBoard();
    await screen.findByText('To Do');
    fireEvent.click(screen.getAllByText('Add card')[0]);
    const input = screen.getByPlaceholderText('Card title');
    fireEvent.change(input, { target: { value: 'New card' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('New card')).toBeInTheDocument();
  });

  it('cancels card creation with Escape', async () => {
    renderBoard();
    await screen.findByText('To Do');
    fireEvent.click(screen.getAllByText('Add card')[0]);
    const input = screen.getByPlaceholderText('Card title');
    fireEvent.change(input, { target: { value: 'Draft' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Card title')).not.toBeInTheDocument();
  });

  it('adds a new list', async () => {
    renderBoard();
    await screen.findByText('To Do');
    fireEvent.click(screen.getByText('Add list'));
    const input = screen.getByPlaceholderText('List name');
    fireEvent.change(input, { target: { value: 'Blocked' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText('Blocked')).toBeInTheDocument();
  });

  it('observe sorting menu and copy/archive actions', async () => {
    renderBoard();
    await screen.findByText('To Do');
    fireEvent.click(screen.getByLabelText('Menu for To Do'));
    expect(screen.getByText('Copy list')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Copy list'));
    await screen.findByText('To Do (copy)');
  });

  it('archives a list via the menu', async () => {
    const setShowArchive = jest.fn();
    renderBoard({ setShowArchive });
    await screen.findByText('To Do');
    fireEvent.click(screen.getByLabelText('Menu for To Do'));
    fireEvent.click(screen.getByText('Archive list'));
    await waitFor(() => expect(screen.queryByText('To Do')).not.toBeInTheDocument());
  });

  it('opens a card and edits it', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByText('Fix bug'));
    await screen.findByDisplayValue('Fix bug');
    fireEvent.change(screen.getByDisplayValue('Fix bug'), {
      target: { value: 'Fix bug now' },
    });
    await waitFor(async () => {
      const card = await db.cards.get('c1');
      expect(card.title).toBe('Fix bug now');
    });
    fireEvent.change(screen.getByLabelText('Card priority'), {
      target: { value: 'urgent' },
    });
    await waitFor(async () => {
      const card = await db.cards.get('c1');
      expect(card.priority).toBe('urgent');
    });
  });

  it('toggles a checklist item in the card detail', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByText('Fix bug'));
    await screen.findByText('Reproduce');
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    await waitFor(async () => {
      const card = await db.cards.get('c1');
      expect(card.checklistItems[0].checked).toBe(true);
    });
  });

  it('adds a comment to the selected card', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByText('Fix bug'));
    await screen.findByText('WIP', { exact: false });
    const input = screen.getByLabelText('Add comment');
    fireEvent.change(input, { target: { value: 'On it' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(async () => {
      const card = await db.cards.get('c1');
      const added = card.comments.find((c: { text: string }) => c.text === 'On it');
      expect(added).toBeTruthy();
      expect(added.author).toBe('Alice Chen');
    });
  });

  it('archives the selected card', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByText('Fix bug'));
    await screen.findByDisplayValue('Fix bug');
    fireEvent.click(screen.getByText('Archive'));
    await waitFor(() => expect(screen.queryByDisplayValue('Fix bug')).not.toBeInTheDocument());
  });

  it('deletes the selected card', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByText('Fix bug'));
    await screen.findByDisplayValue('Fix bug');
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => expect(screen.queryByDisplayValue('Fix bug')).not.toBeInTheDocument());
  });

  it('shows archives when showArchive is enabled', async () => {
    const fixture = {
      id: 'cb1',
      listId: 'l1',
      title: 'Closed task',
      description: '',
      labels: [] as string[],
      dueDate: null as number | null,
      priority: 'medium' as const,
      memberIds: [] as string[],
      checklistItems: [] as { id: string; text: string; checked: boolean }[],
      comments: [] as unknown[],
      attachments: [] as unknown[],
      coverColor: null as string | null,
      coverImage: null as string | null,
      archived: true,
      createdAt: 1,
      updatedAt: 1,
    };
    await act(async () => {
      await db.cards.put(fixture);
      const l1 = await db.lists.get('l1');
      await db.lists.put({ ...l1, cardIds: [...l1.cardIds, 'cb1'] });
    });
    renderBoard({ showArchive: true });
    await screen.findByText('Closed task');
    expect(screen.getByText('Cards')).toBeInTheDocument();
  });

  it('filters cards by search query', async () => {
    renderBoard({ search: 'bug' });
    const cardTitle = await screen.findByText(
      (_: string | (() => string), el: Element | null) => el?.textContent === 'Fix bug',
    );
    expect(cardTitle.querySelector('mark')).toHaveTextContent('bug');
    expect(
      screen.queryByText((_: string, el: Element | null) =>
        el?.textContent === 'Ship v2' ? true : false,
      ),
    ).not.toBeInTheDocument();
  });

  it('shows the empty archive modal', async () => {
    renderBoard({ showArchive: true });
    expect(await screen.findByText('Nothing archived.')).toBeInTheDocument();
  });

  it('sorts a list by each available mode', async () => {
    renderBoard();
    await screen.findByText('To Do');
    for (const mode of ['due', 'priority', 'name', 'created']) {
      fireEvent.click(screen.getByLabelText('Menu for To Do'));
      fireEvent.click(screen.getByText(mode));
      if (mode !== 'created') {
        expect(screen.getByText(`by ${mode}`)).toBeInTheDocument();
      }
    }
  });

  it('renders due and priority filter selects', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });

  it('filters by No due date', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'none' } });
    expect(screen.getByText('Ship v2')).toBeInTheDocument();
    expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
  });

  it('filters by priority', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'high' } });
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.queryByText('Ship v2')).not.toBeInTheDocument();
  });

  it('filters by label toggle', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    fireEvent.click(screen.getByRole('button', { name: 'Bug' }));
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.queryByText('Ship v2')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bug' }));
    expect(screen.getByText('Ship v2')).toBeInTheDocument();
  });

  it('filters by member toggle', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    const memberBtns = screen.getAllByTitle('Alice Chen');
    fireEvent.click(memberBtns[0]);
    expect(screen.queryByText('Ship v2')).not.toBeInTheDocument();
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
  });

  it('clears all active filters', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'urgent' } });
    expect(screen.queryByText('Fix bug')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Clear filters'));
    expect(screen.getByText('Fix bug')).toBeInTheDocument();
    expect(screen.getByText('Ship v2')).toBeInTheDocument();
  });

  it('collapses and expands a list', async () => {
    renderBoard();
    await screen.findByText('Fix bug');
    const menuBtn = screen.getByLabelText('Menu for To Do');
    const collapseBtn = menuBtn.parentElement!.querySelectorAll('button')[1];
    fireEvent.click(collapseBtn);
    await waitFor(() => expect(screen.queryByText('Fix bug')).not.toBeInTheDocument());
    const menuBtn2 = screen.getByLabelText('Menu for To Do');
    fireEvent.click(menuBtn2.parentElement!.querySelectorAll('button')[1]);
    expect(await screen.findByText('Fix bug')).toBeInTheDocument();
  });

  it('hides add controls for viewer role', async () => {
    const now = Date.now();
    const viewerBoard = {
      id: 'b1',
      name: 'Roadmap',
      background: '#fff',
      starred: false,
      listIds: ['l1'],
      roles: { 'mem-1': 'viewer' },
      shareEnabled: false,
      createdAt: now,
      updatedAt: now,
    };
    await act(async () => {
      await db.boards.put(viewerBoard);
    });
    renderBoard();
    await screen.findByText('Fix bug');
    expect(screen.queryByText('Add card')).not.toBeInTheDocument();
    expect(screen.queryByText('Add list')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Menu for To Do'));
    expect(screen.queryByText('Copy list')).not.toBeInTheDocument();
    expect(screen.queryByText('Archive list')).not.toBeInTheDocument();
  });

  it('opens the quick-add input via the N shortcut', async () => {
    renderBoard();
    await screen.findByText('To Do');
    fireEvent.keyDown(window, { key: 'n' });
    expect(await screen.findByPlaceholderText('Card title')).toBeInTheDocument();
  });
});
