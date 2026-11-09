import type { FC, MutableRefObject } from 'react';

import type { FieldDef } from '../../types';
import { YamlEditor } from './YamlEditor';

export const SingleYamlPanel: FC<{
  yamlRaw: string;
  onYamlChange: (raw: string) => void;
  yamlError: string | null;
  fields: FieldDef[];
  editorRef: MutableRefObject<{ focus: () => void } | null>;
  onReset: () => void;
}> = ({ yamlRaw, onYamlChange, yamlError, fields, editorRef, onReset }) => (
  <>
    <div className='mb-4 flex items-center justify-between'>
      <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>
        Post Item (YAML)
      </h2>
      <button
        onClick={onReset}
        className='btn btn-ghost btn-xs rounded-box'
        title='Reset to defaults'>
        Reset
      </button>
    </div>
    <YamlEditor
      ref={editorRef}
      value={yamlRaw}
      onChange={onYamlChange}
      error={yamlError}
      fields={fields}
    />
  </>
);
