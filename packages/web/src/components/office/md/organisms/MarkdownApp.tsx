'use client';

import type { ConvertKind } from '@/components/office/md/molecules/ConvertToolbar';
import { ConvertToolbar } from '@/components/office/md/molecules/ConvertToolbar';
import { FileToolbar } from '@/components/office/md/molecules/FileToolbar';
import { FormatToolbar } from '@/components/office/md/molecules/FormatToolbar';
import { StatsBar } from '@/components/office/md/molecules/StatsBar';
import { TocSidebar } from '@/components/office/md/molecules/TocSidebar';
import { ViewControls } from '@/components/office/md/molecules/ViewControls';
import { WordCounterDialog } from '@/components/office/md/molecules/WordCounterDialog';
import { GraphView } from '@/components/office/md/organisms/GraphView';
import { MarkdownPreviewer } from '@/components/office/md/organisms/MarkdownPreviewer';
import { MarkdownSidebar } from '@/components/office/md/organisms/MarkdownSidebar';
import { seedNotes } from '@/data/office/md/seed';
import { useCodeMirror } from '@/hooks/office/md/useCodeMirror';
import { useMarkdownRender } from '@/hooks/office/md/useMarkdownRender';
import { useScrollSync } from '@/hooks/office/md/useScrollSync';
import { formatRelativeTime } from '@/lib/office/md/date';
import { exportHtmlFile, exportMarkdownFile, exportPdf } from '@/lib/office/md/export';
import { extractToc, renderMarkdown } from '@/lib/office/md/markdown';
import { loadNotes, loadUiPreference, saveNotes, saveUiPreference } from '@/lib/office/md/storage';
import type { Note, ViewMode } from '@/lib/office/md/types';
import { buildGraph, resolveNoteTitle } from '@/lib/office/md/wikilinks';
import Link from 'next/link';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  TbDownload,
  TbHierarchy2,
  TbLayoutSidebar,
  TbLayoutSidebarFilled,
  TbListNumbers,
  TbListTree,
  TbMenu2,
  TbPlus,
} from 'react-icons/tb';

const SAVE_DELAY = 400;
const FILES_PREF_KEY = 'markdown.ui.files-sidebar';
const OUTLINE_PREF_KEY = 'markdown.ui.outline';

