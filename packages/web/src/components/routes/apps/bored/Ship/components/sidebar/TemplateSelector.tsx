import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { TemplateDef } from '../../types';
import { TemplateCategoryGroup } from './TemplateCategoryGroup';
import { CATEGORY_LABELS, CATEGORY_ORDER, TemplateSearch } from './TemplateSearch';

export const TemplateSelector: FC<{
  templates: TemplateDef[];
  onPreview: (id: string) => void;
  onPick: (id: string) => void;
}> = ({ templates, onPreview, onPick }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = useMemo(() => {
    let list = templates;
    if (categoryFilter) {
      list = list.filter((t) => t.category === categoryFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          (CATEGORY_LABELS[t.category] ?? t.category).toLowerCase().includes(q),
      );
    }
    return list.length === templates.length ? null : list;
  }, [query, templates, categoryFilter]);

  const grouped = useMemo(() => {
    const source = (filtered ?? templates).toSorted((a, b) => a.label.localeCompare(b.label));
    const map: Record<string, TemplateDef[]> = {};
    for (const t of source) {
      (map[t.category] ??= []).push(t);
    }
    return map;
  }, [filtered, templates]);

  return (
    <div className='flex h-full flex-col'>
      <TemplateSearch
        total={templates.length}
        query={query}
        onQueryChange={setQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />
      <div className='flex-1 overflow-y-auto px-3 py-4'>
        {filtered && filtered.length === 0 ? (
          <p className='text-neutral px-2 text-xs'>No templates found.</p>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <TemplateCategoryGroup
                key={cat}
                label={CATEGORY_LABELS[cat] ?? cat}
                templates={items}
                onPreview={onPreview}
                onPick={onPick}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
