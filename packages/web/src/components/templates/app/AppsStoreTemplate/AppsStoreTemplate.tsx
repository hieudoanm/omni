'use client';

import { Tool, ToolCard } from '@/components/atoms';
import { SearchBar, Section } from '@/components/molecules';
import { FC, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';

const matchesQuery = (tool: Tool, q: string): boolean => {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = `${tool.label} ${tool.description}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
};

export interface StoreSection {
  id?: string;
  label: string;
  items: Tool[];
}

export interface AppsStoreTemplateProps {
  title: string;
  sections: StoreSection[];
  section?: string;
}

interface TypeOption {
  id: string;
  label: string;
  count: number;
}

const collectTypeOptions = (sections: StoreSection[]): TypeOption[] => {
  const byId = new Map<string, TypeOption>();
  for (const section of sections) {
    for (const tool of section.items) {
      if (!tool.typeId) continue;
      const existing = byId.get(tool.typeId);
      if (existing) {
        existing.count += 1;
      } else {
        byId.set(tool.typeId, {
          id: tool.typeId,
          label: tool.type ?? tool.typeId,
          count: 1,
        });
      }
    }
  }
  return [...byId.values()];
};

const formatToday = (): string =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export const AppsStoreTemplate: FC<AppsStoreTemplateProps> = ({ title, sections, section }) => {
  const [today, setToday] = useState('');
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const deferredQuery = useDeferredValue(query);
  const querying = deferredQuery.trim().length > 0;
  const typeFiltering = selectedTypes.length > 0;
  const filtering = querying || typeFiltering;

  const typeOptions = useMemo(() => collectTypeOptions(sections), [sections]);

  useEffect(() => {
    setToday(formatToday());
  }, []);

  const toggleSection = useCallback((label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !(prev[label] ?? true) }));
  }, []);

  const toggleType = useCallback((typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId],
    );
  }, []);

  const filteredSections = useMemo(() => {
    const typeSet = selectedTypes.length > 0 ? new Set(selectedTypes) : null;
    return sections
      .filter((s) => !section || s.id === section || s.label === section)
      .map(({ label, items }) => ({
        label,
        filtered: items.filter(
          (t) =>
            (!typeSet || (t.typeId !== undefined && typeSet.has(t.typeId))) &&
            (!querying || matchesQuery(t, deferredQuery)),
        ),
      }));
  }, [sections, section, selectedTypes, querying, deferredQuery]);

  const hasAnyResult = filteredSections.some((s) => s.filtered.length > 0);

  return (
    <div className='flex flex-col overflow-hidden'>
      <main className='flex flex-col items-center overflow-y-auto px-8 py-12'>
        <p className='text-base-content/30 mb-2 font-mono text-xs tracking-widest uppercase'>
          {today}
        </p>
        <h1 className='mb-6 text-3xl font-thin tracking-tight'>{title}</h1>
        <div className='mb-4 w-full max-w-3xl'>
          <SearchBar query={query} onChange={setQuery} />
        </div>

        {typeOptions.length > 0 && (
          <div className='mb-6 flex w-full max-w-3xl flex-wrap items-center justify-center gap-2'>
            <button
              type='button'
              aria-pressed={!typeFiltering}
              onClick={() => setSelectedTypes([])}
              className={`btn btn-xs ${
                typeFiltering ? 'btn-ghost border-base-300 border' : 'btn-primary'
              }`}>
              All
            </button>
            {typeOptions.map((option) => {
              const selected = selectedTypes.includes(option.id);
              return (
                <button
                  key={option.id}
                  type='button'
                  aria-pressed={selected}
                  onClick={() => toggleType(option.id)}
                  className={`btn btn-xs ${
                    selected ? 'btn-primary' : 'btn-ghost border-base-300 border'
                  }`}>
                  {option.label}
                  <span aria-hidden='true' className='text-base-content/60'>
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {filteredSections.map(({ label, filtered }) =>
          !filtering || filtered.length > 0 ? (
            <Section
              key={label}
              label={label}
              count={filtered.length}
              open={filtering ? true : (openSections[label] ?? true)}
              onToggle={() => toggleSection(label)}>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {filtered.map((t) => (
                  <div key={t.label}>
                    <ToolCard {...t} />
                  </div>
                ))}
              </div>
            </Section>
          ) : null,
        )}

        {filtering && !hasAnyResult && (
          <p className='text-base-content/30 mt-20 text-sm'>
            No results match {querying ? `"${query}"` : 'your filters'}
          </p>
        )}
      </main>
    </div>
  );
};
AppsStoreTemplate.displayName = 'AppsStoreTemplate';
