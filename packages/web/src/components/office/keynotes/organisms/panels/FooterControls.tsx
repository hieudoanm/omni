'use client';

import { type FC, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { Toggle } from '@/components/office/keynotes/atoms/FormControls';

export const FooterControls: FC = () => {
  const { currentDeck, setFooter } = useDeck();
  const fileRef = useRef<HTMLInputElement>(null);
  if (!currentDeck) return null;

  const uploadLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setFooter({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className='flex flex-col gap-2'>
      <Toggle
        label='Show slide numbers'
        checked={currentDeck.footer.showNumbers}
        onChange={(v) => setFooter({ showNumbers: v })}
      />
      <Toggle
        label='Show date'
        checked={currentDeck.footer.showDate}
        onChange={(v) => setFooter({ showDate: v })}
      />
      <input
        type='text'
        value={currentDeck.footer.text}
        onChange={(e) => setFooter({ text: e.target.value })}
        className='input input-xs input-bordered'
        placeholder='Footer text'
      />
      <label className='flex items-center gap-2 text-xs'>
        <span className='w-16 shrink-0 truncate opacity-70'>Logo</span>
        <input
          type='text'
          value={currentDeck.footer.logo ?? ''}
          onChange={(e) => setFooter({ logo: e.target.value })}
          className='input input-xs input-bordered w-full'
          placeholder='Logo URL'
        />
      </label>
      <button
        type='button'
        onClick={() => fileRef.current?.click()}
        className='btn btn-outline btn-xs gap-1'>
        <FiUpload className='size-3.5' /> Upload logo…
      </button>
      <input
        ref={fileRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadLogo(file);
        }}
      />
      {currentDeck.footer.logo && (
        <img
          src={currentDeck.footer.logo}
          alt='Logo preview'
          className='border-base-300 mt-1 max-h-16 self-start rounded border object-contain'
        />
      )}
    </div>
  );
};
