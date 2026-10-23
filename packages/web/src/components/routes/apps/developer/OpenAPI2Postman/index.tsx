import { FC, useCallback, useEffect, useState } from 'react';

import { SAMPLE_OPENAPI, lineCount } from './constants';
import { parseOpenAPI } from './utils/yamlParser';
import { convertToPostman } from './utils/converter';

export const OpenAPI2Postman: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [input, setInput] = useState<string>(SAMPLE_OPENAPI);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'openapi' | 'postman'>('openapi');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    const timer = setTimeout(() => {
      try {
        const spec = parseOpenAPI(input.trim());
        const collection = convertToPostman(spec);
        setOutput(JSON.stringify(collection, null, 2));
        setError('');
      } catch (e) {
        setError((e as Error).message || 'Conversion failed');
        setOutput('');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const copyOutput = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'postman-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const clearInput = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <>
      <button className='btn btn-ghost btn-xs text-base-content/50' onClick={clearInput}>
        🗑️ Clear
      </button>

      <div className='border-base-300 flex w-full self-center border-b sm:w-auto'>
        <button
          className={`border-b-2 px-3 py-2 font-mono text-[10px] tracking-wider uppercase transition-colors ${
            activeTab === 'openapi'
              ? 'border-primary text-primary'
              : 'text-base-content/40 border-transparent'
          }`}
          onClick={() => setActiveTab('openapi')}>
          OpenAPI Input
        </button>
        <button
          className={`border-b-2 px-3 py-2 font-mono text-[10px] tracking-wider uppercase transition-colors ${
            activeTab === 'postman'
              ? 'border-primary text-primary'
              : 'text-base-content/40 border-transparent'
          }`}
          onClick={() => setActiveTab('postman')}>
          Postman Output
        </button>
      </div>

      <div className='flex min-h-0 grow overflow-hidden'>
        {activeTab === 'openapi' && (
          <div className='bg-base-200 border-base-300 flex w-full flex-col rounded-xl border'>
            <div className='border-base-300 flex shrink-0 items-center justify-between border-b px-4 py-2'>
              <div className='flex items-center gap-2'>
                <span className='badge badge-outline badge-sm text-primary border-primary/30 font-mono text-[10px] tracking-wider uppercase'>
                  OpenAPI
                </span>
                <span className='text-base-content/40 font-mono text-[10px] tracking-wider uppercase'>
                  JSON/YAML
                </span>
              </div>
              <span className='text-base-content/30 font-mono text-[10px] tracking-wider uppercase'>
                {lineCount(input)} lines
              </span>
            </div>
            <div className='relative flex min-h-0 flex-1 flex-col'>
              <textarea
                className='textarea bg-base-100 text-base-content w-full flex-1 resize-none rounded-none rounded-b-xl border-0 p-4 font-mono text-xs leading-relaxed focus:outline-none'
                placeholder='Paste your OpenAPI 3.x spec here (JSON or YAML)...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {activeTab === 'postman' && (
          <div className='bg-base-200 border-base-300 flex w-full flex-col rounded-xl border'>
            <div className='border-base-300 flex shrink-0 items-center justify-between border-b px-4 py-2'>
              <div className='flex items-center gap-2'>
                <span className='badge badge-outline badge-sm text-base-content/60 border-base-content/30 font-mono text-[10px] tracking-wider uppercase'>
                  Postman
                </span>
                <span className='text-base-content/40 font-mono text-[10px] tracking-wider uppercase'>
                  Collection v2.1
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {output && (
                  <>
                    <span className='text-base-content/30 font-mono text-[10px] tracking-wider uppercase'>
                      {lineCount(output)} lines
                    </span>
                    <button
                      className='btn btn-ghost btn-xs gap-1 font-mono text-[10px] uppercase'
                      onClick={copyOutput}>
                      {copied ? '✅ Copied' : '📋 Copy'}
                    </button>
                    <button
                      className='btn btn-ghost btn-xs gap-1 font-mono text-[10px] uppercase'
                      onClick={downloadOutput}>
                      💾 Download
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='relative min-h-0 flex-1'>
              {error && (
                <div className='alert alert-error m-4 rounded-lg text-sm'>
                  <span>⚠️ {error}</span>
                </div>
              )}
              {!output && !error && (
                <div className='text-base-content/25 flex h-full flex-col items-center justify-center gap-3'>
                  <span className='text-5xl'>📄</span>
                  <p className='text-sm'>Start typing to generate your Postman collection</p>
                </div>
              )}
              {output && (
                <textarea
                  readOnly
                  className='textarea bg-base-100 text-base-content h-full w-full resize-none rounded-none rounded-b-xl border-0 p-4 font-mono text-xs leading-relaxed focus:outline-none'
                  value={output}
                  spellCheck={false}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
OpenAPI2Postman.displayName = 'OpenAPI2Postman';
