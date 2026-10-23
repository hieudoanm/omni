import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import yaml from 'yaml';

import { LandingPage } from './components/LandingPage';
import { SlidePreview } from './components/SlidePreview';
import { YamlEditor } from './components/YamlEditor';
import { INITIAL_CONTENT } from './constants';
import { ToastUI, useToast } from './hooks/useToast';
import { PitchDeck } from './types';
import { exportPdf } from './utils/exportPdf';
import { ValidationError } from './types';
import { mapYamlToSlides, validate } from './utils/yaml';

export const Slides: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { toasts, show, dismiss } = useToast();

  const getInitialInput = () => {
    if (typeof window === 'undefined') return INITIAL_CONTENT;
    return new URLSearchParams(location.search).get('yaml') ?? INITIAL_CONTENT;
  };

  const [input, setInput] = useState(getInitialInput);
  const [showInput, setShowInput] = useState(true);
  const [tab, setTab] = useState<'pitch' | 'landing'>('pitch');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const encoded = encodeURIComponent(input);
    if (encoded.length > 4000) return;
    const url = `${location.pathname}?yaml=${encoded}`;
    window.history.replaceState(null, '', url);
  }, [input]);

  const parsed = useMemo(() => {
    try {
      const result = yaml.parse(input) as PitchDeck;
      return { data: result, errors: validate(result) };
    } catch {
      return {
        data: null,
        errors: [{ path: '', message: 'Invalid YAML' }] as ValidationError[],
      };
    }
  }, [input]);

  const slides = useMemo(() => (parsed.data ? mapYamlToSlides(parsed.data) : []), [parsed.data]);

  const handleExportPdf = useCallback(async () => {
    if (!parsed.data || parsed.errors.length > 0) {
      show('error', 'Fix YAML errors before exporting');
      return;
    }
    try {
      await exportPdf(
        parsed.data,
        (msg) => show('loading', msg),
        (msg) => show('error', msg),
        (msg) => show('success', msg),
      );
    } catch {
      show('error', 'PDF export failed');
    }
  }, [parsed.data, parsed.errors, show]);

  const shareURL = () => {
    const encoded = encodeURIComponent(input);
    if (encoded.length > 4000) {
      show('error', 'Shareable link is too long to copy (max 4000 chars)');
      return;
    }
    const url = `${location.origin}${location.pathname}?yaml=${encoded}`;
    navigator.clipboard.writeText(url);
    show('success', 'Shareable link copied');
  };

  const isNotExportable = !parsed.data || parsed.errors.length > 0;
  const isSharable = encodeURIComponent(input).length <= 4000;

  return (
    <>
      <ToastUI toasts={toasts} onDismiss={dismiss} />
      <div className='divide-base-300 flex min-h-0 flex-1 divide-x overflow-hidden'>
        <div className='flex flex-col items-center gap-2 p-2'>
          <div
            className='tooltip tooltip-right'
            data-tip={showInput ? 'Hide Editor' : 'Show Editor'}>
            <button
              className={`btn btn-xs rounded ${showInput ? 'btn-accent' : 'bg-base-300'}`}
              onClick={() => setShowInput((v) => !v)}>
              📝
            </button>
          </div>
          <div className='tooltip tooltip-right' data-tip='Export PDF'>
            <button
              className='btn btn-xs btn-primary rounded'
              disabled={isNotExportable}
              onClick={handleExportPdf}>
              📄
            </button>
          </div>
          <div className='tooltip tooltip-right' data-tip='Copy Shareable Link'>
            <button
              className='btn btn-xs btn-secondary rounded'
              disabled={!isSharable}
              onClick={shareURL}>
              🔗
            </button>
          </div>
        </div>

        {showInput && (
          <div className='flex min-w-0 flex-1 overflow-hidden'>
            <div className='bg-base-100 border-base-300 h-full w-full overflow-auto border-r'>
              <YamlEditor value={input} onChange={setInput} />
            </div>
          </div>
        )}

        <div
          className={`flex min-w-0 flex-1 flex-col overflow-hidden ${showInput ? '' : 'flex-1'}`}>
          <div className='flex h-full flex-col overflow-auto p-4'>
            {!parsed.data && parsed.errors.length > 0 && (
              <div className='alert alert-error mb-4'>Invalid YAML</div>
            )}

            {parsed && (
              <>
                {parsed.errors.length > 0 && (
                  <div className='alert alert-error mb-4'>
                    <ul className='list-disc space-y-1 pl-4 text-sm'>
                      {parsed.errors.map((e, i) => (
                        <li key={i}>
                          <strong>{e.path || 'YAML'}:</strong> {e.message}
                          {e.hint && <span className='opacity-70'> — {e.hint}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className='tabs tabs-box mb-4 w-full'>
                  <button
                    className={`tab w-1/2 rounded ${tab === 'pitch' ? 'tab-active' : ''}`}
                    onClick={() => setTab('pitch')}>
                    Pitch Deck
                  </button>
                  <button
                    className={`tab w-1/2 rounded ${tab === 'landing' ? 'tab-active' : ''}`}
                    onClick={() => setTab('landing')}>
                    Landing Page
                  </button>
                </div>

                {tab === 'pitch' && (
                  <div id='pitch-preview' className='flex flex-col gap-8'>
                    {slides.map((slide, i) => (
                      <SlidePreview key={slide.kicker ?? i} index={i} slide={slide} />
                    ))}
                  </div>
                )}

                {tab === 'landing' && parsed.data && (
                  <div className='border-primary-content overflow-hidden rounded border shadow-2xl'>
                    <LandingPage data={parsed.data} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
Slides.displayName = 'Slides';
