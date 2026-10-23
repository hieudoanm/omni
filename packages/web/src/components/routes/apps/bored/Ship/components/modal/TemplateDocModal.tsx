import 'github-markdown-css/github-markdown-dark.css';
import { marked } from 'marked';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { POSTS, TEMPLATES } from '../../data/docs-import';
import { ModalHeader } from './ModalHeader';
import { type DocTab, type DocType } from './ModalTabs';
import { PreviewTab } from './PreviewTab';
import { RawTab } from './RawTab';

const DOCS: Record<DocType, string> = {
  templates: TEMPLATES,
  posts: POSTS,
};

const FILENAMES: Record<DocType, string> = {
  templates: 'template-reference.md',
  posts: 'post-specification.md',
};

export const TemplateDocModal: FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [tab, setTab] = useState<DocTab>('preview');
  const [docType, setDocType] = useState<DocType>('templates');
  const [copied, setCopied] = useState(false);

  const doc = DOCS[docType];
  const html = useMemo(() => marked(doc, { async: false }) as string, [doc]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(doc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [doc]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = FILENAMES[docType];
    a.click();
    URL.revokeObjectURL(url);
  }, [doc, docType]);

  if (!open) return null;

  return (
    <div className='bg-base-100/80 fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12 backdrop-blur-sm'>
      <div className='rounded-box border-base-300 bg-base-200 relative w-full max-w-3xl border shadow-2xl'>
        <ModalHeader
          tab={tab}
          docType={docType}
          onTabChange={setTab}
          onDocTypeChange={setDocType}
          onCopy={handleCopy}
          copied={copied}
          onDownload={handleDownload}
          onClose={onClose}
        />
        {tab === 'raw' ? <RawTab content={doc} /> : <PreviewTab html={html} />}
      </div>
    </div>
  );
};

TemplateDocModal.displayName = 'TemplateDocModal';
