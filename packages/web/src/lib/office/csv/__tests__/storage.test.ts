import { loadWorkbook, saveWorkbook } from '@/lib/office/csv/storage';
import { createWorkbook, setActiveCell } from '@/lib/office/csv/workbook';

const WORKBOOK_KEY = 'csv-editor:workbook';
const LEGACY_GRID_KEY = 'csv-editor:grid';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips a workbook through localStorage', () => {
    const workbook = setActiveCell(createWorkbook(), 1, 1, 'x');
    saveWorkbook(workbook);
    const loaded = loadWorkbook();
    expect(loaded).not.toBeNull();
    expect(loaded?.sheets[0].grid[1][1]).toBe('x');
  });

  it('returns null when nothing is stored', () => {
    expect(loadWorkbook()).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    window.localStorage.setItem(WORKBOOK_KEY, 'not-json');
    expect(loadWorkbook()).toBeNull();
  });

  it('returns null when the stored value is not a workbook', () => {
    window.localStorage.setItem(WORKBOOK_KEY, JSON.stringify({ not: 'a workbook' }));
    expect(loadWorkbook()).toBeNull();
  });

  it('migrates a legacy grid into a workbook', () => {
    window.localStorage.setItem(
      LEGACY_GRID_KEY,
      JSON.stringify([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    );
    const loaded = loadWorkbook();
    expect(loaded?.sheets).toHaveLength(1);
    expect(loaded?.sheets[0].grid).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
    expect(loaded?.sheets[0].name).toBe('Sheet 1');
  });

  it('ignores a corrupt legacy grid', () => {
    window.localStorage.setItem(LEGACY_GRID_KEY, 'not-json');
    expect(loadWorkbook()).toBeNull();
  });

  it('prefers a valid workbook over a legacy grid', () => {
    saveWorkbook(setActiveCell(createWorkbook(), 0, 0, 'new'));
    window.localStorage.setItem(LEGACY_GRID_KEY, JSON.stringify([['old']]));
    expect(loadWorkbook()?.sheets[0].grid[0][0]).toBe('new');
  });
});
