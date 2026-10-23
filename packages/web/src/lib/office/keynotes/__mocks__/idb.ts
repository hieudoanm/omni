const mockIdbStores = new Map<string, Map<string, unknown>>();
const mockIdbCreated = new Set<string>();

export const __resetIdbMock = (): void => {
  mockIdbStores.clear();
  mockIdbCreated.clear();
};

export const openDB = jest.fn(
  async (_name: string, _version: number, opts?: { upgrade?: (db: unknown) => void }) => {
    const fakeDb = {
      objectStoreNames: { contains: (s: string) => mockIdbCreated.has(s) },
      createObjectStore: (s: string, _opts: { keyPath: string }) => {
        mockIdbCreated.add(s);
        mockIdbStores.set(s, new Map());
      },
    };
    if (opts?.upgrade) opts.upgrade(fakeDb);
    return {
      getAll: async (store: string) => [...(mockIdbStores.get(store)?.values() ?? [])],
      get: async (store: string, key: string) => mockIdbStores.get(store)?.get(key),
      put: async (store: string, value: { id: string }) => {
        mockIdbStores.get(store)?.set(value.id, value);
      },
      delete: async (store: string, key: string) => {
        mockIdbStores.get(store)?.delete(key);
      },
      transaction: (store: string, _mode: string) => ({
        store: {
          delete: async (key: string) => mockIdbStores.get(store)?.delete(key),
        },
        done: Promise.resolve(),
      }),
    };
  },
);
