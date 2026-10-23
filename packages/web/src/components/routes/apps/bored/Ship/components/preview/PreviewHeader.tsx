import type { FC } from 'react';

export const PreviewHeader: FC<{
  totalPosts: number;
  activeIndex: number;
  onCopy: () => void;
  onDownload: () => void;
  onDownloadAll: () => void;
}> = ({ totalPosts, activeIndex, onCopy, onDownload, onDownloadAll }) => {
  const multi = totalPosts > 1;

  return (
    <div className='mb-4 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>Preview</h2>
        {multi && (
          <span className='text-base-content/40 text-xs'>
            {activeIndex + 1} / {totalPosts}
          </span>
        )}
      </div>
      <div className='flex gap-2'>
        <button onClick={onCopy} className='btn btn-ghost btn-sm'>
          Copy Image
        </button>
        <div className='dropdown dropdown-end'>
          <button tabIndex={0} className='btn btn-primary btn-sm'>
            Download
            <svg
              className='size-3 opacity-50'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
          <ul
            tabIndex={0}
            className='dropdown-content menu bg-base-100 rounded-box z-10 mt-1 w-40 p-1 shadow'>
            <li>
              <button onClick={onDownload}>Download PNG</button>
            </li>
            {multi && (
              <li>
                <button onClick={onDownloadAll}>Download All</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
