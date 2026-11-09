import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Code: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const code = (data.code as string) ?? '';
  const language = (data.language as string) ?? '';

  const codeLines = code.split('\n');

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className='mt-3 flex w-full flex-1 flex-col overflow-hidden rounded-2xl border border-[#30363d] shadow-lg'>
        <div className='flex items-center justify-between bg-[#161b22] px-3 py-1.5'>
          <div className='flex gap-1.5'>
            <div className='h-2 w-2 rounded-full bg-[#ff5555]' />
            <div className='h-2 w-2 rounded-full bg-[#ffb347]' />
            <div className='h-2 w-2 rounded-full bg-[#50c878]' />
          </div>
          {language && (
            <span className='text-xs font-semibold tracking-wider text-[#8b949e]'>{language}</span>
          )}
        </div>
        <div className='flex-1 overflow-auto bg-[#0d1117] px-0 py-2 font-mono text-xs leading-relaxed'>
          <ol>
            {codeLines.map((line, i) => (
              <li key={i} className='flex hover:bg-[#161b22]'>
                <span className='flex w-7 shrink-0 items-start justify-end pr-2 text-[#8b949e] select-none'>
                  {i + 1}
                </span>
                <span className='whitespace-pre text-[#c9d1d9]'>{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Code.displayName = 'Code';
