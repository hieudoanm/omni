'use client';

import { useEffect, useMemo, useReducer } from 'react';
import { createSheet, createWorkbook } from '@/lib/office/csv/workbook';
import { loadWorkbook, saveWorkbook } from '@/lib/office/csv/storage';
import type { Workbook } from '@/lib/office/csv/types';

const MAX_HISTORY = 100;

interface State {
  workbook: Workbook;
  undoStack: Workbook[];
  redoStack: Workbook[];
}

type Action =
  | { type: 'set'; updater: Workbook | ((prev: Workbook) => Workbook) }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset'; workbook: Workbook };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'set': {
      const next =
        typeof action.updater === 'function' ? action.updater(state.workbook) : action.updater;
      if (next === state.workbook) return state;
      return {
        workbook: next,
        undoStack: [...state.undoStack.slice(-(MAX_HISTORY - 1)), state.workbook],
        redoStack: [],
      };
    }
    case 'undo': {
      const previous = state.undoStack[state.undoStack.length - 1];
      if (!previous) return state;
      return {
        workbook: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.workbook],
      };
    }
    case 'redo': {
      const next = state.redoStack[state.redoStack.length - 1];
      if (!next) return state;
      return {
        workbook: next,
        undoStack: [...state.undoStack, state.workbook],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'reset':
      return { workbook: action.workbook, undoStack: [], redoStack: [] };
  }
};

const initialState = (): State => ({
  workbook: loadWorkbook() ?? createWorkbook(),
  undoStack: [],
  redoStack: [],
});

export const useCsvState = (): {
  workbook: Workbook;
  setWorkbook: (updater: Workbook | ((prev: Workbook) => Workbook)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (workbook: Workbook) => void;
} => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    saveWorkbook(state.workbook);
  }, [state.workbook]);

  return useMemo(
    () => ({
      workbook: state.workbook,
      setWorkbook: (updater) => dispatch({ type: 'set', updater }),
      undo: () => dispatch({ type: 'undo' }),
      redo: () => dispatch({ type: 'redo' }),
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
      reset: (workbook) => dispatch({ type: 'reset', workbook }),
    }),
    [state],
  );
};
