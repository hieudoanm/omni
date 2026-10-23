import { FC } from 'react';
import { PiArrowClockwise, PiMagicWand } from 'react-icons/pi';

interface SpinButtonProps {
  spinning: boolean;
  hasLanded: boolean;
  onClick: () => void;
}

export const SpinButton: FC<SpinButtonProps> = ({ spinning, hasLanded, onClick }) => (
  <div className='flex flex-col items-center gap-3'>
    <button
      onClick={onClick}
      disabled={spinning}
      className='btn btn-primary min-w-36 cursor-pointer rounded-full font-bold tracking-wider sm:min-w-44'>
      {spinning ? (
        <span className='flex items-center gap-2'>
          <PiArrowClockwise className='h-4 w-4 animate-spin' />
          <span>Spinning…</span>
        </span>
      ) : (
        <span className='flex items-center gap-2'>
          <PiMagicWand className='h-4 w-4' />
          <span>{hasLanded ? 'Spin Again' : 'Spin'}</span>
        </span>
      )}
    </button>

    <p className='text-base-content/30 text-[10px] sm:text-xs'>
      or press <kbd className='kbd kbd-xs'>Spacebar / Enter</kbd>
    </p>
  </div>
);
