import { useState, type FC } from 'react';

import type { PostItem, TemplateDef } from '../../types';
import { PostsList } from './PostsList';
import { SidebarTabBar, type SidebarTab } from './SidebarTabBar';
import { SidebarToggle } from './SidebarToggle';
import { TemplateSelector } from './TemplateSelector';

export const TemplateSidebar: FC<{
  open: boolean;
  onToggle: () => void;
  templates: TemplateDef[];
  posts: PostItem[];
  activeIndex: number;
  onSelectPost: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onAddFromTemplate: (templateId: string) => void;
  templateLabel: (templateId: string) => string;
  onPreviewTemplate: (templateId: string) => void;
  onClearPreview: () => void;
}> = ({
  open,
  onToggle,
  templates,
  posts,
  activeIndex,
  onSelectPost,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAddFromTemplate,
  templateLabel,
  onPreviewTemplate,
  onClearPreview,
}) => {
  const [tab, setTab] = useState<SidebarTab>('posts');

  return (
    <div className='flex min-h-0'>
      <div
        className={`h-full min-h-0 overflow-hidden transition-all duration-300 ${
          open ? 'w-72' : 'w-0'
        }`}>
        <div className='border-base-300 bg-base-200 flex h-full w-72 flex-shrink-0 flex-col border-r'>
          <SidebarTabBar
            tab={tab}
            onChange={(t) => {
              setTab(t);
              if (t === 'posts') onClearPreview();
            }}
          />
          <div className='flex-1 overflow-hidden'>
            {tab === 'posts' ? (
              <PostsList
                posts={posts}
                activeIndex={activeIndex}
                onSelect={(i) => {
                  onSelectPost(i);
                  onClearPreview();
                }}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                templateLabel={templateLabel}
              />
            ) : (
              <TemplateSelector
                templates={templates}
                onPreview={onPreviewTemplate}
                onPick={(id) => {
                  onAddFromTemplate(id);
                  onClearPreview();
                  setTab('posts');
                }}
              />
            )}
          </div>
        </div>
      </div>
      <SidebarToggle open={open} tab={tab} onClick={onToggle} />
    </div>
  );
};

TemplateSidebar.displayName = 'TemplateSidebar';
