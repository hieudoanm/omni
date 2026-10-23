import type { FC } from 'react';

import { ModalTabs, type DocTab, type DocType } from './ModalTabs';

export const ModalHeader: FC<{
  tab: DocTab;
  docType: DocType;
  onTabChange: (tab: DocTab) => void;
  onDocTypeChange: (docType: DocType) => void;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
  onClose: () => void;
}> = ({ tab, docType, onTabChange, onDocTypeChange, onCopy, copied, onDownload, onClose }) => (
  <div className='border-base-300 flex items-center justify-between border-b px-6 py-4'>
    <div className='flex items-center gap-3'>
      <div className='rounded-box border-base-300 flex gap-1 border p-0.5'>
        {(['templates', 'posts'] as const).map((dt) => (
          <button
            key={dt}
            onClick={() => onDocTypeChange(dt)}
            className={`rounded-box px-3 py-1 text-xs font-medium transition-all ${
              dt === docType
                ? 'bg-base-300 text-base-content'
                : 'text-neutral hover:text-base-content'
            }`}>
            {dt === 'templates' ? 'Templates' : 'Posts'}
          </button>
        ))}
      </div>
      <ModalTabs tab={tab} onChange={onTabChange} />
    </div>
    <div className='flex items-center gap-2'>
      <button onClick={onCopy} className='btn btn-ghost btn-sm rounded-box text-neutral text-xs'>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <button
        onClick={onDownload}
        className='btn btn-ghost btn-sm rounded-box text-neutral text-xs'>
        Download
      </button>
      <button onClick={onClose} className='btn btn-ghost btn-sm rounded-box text-neutral text-xs'>
        Close
      </button>
    </div>
  </div>
);
