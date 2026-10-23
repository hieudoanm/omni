import { FC, memo, useCallback, useRef } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';

export const SearchBar: FC<{ query: string; onChange: (v: string) => void }> = memo(
  ({ query, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const googleSearch = useCallback(() => {
      if (!query.trim()) return;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query.trim())}`, '_blank');
    }, [query]);

    const onKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') googleSearch();
      },
      [googleSearch],
    );

    return (
      <div className='join w-full'>
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Search or filter…'
          className='input input-bordered join-item focus:border-primary focus:outline-primary w-full'
        />
        <button
          className='btn join-item btn-primary'
          onClick={googleSearch}
          aria-label='Search with Google'>
          <PiMagnifyingGlass size={16} />
        </button>
      </div>
    );
  },
);

SearchBar.displayName = 'SearchBar';
