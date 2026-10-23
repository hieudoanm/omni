import { pokedex } from '@/components/routes/apps/trivia/Pokedex/data/pokedex';
import { FC, useMemo, useState } from 'react';

import { PokemonDetail } from './components/PokemonDetail';
import { getTypeColor } from './constants';
import { Pokemon, SortKey, SortOrder } from './types';
import { fuzzyMatch } from './utils/search';

const data = pokedex as Pokemon[];

export const Pokedex: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selected, setSelected] = useState<Pokemon | null>(null);

  const allTypes = useMemo(() => Array.from(new Set(data.map((p) => p.type))).sort(), []);

  const filtered = useMemo(() => {
    let result = data;
    if (search) result = result.filter((p) => fuzzyMatch(p.name, search) > 0);
    if (typeFilter) result = result.filter((p) => p.type === typeFilter);
    return [...result].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortOrder === 'asc' ? diff : -diff;
    });
  }, [search, typeFilter, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <>
      <div className='border-base-300 flex flex-wrap items-center gap-2 border-b px-4 py-2'>
        <input
          className='input input-bordered input-sm w-40'
          placeholder='Search…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className='select select-bordered select-sm'
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}>
          <option value=''>All types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className='flex gap-1'>
          {(['id', 'hp', 'attack', 'speed'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              className={`btn btn-xs ${sortKey === key ? 'btn-primary' : 'btn-ghost'}`}>
              {key.toUpperCase()}
              {sortKey === key && <span className='ml-0.5'>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
            </button>
          ))}
        </div>
        <span className='ml-auto text-xs opacity-40'>{filtered.length} Pokémon</span>
      </div>
      <div className='min-h-0 flex-1 overflow-y-auto p-4'>
        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5'>
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className='bg-base-200 hover:bg-base-300 flex cursor-pointer flex-col items-center rounded-xl p-2 text-center transition hover:-translate-y-0.5'>
              <img
                src={`https://raw.githubusercontent.com/hieudoanm/pokedex/master/packages/data/pokemon/images/${p.name}.png`}
                className='h-12 w-12'
                alt={p.name}
                loading='lazy'
              />
              <p className='text-[10px] opacity-40'>#{p.id}</p>
              <p className='text-xs leading-tight capitalize'>{p.name.replaceAll('-', ' ')}</p>
              <span className={`badge badge-xs mt-1 ${getTypeColor(p.type)}`}>{p.type}</span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className='py-12 text-center text-xs opacity-30'>No Pokémon found</p>
        )}
      </div>

      {selected && <PokemonDetail p={selected} onClose={() => setSelected(null)} />}
    </>
  );
};
Pokedex.displayName = 'Pokedex';
