import type { FC } from 'react';

import { YamlEditor } from './YamlEditor';

export const FullYamlPanel: FC<{
  fullYamlRaw: string;
  onFullYamlChange: (raw: string) => void;
  fullYamlError: string | null;
}> = ({ fullYamlRaw, onFullYamlChange, fullYamlError }) => (
  <div>
    <div className='mb-4 flex items-center justify-between'>
      <h2 className='text-neutral text-xs font-semibold tracking-widest uppercase'>
        All Posts (YAML)
      </h2>
      <div className='flex gap-1'>
        <button
          onClick={() => {
            const blob = new Blob([fullYamlRaw], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'posts.yaml';
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
          }}
          className='btn btn-ghost btn-xs rounded-box'
          title='Download full YAML file'>
          Download
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(fullYamlRaw)}
          className='btn btn-ghost btn-xs rounded-box'
          title='Copy full YAML'>
          Copy
        </button>
        <button
          onClick={async () => {
            try {
              const text = await navigator.clipboard.readText();
              onFullYamlChange(text);
            } catch {
              // clipboard read not supported
            }
          }}
          className='btn btn-ghost btn-xs rounded-box'
          title='Paste from clipboard'>
          Paste
        </button>
      </div>
    </div>
    <YamlEditor value={fullYamlRaw} onChange={onFullYamlChange} error={fullYamlError} />
  </div>
);
