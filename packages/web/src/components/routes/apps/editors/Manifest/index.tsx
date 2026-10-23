import { manifest as pwaManifest } from '@/components/routes/apps/editors/data/manifest/pwa';
import { manifest as extensionManifest } from '@/components/routes/apps/editors/data/manifest/extension';
import { FC, useState } from 'react';

import { ManifestType } from './utils';

export const Manifest: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [type, setType] = useState<ManifestType>('pwa');
  const [manifests, setManifests] = useState({
    pwa: JSON.stringify(pwaManifest, null, 2),
    extension: JSON.stringify(extensionManifest, null, 2),
  });
  const [copied, setCopied] = useState(false);

  const manifest = manifests[type];

  const setManifest = (value: string) => setManifests((prev) => ({ ...prev, [type]: value }));

  const copy = async () => {
    await navigator.clipboard.writeText(manifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () =>
    setManifests((prev) => ({
      ...prev,
      [type]:
        type === 'pwa'
          ? JSON.stringify(pwaManifest, null, 2)
          : JSON.stringify(extensionManifest, null, 2),
    }));

  const lines = manifest.split('\n').length;
  const bytes = new Blob([manifest]).size;

  return (
    <>
      {/* Type tabs */}
      <div className='border-base-300 flex items-center border-b px-4 py-3'>
        <div className='flex gap-0'>
          {(['pwa', 'extension'] as ManifestType[]).map((t) => (
            <button
              key={t}
              className={`border-b-2 px-3 py-1 text-xs uppercase transition-colors ${
                type === t
                  ? 'border-primary text-primary'
                  : 'text-base-content/40 border-transparent'
              }`}
              onClick={() => {
                setType(t);
                setCopied(false);
              }}>
              {t === 'pwa' ? '📱 PWA' : '🧩 Extension'}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className='flex min-h-0 flex-1 overflow-hidden'>
        {/* Line numbers */}
        <div className='border-base-300 bg-base-200 text-base-content/30 w-10 shrink-0 overflow-hidden border-r py-3 text-right font-mono text-[10px] leading-relaxed select-none'>
          {manifest.split('\n').map((_, i) => (
            <div key={i} className='px-2'>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          className='text-base-content/80 flex-1 resize-none bg-transparent p-3 font-mono text-[11px] leading-relaxed outline-none'
          value={manifest}
          onChange={(e) => setManifest(e.target.value)}
          spellCheck={false}
          autoCorrect='off'
          autoCapitalize='off'
        />
      </div>

      {/* Footer */}
      <div className='border-base-300 flex items-center justify-between border-t px-4 py-2'>
        <span className='text-base-content/30 font-mono text-[10px]'>
          {lines} lines · {bytes} bytes
        </span>
        <div className='flex gap-2'>
          <button className='btn btn-ghost btn-xs' onClick={reset}>
            Reset
          </button>
          <button className={`btn btn-xs ${copied ? 'btn-success' : 'btn-primary'}`} onClick={copy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </>
  );
};
Manifest.displayName = 'Manifest';
