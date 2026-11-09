import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import type { FieldDef } from '../../types';
import { EditorFields } from './EditorFields';

export const YamlEditor = forwardRef<
  { focus: () => void },
  {
    value: string;
    onChange?: (raw: string) => void;
    error?: string | null;
    fields?: FieldDef[];
    readOnly?: boolean;
  }
>(({ value, onChange, error, fields, readOnly = false }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        viewRef.current?.focus();
      },
    }),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      yamlLang(),
      oneDark,
      keymap.of([indentWithTab]),
      EditorView.lineWrapping,
    ];

    if (!readOnly) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString());
        }
      });
      extensions.push(updateListener);
    } else {
      extensions.push(EditorView.editable.of(false));
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: current.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className='w-full'>
      <div
        ref={containerRef}
        className={`overflow-hidden border text-sm leading-relaxed ${
          error ? 'border-error/50' : 'border-base-300'
        }`}
      />
      {error && <p className='text-error-content mt-2 text-xs'>{error}</p>}
      {fields && <EditorFields fields={fields} />}
    </div>
  );
});

YamlEditor.displayName = 'YamlEditor';
