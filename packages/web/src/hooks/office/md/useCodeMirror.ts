'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { EditorState } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { oneDark } from '@codemirror/theme-one-dark';

export interface UseCodeMirrorOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  initialDoc?: string;
  onChange?: (content: string) => void;
  onSelectionChange?: (from: number, to: number) => void;
}

export interface UseCodeMirrorReturn {
  view: EditorView | null;
  setDoc: (content: string) => void;
  getDoc: () => string;
  focus: () => void;
}

export const useCodeMirror = (options: UseCodeMirrorOptions): UseCodeMirrorReturn => {
  const { containerRef, initialDoc, onChange, onSelectionChange } = options;
  const viewRef = useRef<EditorView | null>(null);
  const initialDocRef = useRef(initialDoc);
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const [view, setView] = useState<EditorView | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
  }, [onChange, onSelectionChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: initialDocRef.current ?? '',
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          foldGutter(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          markdown(),
          bracketMatching(),
          rectangularSelection(),
          crosshairCursor(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([...searchKeymap, ...foldKeymap, ...historyKeymap, ...defaultKeymap]),
          oneDark,
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current?.(update.state.doc.toString());
            }
            const sel = update.state.selection.main;
            onSelectionChangeRef.current?.(sel.from, sel.to);
          }),
        ],
      }),
      parent: container,
    });

    viewRef.current = view;
    setView(view);
    return () => {
      view.destroy();
      viewRef.current = null;
      setView(null);
    };
  }, [containerRef]);

  const setDoc = useCallback((content: string): void => {
    const view = viewRef.current;
    if (!view) return;
    if (view.state.doc.toString() === content) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
    view.focus();
  }, []);

  const getDoc = useCallback((): string => {
    const view = viewRef.current;
    return view ? view.state.doc.toString() : '';
  }, []);

  const focus = useCallback((): void => {
    viewRef.current?.focus();
  }, []);

  return { view, setDoc, getDoc, focus };
};