export const MarkdownApp: FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [activeId, setActiveId] = useState<string | null>(() => notes[0]?.id ?? null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showWordCounter, setShowWordCounter] = useState(false);
  const [showFiles, setShowFiles] = useState(() => loadUiPreference(FILES_PREF_KEY, true));
  const [showOutline, setShowOutline] = useState(() => loadUiPreference(OUTLINE_PREF_KEY, true));
  const [scramble, setScramble] = useState(false);
  const [convertKind, setConvertKind] = useState<ConvertKind>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const activeIdRef = useRef(activeId);
  const lastSyncedIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<number | undefined>(undefined);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeId) ?? null,
    [notes, activeId],
  );
  const graph = useMemo(() => buildGraph(notes), [notes]);

  const handleDocChange = useCallback((content: string): void => {
    const id = activeIdRef.current;
    if (!id) return;
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, content, updatedAt: Date.now() } : note)),
    );
  }, []);

  const { view, setDoc } = useCodeMirror({
    containerRef: editorRef,
    initialDoc: notes[0]?.content ?? '',
    onChange: handleDocChange,
  });

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    document.title = activeNote ? `${activeNote.title} - Markdown` : 'Markdown - Minimal Obsidian';
  }, [activeNote]);

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => saveNotes(notes), SAVE_DELAY);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [notes]);

  useEffect(() => {
    if (!activeNote) return;
    if (lastSyncedIdRef.current === activeNote.id) return;
    lastSyncedIdRef.current = activeNote.id;
    setDoc(activeNote.content);
  }, [activeNote, setDoc]);

  const [editorScrollEl, setEditorScrollEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEditorScrollEl(view ? view.scrollDOM : null);
  }, [view]);

  useScrollSync(editorScrollEl, previewRef, viewMode === 'split');

  const selectNote = useCallback((id: string): void => {
    setActiveId(id);
    setShowSidebar(false);
    setShowGraph(false);
  }, []);

  const createNote = useCallback((): void => {
    const now = Date.now();
    const note: Note = {
      id: `note-${now}`,
      title: 'Untitled',
      content: '',
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setShowSidebar(false);
  }, []);

  const importContent = useCallback((content: string): void => {
    const now = Date.now();
    const note: Note = {
      id: `note-${now}`,
      title: resolveNoteTitle(content),
      content,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
    setShowSidebar(false);
  }, []);

  const deleteNote = useCallback((): void => {
    if (!activeNote) return;
    if (!window.confirm(`Delete "${activeNote.title}"?`)) return;
    const remaining = notes.filter((note) => note.id !== activeNote.id);
    const next = remaining.length > 0 ? remaining : seedNotes();
    setNotes(next);
    setActiveId(next[0]?.id ?? null);
  }, [activeNote, notes]);

  const handleExportMarkdown = useCallback((): void => {
    if (activeNote) exportMarkdownFile(activeNote.content, activeNote.title);
  }, [activeNote]);

  const handleExportHtml = useCallback(async (): Promise<void> => {
    if (!activeNote) return;
    const html = await renderMarkdown(activeNote.content);
    exportHtmlFile(activeNote.title, html);
  }, [activeNote]);

  const handleExportPdf = useCallback(async (): Promise<void> => {
    if (!activeNote) return;
    const html = await renderMarkdown(activeNote.content);
    exportPdf(activeNote.title, html);
  }, [activeNote]);

  const toggleFiles = useCallback((): void => {
    setShowFiles((prev) => {
      saveUiPreference(FILES_PREF_KEY, !prev);
      return !prev;
    });
  }, []);

  const toggleOutline = useCallback((): void => {
    setShowOutline((prev) => {
      saveUiPreference(OUTLINE_PREF_KEY, !prev);
      return !prev;
    });
  }, []);

  const toggleScramble = useCallback((): void => {
    setScramble((prev) => !prev);
  }, []);

  const { html, isRendering } = useMarkdownRender(activeNote?.content ?? '');
  const toc = useMemo(() => (activeNote ? extractToc(activeNote.content) : []), [activeNote]);

  const editorVisible = viewMode !== 'preview';
  const previewVisible = viewMode !== 'editor';

  return (
    <div className='relative flex h-dvh min-h-0 overflow-hidden'>
      {showFiles && (
        <div className='hidden h-full min-h-0 lg:block'>
          <MarkdownSidebar
            notes={notes}
            activeId={activeId}
            search={search}
            onSearchChange={setSearch}
            onSelect={selectNote}
            onNew={createNote}
            mobile={false}
          />
        </div>
      )}

      {showSidebar && (
        <>
          <div
            className='absolute inset-0 z-10 bg-black/50 lg:hidden'
            onClick={() => setShowSidebar(false)}
          />
          <div className='absolute inset-y-0 left-0 z-20 lg:hidden'>
            <MarkdownSidebar
              notes={notes}
              activeId={activeId}
              search={search}
              onSearchChange={setSearch}
              onSelect={selectNote}
              onNew={createNote}
              onClose={() => setShowSidebar(false)}
              mobile
            />
          </div>
        </>
      )}

      <main className='flex min-w-0 flex-1 flex-col'>
        <header className='border-base-content/10 flex items-center gap-2 border-b px-3 py-2'>
          <button
            className='btn btn-ghost btn-sm lg:hidden'
            onClick={() => setShowSidebar(true)}
            aria-label='Open sidebar'>
            <TbMenu2 size={18} />
          </button>

          <div className='min-w-0 flex-1'>
            <h1 className='truncate text-lg'>{activeNote?.title ?? 'Vault'}</h1>
            {activeNote && (
              <p className='text-base-content/40 text-xs'>
                Last edited {formatRelativeTime(activeNote.updatedAt)}
              </p>
            )}
          </div>

          <ViewControls value={viewMode} onChange={setViewMode} />

          <button
            className='btn btn-ghost btn-sm tooltip tooltip-bottom'
            data-tip='Toggle file list'
            onClick={toggleFiles}
            aria-label={showFiles ? 'Hide file list' : 'Show file list'}>
            {showFiles ? <TbLayoutSidebarFilled size={18} /> : <TbLayoutSidebar size={18} />}
          </button>

          <button
            className='btn btn-ghost btn-sm tooltip tooltip-bottom'
            data-tip='Toggle outline'
            onClick={toggleOutline}
            disabled={!activeNote}
            aria-label={showOutline ? 'Hide outline' : 'Show outline'}>
            <TbListTree size={18} />
          </button>

          <button
            className='btn btn-ghost btn-sm tooltip tooltip-bottom'
            data-tip='Word counter'
            onClick={() => setShowWordCounter(true)}
            disabled={!activeNote}
            aria-label='Word counter'>
            <TbListNumbers size={18} />
          </button>

          <button
            className='btn btn-ghost btn-sm tooltip tooltip-bottom'
            data-tip='Notes graph'
            onClick={() => setShowGraph(true)}
            aria-label='Notes graph'>
            <TbHierarchy2 size={18} />
          </button>

          <Link
            href='/apps/office/downloads'
            className='btn btn-ghost btn-sm gap-1.5'
            aria-label='Downloads'>
            <TbDownload size={18} />
            Downloads
          </Link>
        </header>

        <div className='flex min-h-0 flex-1'>
          <section className='flex min-w-0 flex-1 flex-col'>
            {activeNote ? (
              <>
                <FileToolbar
                  canExport
                  onNew={createNote}
                  onImport={importContent}
                  onExportMarkdown={handleExportMarkdown}
                  onExportHtml={handleExportHtml}
                  onExportPdf={handleExportPdf}
                  onDelete={deleteNote}
                />
                <FormatToolbar view={view} />
                <ConvertToolbar convertKind={convertKind} onConvertChange={setConvertKind} />

                <div className='flex min-h-0 flex-1'>
                  <div className={`min-w-0 flex-1 ${editorVisible ? '' : 'hidden'}`}>
                    <div ref={editorRef} className='h-full overflow-hidden' data-testid='editor' />
                  </div>

                  <div className={`min-w-0 flex-1 ${previewVisible ? '' : 'hidden'}`}>
                    <MarkdownPreviewer
                      html={html}
                      isRendering={isRendering}
                      previewRef={previewRef}
                      visible
                      scramble={scramble}
                      onToggleScramble={toggleScramble}
                      convertKind={convertKind}
                    />
                  </div>
                </div>

                <StatsBar
                  content={activeNote.content}
                  noteCount={notes.length}
                  linkCount={graph.links.length}
                  danglingCount={graph.dangling}
                />
              </>
            ) : (
              <div className='flex flex-1 flex-col items-center justify-center gap-4'>
                <h2 className='text-xl'>Empty vault</h2>
                <p className='text-base-content/60 max-w-sm text-center text-sm'>
                  Create your first note to start building a connected knowledge base.
                </p>
                <button className='btn btn-primary btn-sm' onClick={createNote}>
                  <TbPlus size={16} />
                  New note
                </button>
              </div>
            )}
          </section>

          {activeNote && showOutline && <TocSidebar items={toc} />}
        </div>
      </main>

      {showGraph && (
        <GraphView notes={notes} onSelectNote={selectNote} onClose={() => setShowGraph(false)} />
      )}

      {showWordCounter && activeNote && (
        <WordCounterDialog text={activeNote.content} onClose={() => setShowWordCounter(false)} />
      )}
    </div>
  );
};
