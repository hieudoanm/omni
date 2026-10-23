import { act, renderHook } from '@testing-library/react';
import { useCsvState } from '@/hooks/office/csv/useCsvState';
import { getActiveSheet, setActiveCell } from '@/lib/office/csv/workbook';

describe('useCsvState', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts with a default workbook', () => {
    const { result } = renderHook(() => useCsvState());
    expect(result.current.workbook.sheets).toHaveLength(1);
    expect(getActiveSheet(result.current.workbook).grid).toHaveLength(10);
    expect(getActiveSheet(result.current.workbook).grid[0]).toHaveLength(5);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('updates the workbook and enables undo', () => {
    const { result } = renderHook(() => useCsvState());
    act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 0, 0, 'x')));
    expect(getActiveSheet(result.current.workbook).grid[0][0]).toBe('x');
    expect(result.current.canUndo).toBe(true);
  });

  it('undoes and redoes changes', () => {
    const { result } = renderHook(() => useCsvState());
    act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 0, 0, 'x')));
    act(() => result.current.undo());
    expect(getActiveSheet(result.current.workbook).grid[0][0]).toBe('');
    expect(result.current.canRedo).toBe(true);
    act(() => result.current.redo());
    expect(getActiveSheet(result.current.workbook).grid[0][0]).toBe('x');
  });

  it('does nothing when there is nothing to undo or redo', () => {
    const { result } = renderHook(() => useCsvState());
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('ignores a set with the same workbook reference', () => {
    const { result } = renderHook(() => useCsvState());
    const workbook = result.current.workbook;
    act(() => result.current.setWorkbook(workbook));
    expect(result.current.workbook).toBe(workbook);
    expect(result.current.canUndo).toBe(false);
  });

  it('persists the workbook to localStorage', () => {
    const { result } = renderHook(() => useCsvState());
    act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 0, 0, 'x')));
    const stored = JSON.parse(window.localStorage.getItem('csv-editor:workbook') ?? '');
    expect(stored.sheets[0].grid[0][0]).toBe('x');
  });

  it('resets the workbook and clears history', () => {
    const { result } = renderHook(() => useCsvState());
    act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 0, 0, 'x')));
    const fresh = result.current.workbook;
    act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 1, 1, 'y')));
    act(() => result.current.reset(fresh));
    expect(getActiveSheet(result.current.workbook).grid[0][0]).toBe('x');
    expect(result.current.canUndo).toBe(false);
  });

  it('caps the undo history', () => {
    const { result } = renderHook(() => useCsvState());
    for (let i = 0; i < 110; i += 1) {
      act(() => result.current.setWorkbook((prev) => setActiveCell(prev, 0, 0, String(i))));
    }
    expect(result.current.canUndo).toBe(true);
  });
});
