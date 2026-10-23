'use client';

import type { FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PiCaretDown, PiCaretRight, PiCheckBold, PiMagnifyingGlass } from 'react-icons/pi';
import type { Category, Item } from '../types';

interface ItemSelectProps {
  categories: Category[];
  items: Item[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  placeholder?: string;
}

export const ItemSelect: FC<ItemSelectProps> = ({
  categories,
  items,
  value,
  onChange,
  allLabel = 'All',
  placeholder = 'Search…',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const active = items.find((n) => n.value === value);
  const activeCategory = categories.find((c) => c.value === active?.category);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
        setFilterCat(null);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setSearch('');
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return categories
      .map((cat) => {
        const matched = items.filter(
          (n) =>
            n.category === cat.value &&
            (filterCat === null || cat.value === filterCat) &&
            (!q || n.label.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)),
        );
        return { category: cat, items: matched };
      })
      .filter((g) => g.items.length > 0);
  }, [categories, items, search, filterCat]);

  const toggleExpand = (catValue: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(catValue)) next.delete(catValue);
      else next.add(catValue);
      return next;
    });
  };

  return (
    <div ref={ref} className='relative z-10 w-full max-w-md'>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
          open
            ? 'text-accent border-accent/50 bg-accent/10'
            : 'text-base-content border-base-content/20 bg-base-content/5'
        }`}>
        <span className='w-5 shrink-0 text-center text-base leading-none'>
          {activeCategory?.emoji}
        </span>
        <span className='flex-1 truncate text-left'>{active?.label ?? allLabel}</span>
        <PiCaretDown
          className={`ml-0.5 h-3 w-3 shrink-0 transition-transform duration-200 ${
            open ? 'text-accent rotate-180' : 'text-base-content/70'
          }`}
        />
      </button>

      {open && (
        <div className='border-base-content/10 bg-base-200 absolute right-0 left-0 z-50 mt-2 rounded-2xl border p-1.5 shadow-2xl shadow-black/50 transition-all duration-200'>
          <div className='px-2 pt-1 pb-1'>
            <div className='border-base-content/10 bg-base-300 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm'>
              <PiMagnifyingGlass className='text-base-content/50 h-4 w-4 shrink-0' />
              <input
                ref={inputRef}
                type='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className='w-full bg-transparent outline-none'
              />
            </div>
          </div>

          <div className='flex flex-wrap gap-1 px-2 pb-2'>
            <button
              onClick={() => setFilterCat(null)}
              className={`cursor-pointer rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
                filterCat === null
                  ? 'text-accent bg-accent/20'
                  : 'text-base-content/60 hover:bg-base-content/10'
              }`}>
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setFilterCat((prev) => (prev === cat.value ? null : cat.value))}
                className={`cursor-pointer rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
                  filterCat === cat.value
                    ? 'text-accent bg-accent/20'
                    : 'text-base-content/60 hover:bg-base-content/10'
                }`}>
                {cat.emoji}
              </button>
            ))}
          </div>

          <div className='max-h-[55vh] overflow-y-auto'>
            <button
              onClick={() => {
                onChange('all');
                setOpen(false);
                setSearch('');
                setFilterCat(null);
              }}
              className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border-none px-3 py-2.5 text-left text-sm font-semibold transition-colors duration-150 ${
                value === 'all'
                  ? 'text-accent bg-accent/20'
                  : 'text-base-content hover:bg-base-content/10'
              }`}>
              <span className='inline-flex h-5 w-5 items-center justify-center text-base leading-none'>
                🎲
              </span>
              <span className='flex-1'>{allLabel}</span>
              {value === 'all' && <PiCheckBold className='h-3.5 w-3.5 shrink-0' />}
            </button>

            <div className='border-base-content/10 mx-2 my-1 border-t' />

            {filtered.map(({ category: cat, items: catItems }) => {
              const isExpanded = search.trim().length > 0 || expanded.has(cat.value);
              return (
                <div key={cat.value}>
                  <button
                    onClick={() => toggleExpand(cat.value)}
                    className='text-base-content/50 flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-wider uppercase'>
                    {isExpanded ? (
                      <PiCaretDown className='h-3 w-3' />
                    ) : (
                      <PiCaretRight className='h-3 w-3' />
                    )}
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className='text-base-content/30 ml-auto'>{catItems.length}</span>
                  </button>
                  {isExpanded &&
                    catItems.map(({ emoji, label, value: itemValue }) => (
                      <button
                        key={itemValue}
                        onClick={() => {
                          onChange(itemValue);
                          setOpen(false);
                          setSearch('');
                          setFilterCat(null);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-xl border-none px-3 py-2 pl-10 text-left text-sm font-medium transition-colors duration-150 ${
                          itemValue === value
                            ? 'text-accent bg-accent/20'
                            : 'text-base-content hover:bg-base-content/10'
                        }`}>
                        <span className='inline-flex h-5 w-5 items-center justify-center text-base leading-none'>
                          {emoji}
                        </span>
                        <span className='flex-1'>{label}</span>
                        {itemValue === value && <PiCheckBold className='h-3.5 w-3.5 shrink-0' />}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

ItemSelect.displayName = 'ItemSelect';
