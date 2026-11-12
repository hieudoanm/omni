import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useEffect, useRef } from 'react';

export const useCodeMirror = ({
  value,
  onChange,
  editable = true,
  extensions = [],
}: {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  extensions?: Extension[];
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    viewRef.current?.destroy();
    const state = EditorState.create({
      doc: value,
      extensions: [
        oneDark,
        EditorView.lineWrapping,
        EditorView.editable.of(editable),
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-editor': { height: '100%' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'monospace' },
        }),
        ...extensions,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChange) onChange(update.state.doc.toString());
        }),
      ],
    });
    viewRef.current = new EditorView({ state, parent: ref.current });
    return () => viewRef.current?.destroy();
  }, [extensions]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value)
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
  }, [value]);

  return { ref, viewRef };
};
