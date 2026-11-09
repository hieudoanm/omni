import type { FC, MutableRefObject } from 'react';
import { useState } from 'react';

import type { FieldDef } from '../../types';
import { EditorTabBar, type EditorTab } from './EditorTabBar';
import { EditorToggle } from './EditorToggle';
import { FullYamlPanel } from './FullYamlPanel';
import { SingleYamlPanel } from './SingleYamlPanel';

export const EditorSidebar: FC<{
  open: boolean;
  onToggle: () => void;
  onReset: () => void;
  yamlRaw: string;
  onYamlChange: (raw: string) => void;
  yamlError: string | null;
  fields: FieldDef[];
  editorRef: MutableRefObject<{ focus: () => void } | null>;
  fullYamlRaw: string;
  onFullYamlChange: (raw: string) => void;
  fullYamlError: string | null;
}> = ({
  open,
  onToggle,
  onReset,
  yamlRaw,
  onYamlChange,
  yamlError,
  fields,
  editorRef,
  fullYamlRaw,
  onFullYamlChange,
  fullYamlError,
}) => {
  const [tab, setTab] = useState<EditorTab>('editor');

  return (
    <div className='flex min-h-0'>
      <EditorToggle open={open} onClick={onToggle} />
      <div
        className={`h-full min-h-0 overflow-hidden transition-all duration-300 ${
          open ? 'w-96' : 'w-0'
        }`}>
        <div className='border-base-300/20 bg-base-200 flex h-full w-96 flex-shrink-0 flex-col border-l'>
          <EditorTabBar tab={tab} onChange={setTab} />

          <div className='min-h-0 flex-1 overflow-y-auto p-4'>
            {tab === 'editor' ? (
              <SingleYamlPanel
                yamlRaw={yamlRaw}
                onYamlChange={onYamlChange}
                yamlError={yamlError}
                fields={fields}
                editorRef={editorRef}
                onReset={onReset}
              />
            ) : (
              <FullYamlPanel
                fullYamlRaw={fullYamlRaw}
                onFullYamlChange={onFullYamlChange}
                fullYamlError={fullYamlError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EditorSidebar.displayName = 'EditorSidebar';
