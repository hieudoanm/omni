'use client';

import { type FC } from 'react';
import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiArrowDown,
  FiArrowUp,
  FiColumns,
  FiCopy,
  FiList,
  FiSend,
  FiShield,
  FiTrash2,
  FiType,
} from 'react-icons/fi';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { IconButton } from '@/components/office/keynotes/atoms/IconButton';
import type { AlignAction } from '@/lib/office/keynotes/geometry';

export const ArrangePanel: FC = () => {
  const {
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

  const count = selectedObjectIds.length;
  const group = activeSlide?.objects.find(
    (o) => selectedObjectIds.includes(o.id) && o.kind === 'group',
  );

  const alignBtn = (action: AlignAction, label: string, icon: typeof FiAlignLeft) => (
    <button
      key={action}
      type='button'
      disabled={count < 2}
      onClick={() => alignSelected(action)}
      title={label}
      className='btn btn-ghost btn-xs flex-1 disabled:opacity-30'>
      {icon({ className: 'size-3.5' })}
    </button>
  );

  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Arrange</div>
      <div className='flex gap-1'>
        <IconButton
          icon={FiSend}
          label='Bring to front'
          size='sm'
          disabled={count === 0}
          onClick={bringToFront}
        />
        <IconButton
          icon={FiArrowUp}
          label='Bring forward'
          size='sm'
          disabled={count === 0}
          onClick={bringForward}
        />
        <IconButton
          icon={FiArrowDown}
          label='Send backward'
          size='sm'
          disabled={count === 0}
          onClick={sendBackward}
        />
        <IconButton
          icon={FiType}
          label='Send to back'
          size='sm'
          disabled={count === 0}
          onClick={sendToBack}
        />
      </div>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>
        Align & distribute
      </div>
      <div className='flex gap-1'>
        {alignBtn('left', 'Align left', FiAlignLeft)}
        {alignBtn('center', 'Align center', FiAlignCenter)}
        {alignBtn('right', 'Align right', FiAlignRight)}
        {alignBtn('top', 'Align top', FiAlignJustify)}
        {alignBtn('middle', 'Align middle', FiAlignJustify)}
        {alignBtn('bottom', 'Align bottom', FiAlignJustify)}
      </div>
      <div className='flex gap-1'>
        {alignBtn('center-h', 'Center horizontally', FiAlignCenter)}
        {alignBtn('center-v', 'Center vertically', FiAlignCenter)}
        {alignBtn('distribute-h', 'Distribute horizontally', FiColumns)}
        {alignBtn('distribute-v', 'Distribute vertically', FiList)}
      </div>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Group</div>
      <div className='flex gap-1'>
        <IconButton
          icon={FiShield}
          label='Group (Ctrl+G)'
          size='sm'
          disabled={count < 2}
          onClick={groupSelected}
        />
        <IconButton
          icon={FiCopy}
          label='Ungroup'
          size='sm'
          disabled={!group}
          onClick={() => group && ungroup(group.id)}
        />
      </div>
      <div className='text-xs font-semibold tracking-wide uppercase opacity-70'>Edit</div>
      <div className='flex gap-1'>
        <IconButton
          icon={FiCopy}
          label='Duplicate (Ctrl+D)'
          size='sm'
          disabled={count === 0}
          onClick={duplicateSelected}
        />
        <IconButton
          icon={FiTrash2}
          label='Delete'
          size='sm'
          variant='danger'
          disabled={count === 0}
          onClick={() => selectedObjectIds.forEach(deleteObject)}
        />
      </div>
    </div>
  );
};
