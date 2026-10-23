import type { Board, Task } from '@/lib/office/tasks/types';

jest.mock('idb', () => {
  const stores = new Map<string, Map<string, unknown>>();
  const storeNames = new Set<string>([
    'boards',
    'lists',
    'cards',
    'labels',
    'members',
    'activity',
    'settings',
    'tasks',
    'session',
  ]);

  const db: {
    objectStoreNames: { contains: (name: string) => boolean };
    createObjectStore: (name: string) => void;
    getAll: (name: string) => Promise<unknown[]>;
    get: (name: string, key: string) => Promise<unknown>;
    put: (name: string, value: { id: string }) => Promise<void>;
    delete: (name: string, key: string) => Promise<void>;
  } = {
    objectStoreNames: {
      contains: (name: string) => storeNames.has(name),
    },
    createObjectStore: (name: string) => {
      if (!storeNames.has(name)) storeNames.add(name);
      if (!stores.has(name)) stores.set(name, new Map());
    },
    getAll: (name: string) => Promise.resolve(Array.from(stores.get(name)?.values() ?? [])),
    get: (name: string, key: string) => Promise.resolve(stores.get(name)?.get(key)),
    put: (name: string, value: { id: string }) => {
      if (!stores.has(name)) stores.set(name, new Map());
      stores.get(name)!.set(value.id, value);
      return Promise.resolve();
    },
    delete: (name: string, key: string) => {
      stores.get(name)?.delete(key);
      return Promise.resolve();
    },
  };

  return {
    openDB: jest.fn(
      (
        _name: string,
        _version: number,
        { upgrade }: { upgrade?: (store: unknown) => void } = {},
      ) => {
        upgrade?.(db);
        return Promise.resolve(db);
      },
    ),
  };
});

const loadDB = async () => {
  process.env.NEXT_PUBLIC_MOCK_DELAY = '0';
  jest.resetModules();
  return (await import('@/lib/office/tasks/db')).db;
};

describe('tasks db', () => {
  let db: Awaited<ReturnType<typeof loadDB>>;

  beforeEach(async () => {
    db = await loadDB();
  });

  it('writes and reads a board by id', async () => {
    const board: Board = {
      id: 'b1',
      name: 'Alpha',
      background: '#fff',
      starred: false,
      listIds: [],
      createdAt: 1,
      updatedAt: 2,
    };
    await db.boards.put(board);
    await expect(db.boards.get('b1')).resolves.toEqual(board);
    await expect(db.boards.getAll()).resolves.toEqual([board]);
  });

  it('deletes a board by id', async () => {
    const board: Board = {
      id: 'b2',
      name: 'Beta',
      background: '#000',
      starred: true,
      listIds: ['l1'],
      createdAt: 1,
      updatedAt: 2,
    };
    await db.boards.put(board);
    await db.boards.delete('b2');
    await expect(db.boards.get('b2')).resolves.toBeUndefined();
  });

  it('round-trips lists, cards, labels, members and activity', async () => {
    const list = {
      id: 'l1',
      boardId: 'b1',
      name: 'To Do',
      cardIds: ['c1'],
      collapsed: false,
      archived: false,
      createdAt: 1,
      updatedAt: 2,
    };
    const card = {
      id: 'c1',
      listId: 'l1',
      title: 'Task',
      description: '',
      labels: [] as string[],
      dueDate: null as number | null,
      priority: 'medium' as const,
      memberIds: [] as string[],
      checklistItems: [] as { id: string; text: string; checked: boolean }[],
      comments: [] as {
        id: string;
        text: string;
        author: string;
        createdAt: number;
      }[],
      attachments: [] as { id: string; name: string; size: number }[],
      coverColor: null as string | null,
      coverImage: null as string | null,
      archived: false,
      createdAt: 1,
      updatedAt: 2,
    };
    const label = { id: 'lb1', name: 'Bug', color: '#f00' };
    const member = {
      id: 'm1',
      name: 'Alice',
      email: 'alice@x.io',
      avatar: 'AL',
    };
    const activity = {
      id: 'a1',
      boardId: 'b1',
      cardId: 'c1',
      message: 'moved',
      userId: 'm1',
      timestamp: 3,
    };

    await db.lists.put(list);
    await db.cards.put(card);
    await db.labels.put(label);
    await db.members.put(member);
    await db.activity.put(activity);

    await expect(db.lists.getAll()).resolves.toEqual([list]);
    await expect(db.cards.get('c1')).resolves.toEqual(card);
    await expect(db.labels.getAll()).resolves.toEqual([label]);
    await expect(db.members.getAll()).resolves.toEqual([member]);
    await expect(db.activity.getAll()).resolves.toEqual([activity]);
  });

  it('returns default settings when none are stored', async () => {
    await expect(db.settings.get()).resolves.toEqual({
      theme: 'office-light',
      defaultView: 'kanban',
      notifications: true,
      notificationsReadAt: 0,
    });
  });

  it('persists and reads settings under a fixed id', async () => {
    await db.settings.put({
      theme: 'office-dark',
      defaultView: 'list',
      notifications: true,
      notificationsReadAt: 0,
    });
    await expect(db.settings.get()).resolves.toMatchObject({
      theme: 'office-dark',
      defaultView: 'list',
    });
  });

  it('returns an empty session when none exists', async () => {
    await expect(db.session.get()).resolves.toEqual({
      id: 'session',
      userId: null,
    });
  });

  it('persists a session userId', async () => {
    await db.session.put({ id: 'session', userId: 'm1' });
    await expect(db.session.get()).resolves.toEqual({
      id: 'session',
      userId: 'm1',
    });
  });

  it('manages tasks with getAll, put and delete', async () => {
    const task: Task = {
      id: 't1',
      userId: 'm1',
      text: 'Write tests',
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    };
    await db.tasks.put(task);
    await expect(db.tasks.getAll()).resolves.toEqual([task]);
    await db.tasks.delete('t1');
    await expect(db.tasks.getAll()).resolves.toEqual([]);
  });
});
