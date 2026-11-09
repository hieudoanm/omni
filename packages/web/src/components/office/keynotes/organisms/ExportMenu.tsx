'use client';

import { type FC } from 'react';
import Link from 'next/link';
import { FiDownload, FiFileText, FiImage, FiFile, FiGrid, FiDroplet } from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import {
  exportDeckJson,
  exportDeckPngs,
  exportDeckStoryPng,
  exportDeckStorySvg,
  exportHtmlFile,
  exportPptxMock,
  exportSlidePng,
  exportSlideSvg,
  exportThemeFile,
} from '@/lib/office/keynotes/exporters';

const run =
  (fn: () => Promise<void>): (() => void) =>
  () => {
    void (async () => {
      try {
        await fn();
      } catch {
        window.alert('Export failed — check the console for details.');
      }
    })();
  };

const Item: FC<{
  onClick?: () => void;
  href?: string;
  label: string;
  icon: FC<{ className?: string }>;
}> = ({ onClick, href, label, icon: Icon }) => {
  const content = (
    <>
      <Icon className='size-3.5 opacity-70' />
      {label}
    </>
  );
  const cls = 'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-base-200';
  return href ? (
    <Link href={href} className={cls}>
      {content}
    </Link>
  ) : (
    <button type='button' onClick={onClick} className={cls}>
      {content}
    </button>
  );
};

const Group: FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className='border-base-200 border-b px-1 py-1.5 last:border-b-0'>
    <p className='text-base-content/40 px-2.5 pb-1 text-[10px] font-semibold tracking-wide uppercase'>
      {title}
    </p>
    <div className='flex flex-col'>{children}</div>
  </div>
);

export const ExportMenu: FC = () => {
  const { currentDeck, activeSlide } = useDeck();
  if (!currentDeck) return null;
  const index = currentDeck.slides.findIndex((s) => s.id === activeSlide?.id);
  const slide = index >= 0 ? currentDeck.slides[index] : undefined;

  return (
    <div className='dropdown dropdown-end'>
      <button type='button' tabIndex={0} className='btn btn-ghost btn-xs gap-1' title='Export'>
        <FiDownload className='size-3.5' />
        Export
      </button>
      <div
        tabIndex={0}
        className='dropdown-content border-base-300 bg-base-100 z-50 mt-1 w-56 rounded-lg border p-2 shadow-xl'>
        <Group title='Project'>
          <Item
            label='Native project (.keynotes.json)'
            icon={FiFile}
            onClick={() => exportDeckJson(currentDeck)}
          />
          <Item
            label='PPTX (mock archive)'
            icon={FiFileText}
            onClick={() => exportPptxMock(currentDeck)}
          />
          <Item
            label='HTML presentation'
            icon={FiFileText}
            onClick={() => exportHtmlFile(currentDeck)}
          />
          <Item
            label='Theme (.theme)'
            icon={FiDroplet}
            onClick={() => exportThemeFile(currentDeck)}
          />
        </Group>
        <Group title='Print'>
          <Item label='Print / Save as PDF' icon={FiGrid} href={`/print/${currentDeck.id}`} />
          <Item
            label='Handouts (multi-per-page)'
            icon={FiGrid}
            href={`/handouts/${currentDeck.id}`}
          />
        </Group>
        <Group title='Images'>
          {slide && (
            <>
              <Item
                label='Current slide as PNG'
                icon={FiImage}
                onClick={run(() => exportSlidePng(slide, currentDeck, index))}
              />
              <Item
                label='Current slide as SVG'
                icon={FiImage}
                onClick={() => exportSlideSvg(slide, currentDeck, index)}
              />
            </>
          )}
          <Item
            label='All slides as PNG'
            icon={FiImage}
            onClick={run(() => exportDeckPngs(currentDeck))}
          />
          <Item
            label='Image story (long SVG)'
            icon={FiImage}
            onClick={() => exportDeckStorySvg(currentDeck)}
          />
          <Item
            label='Image story (long PNG)'
            icon={FiImage}
            onClick={run(() => exportDeckStoryPng(currentDeck))}
          />
        </Group>
      </div>
    </div>
  );
};
