'use client';

import { type FC, useRef, useState } from 'react';
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBarChart2,
  FiCamera,
  FiChevronDown,
  FiCode,
  FiCopy,
  FiDelete,
  FiGrid,
  FiImage,
  FiLayers,
  FiList,
  FiEdit,
  FiMusic,
  FiPenTool,
  FiSend,
  FiShield,
  FiSquare,
  FiTrash2,
  FiType,
  FiVideo,
  FiZap,
} from 'react-icons/fi';
import type { TextObject, ShapeObject } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { IconButton } from '@/components/office/keynotes/atoms/IconButton';
import {
  newChartObject,
  newDiagramObject,
  newEmbedObject,
  newEquationObject,
  newIconObject,
  newImageObject,
  newMediaObject,
  newShapeObject,
  newTableObject,
  newTextObject,
} from '@/lib/office/keynotes/deckFactory';
import { captureScreen } from '@/lib/office/keynotes/capture';
import type { AlignAction } from '@/lib/office/keynotes/geometry';
import { SHAPE_TYPES } from '@/lib/office/keynotes/shapes';
import { ICON_LIBRARY, ICON_MAP } from '@/data/office/keynotes/icons';

export const InsertToolbar: FC<{
  drawMode?: boolean;
  onToggleDrawing?: () => void;
}> = ({ drawMode = false, onToggleDrawing }) => {
  const {
    addObject,
    selectedObjectIds,
    duplicateSelected,
    deleteObject,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    alignSelected,
    groupSelected,
    ungroup,
    activeSlide,
  } = useDeck();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNew = (make: () => TextObject | ShapeObject) => {
    addObject(make());
  };

  const insertImage = () => {
    const url = window.prompt('Image URL:');
    if (url) {
      addObject({ ...newImageObject(), src: url });
    }
  };

  const insertUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      addObject({ ...newImageObject(), src: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const insertScreenshot = async () => {
    const dataUrl = await captureScreen();
    if (dataUrl) {
      addObject({ ...newImageObject({ src: dataUrl, w: 960, h: 540 }) });
    } else {
      window.alert('Screen capture is not available in this browser.');
    }
  };

  const insertMedia = () => {
    const url = window.prompt('Video/audio URL:');
    if (url) {
      addObject({ ...newMediaObject(), src: url });
    }
  };

  const insertEmbed = () => {
    const url = window.prompt('Embed URL (YouTube / Mermaid / code):');
    if (url) {
      addObject({ ...newEmbedObject(), url });
    }
  };

  const selectedGroup = activeSlide?.objects.find(
    (o) => selectedObjectIds.includes(o.id) && o.kind === 'group',
  );
  const singleSelected = activeSlide?.objects.find((o) => selectedObjectIds.includes(o.id));
  const selectedCount = selectedObjectIds.length;

  return (
    <div className='border-base-300 bg-base-200 flex h-11 shrink-0 items-center gap-1 border-b px-2'>
      <IconButton icon={FiType} label='Text box' onClick={() => addNew(() => newTextObject())} />
      <IconButton icon={FiSquare} label='Shape' onClick={() => addNew(() => newShapeObject())} />
      <IconButton icon={FiBarChart2} label='Chart' onClick={() => addObject(newChartObject())} />
      <IconButton icon={FiGrid} label='Table' onClick={() => addObject(newTableObject())} />
      <div className='dropdown dropdown-end'>
        <button
          type='button'
          tabIndex={0}
          onClick={() => setOpenMenu(openMenu === 'image' ? null : 'image')}
          className='btn btn-ghost btn-sm gap-0.5'>
          <FiImage /> Image <FiChevronDown className='size-3' />
        </button>
        {openMenu === 'image' && (
          <div className='dropdown-content border-base-300 bg-base-100 z-50 mt-1 w-44 rounded-xl border p-1 shadow-xl'>
            <button
              type='button'
              onClick={() => {
                setOpenMenu(null);
                fileInputRef.current?.click();
              }}
              className='hover:bg-base-200 w-full rounded-lg px-3 py-1.5 text-left text-xs'>
              Upload…
            </button>
            <button
              type='button'
              onClick={() => {
                setOpenMenu(null);
                insertImage();
              }}
              className='hover:bg-base-200 w-full rounded-lg px-3 py-1.5 text-left text-xs'>
              From URL…
            </button>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) insertUpload(f);
          e.target.value = '';
        }}
      />
      <IconButton icon={FiCamera} label='Screenshot' onClick={() => void insertScreenshot()} />
      <IconButton icon={FiZap} label='Diagram' onClick={() => addObject(newDiagramObject())} />
      <IconButton icon={FiShield} label='Icon' onClick={() => addObject(newIconObject())} />
      <IconButton icon={FiCode} label='Equation' onClick={() => addObject(newEquationObject())} />
      <IconButton icon={FiVideo} label='Media' onClick={insertMedia} />
      <IconButton icon={FiPenTool} label='Embed' onClick={insertEmbed} />
      <IconButton
        icon={FiEdit}
        label={drawMode ? 'Finish drawing' : 'Draw'}
        active={drawMode}
        onClick={onToggleDrawing}
      />

      <div className='divider divider-horizontal mx-1 h-5' />

      <div className='dropdown dropdown-end'>
        <button
          type='button'
          tabIndex={0}
          className='btn btn-ghost btn-sm gap-0.5'
          onClick={() => setOpenMenu(openMenu === 'shapes' ? null : 'shapes')}>
          <FiSquare /> Shapes <FiChevronDown className='size-3' />
        </button>
        {openMenu === 'shapes' && (
          <div className='dropdown-content border-base-300 bg-base-100 z-50 mt-1 grid w-64 grid-cols-6 gap-1 rounded-xl border p-2 shadow-xl'>
            {SHAPE_TYPES.map((t) => (
              <button
                key={t}
                type='button'
                title={t}
                onClick={() => {
                  setOpenMenu(null);
                  addNew(() => newShapeObject({ shapeType: t }));
                }}
                className='hover:bg-base-200 flex aspect-square items-center justify-center rounded-lg text-lg'>
                <ShapeGlyph type={t} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className='dropdown dropdown-end'>
        <button
          type='button'
          tabIndex={0}
          className='btn btn-ghost btn-sm gap-0.5'
          onClick={() => setOpenMenu(openMenu === 'icons' ? null : 'icons')}>
          <FiShield /> Icons <FiChevronDown className='size-3' />
        </button>
        {openMenu === 'icons' && (
          <div className='dropdown-content border-base-300 bg-base-100 z-50 mt-1 grid w-72 grid-cols-8 gap-1 rounded-xl border p-2 shadow-xl'>
            {ICON_LIBRARY.map((item) => {
              const Icon = ICON_MAP[item.id] ?? ICON_MAP.star;
              return (
                <button
                  key={item.id}
                  type='button'
                  title={item.label}
                  onClick={() => {
                    setOpenMenu(null);
                    addObject(newIconObject({ icon: item.id }));
                  }}
                  className='hover:bg-base-200 flex aspect-square items-center justify-center rounded-lg text-lg'>
                  <Icon />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className='flex-1' />

      <div className='flex items-center gap-0.5 opacity-60'>
        <IconButton
          icon={FiCopy}
          label='Duplicate (Ctrl+D)'
          size='sm'
          disabled={selectedCount === 0}
          onClick={duplicateSelected}
        />
        <IconButton
          icon={FiTrash2}
          label='Delete'
          size='sm'
          variant='danger'
          disabled={selectedCount === 0}
          onClick={() => selectedObjectIds.forEach(deleteObject)}
        />
      </div>

      <div className='divider divider-horizontal mx-1 h-5' />

      <div className='flex items-center gap-0.5'>
        <IconButton
          icon={FiLayers}
          label='Send to back'
          size='sm'
          disabled={selectedCount === 0}
          onClick={sendToBack}
        />
        <IconButton
          icon={FiSend}
          label='Bring to front'
          size='sm'
          disabled={selectedCount === 0}
          onClick={bringToFront}
        />
        <IconButton
          icon={FiChevronDown}
          label='Bring forward'
          size='sm'
          disabled={selectedCount === 0}
          onClick={bringForward}
        />
        <IconButton
          icon={FiChevronDown}
          label='Send backward'
          size='sm'
          disabled={selectedCount === 0}
          onClick={sendBackward}
        />
      </div>

      <div className='divider divider-horizontal mx-1 h-5' />

      <div className='flex items-center gap-0.5'>
        <IconButton
          icon={FiAlignLeft}
          label='Align left'
          size='sm'
          disabled={selectedCount < 2}
          onClick={() => alignSelected('left')}
        />
        <IconButton
          icon={FiAlignCenter}
          label='Align center'
          size='sm'
          disabled={selectedCount < 2}
          onClick={() => alignSelected('center')}
        />
        <IconButton
          icon={FiAlignRight}
          label='Align right'
          size='sm'
          disabled={selectedCount < 2}
          onClick={() => alignSelected('right')}
        />
        <IconButton
          icon={FiAlignJustify}
          label='Align top'
          size='sm'
          disabled={selectedCount < 2}
          onClick={() => alignSelected('top')}
        />
        <IconButton
          icon={FiList}
          label='Distribute horizontally'
          size='sm'
          disabled={selectedCount < 2}
          onClick={() => alignSelected('distribute-h')}
        />
        <IconButton
          icon={FiType}
          label='Group (Ctrl+G)'
          size='sm'
          disabled={selectedCount < 2}
          onClick={groupSelected}
        />
        <IconButton
          icon={FiShield}
          label='Ungroup'
          size='sm'
          disabled={!selectedGroup}
          onClick={() => selectedGroup && ungroup(selectedGroup.id)}
        />
      </div>
    </div>
  );
};

const ShapeGlyph = ({ type }: { type: string }) => (
  <svg viewBox='0 0 100 100' className='h-6 w-6'>
    <path d={SHAPE_PATHS[type] ?? SHAPE_PATHS.rect} fill='currentColor' stroke='none' />
  </svg>
);

const SHAPE_PATHS: Record<string, string> = {
  rect: 'M10 10 H90 V90 H10 Z',
  'rounded-rect': 'M10 30 Q10 10 30 10 H70 Q90 10 90 30 V70 Q90 90 70 90 H30 Q10 90 10 70 Z',
  circle: 'M50 10 A40 40 0 1 1 49.99 10 Z',
  oval: 'M50 20 A30 30 0 1 1 49.99 20 Z',
  triangle: 'M50 10 L90 90 L10 90 Z',
  'rt-triangle': 'M10 10 L90 10 L10 90 Z',
  diamond: 'M50 10 L90 50 L50 90 L10 50 Z',
  pentagon: 'M50 5 L95 40 L78 92 L22 92 L5 40 Z',
  hexagon: 'M25 10 L75 10 L97 50 L75 90 L25 90 L3 50 Z',
  star: 'M50 5 L61 39 L98 39 L68 60 L79 95 L50 74 L21 95 L32 60 L2 39 L39 39 Z',
  line: 'M5 50 H95',
};
