'use client';

import { type FC } from 'react';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { THEMES } from '@/data/office/keynotes/themes';
import { FooterControls } from '@/components/office/keynotes/organisms/panels/FooterControls';
import {
  SlideBackgroundPicker,
  normalizeBackground,
} from '@/components/office/keynotes/organisms/panels/SlideBackgroundPicker';

export const ThemePanel: FC = () => {
  const { currentDeck, activeSlide, setDeckThemeId, setDeckTheme, setSlideBackground } = useDeck();

  if (!currentDeck) return null;
  const theme = currentDeck.theme;
  const slideBackground = normalizeBackground(activeSlide?.background, theme.colors.background);

  const applyTheme = (id: string) => {
    const t = THEMES.find((x) => x.id === id);
    if (!t) return;
    setDeckThemeId(id);
    setSlideBackground({
      type: 'solid',
      color: t.colors.background,
      opacity: 1,
    });
  };

  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Theme</div>
      <div className='grid grid-cols-2 gap-2'>
        {THEMES.map((t) => (
          <button
            key={t.id}
            type='button'
            onClick={() => applyTheme(t.id)}
            className={`flex h-16 flex-col justify-between rounded-xl border p-2 text-left transition ${
              theme.id === t.id
                ? 'border-primary ring-primary/40 ring-2'
                : 'border-base-300 hover:border-base-content/40'
            }`}
            style={{ backgroundColor: t.colors.background }}>
            <span className='text-[10px] font-semibold' style={{ color: t.colors.text }}>
              {t.name}
            </span>
            <span className='flex gap-1'>
              <i className='size-2 rounded-full' style={{ backgroundColor: t.colors.primary }} />
              <i className='size-2 rounded-full' style={{ backgroundColor: t.colors.secondary }} />
              <i className='size-2 rounded-full' style={{ backgroundColor: t.colors.accent }} />
            </span>
          </button>
        ))}
      </div>

      {theme.variants && theme.variants.length > 0 && (
        <>
          <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Variant</div>
          <div className='flex flex-wrap gap-1'>
            {theme.variants.map((v) => (
              <button
                key={v.id}
                type='button'
                onClick={() => {
                  setDeckTheme({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      background: v.background,
                      surface: v.surface,
                      text: v.text ?? theme.colors.text,
                      muted: v.muted ?? theme.colors.muted,
                    },
                  });
                  setSlideBackground({
                    type: 'solid',
                    color: v.background,
                    opacity: 1,
                  });
                }}
                className={`btn btn-outline btn-xs ${
                  theme.colors.background === v.background ? 'btn-primary' : ''
                }`}
                style={{
                  backgroundColor: v.background,
                  color: v.text ?? theme.colors.text,
                }}>
                {v.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Font</div>
      <select
        className='select select-sm select-bordered'
        value={theme.fontFamily}
        onChange={(e) =>
          setDeckTheme({
            ...theme,
            fontFamily: e.target.value as typeof theme.fontFamily,
          })
        }>
        {['sans', 'serif', 'mono', 'playfair', 'space-grotesk'].map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <div className='divider my-1' />

      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Slide background
      </div>
      <SlideBackgroundPicker value={slideBackground} onChange={setSlideBackground} />

      <div className='divider my-1' />

      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Footer</div>
      <FooterControls />
    </div>
  );
};
