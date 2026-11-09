import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

export const Terminal: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const command = (data.command as string) ?? '';
  const output = (data.output as string) ?? '';
  const syntax = (data.syntax as string) ?? '';

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className='flex w-full flex-col overflow-hidden rounded-lg border border-[#30363d] shadow-2xl'>
        <div className='flex items-center gap-1.5 border-b border-[#30363d] bg-[#161b22] px-3 py-2'>
          <div className='h-2.5 w-2.5 rounded-full bg-[#ff5555]' />
          <div className='h-2.5 w-2.5 rounded-full bg-[#ffb347]' />
          <div className='h-2.5 w-2.5 rounded-full bg-[#50c878]' />
          <div className='ml-2 text-xs font-semibold tracking-wider text-[#8b949e]'>terminal</div>
        </div>
        <div className='flex flex-col gap-2 bg-[#0d1117] px-4 py-4 font-mono text-xs leading-relaxed'>
          <div className='text-left'>
            <span className='text-[#50c878]'>$ </span>
            <span className='text-[#c9d1d9]'>{command}</span>
          </div>
          {output && (
            <div className='text-left text-[#8b949e]'>
              <span className='text-[#79c0ff]'>&gt; </span>
              {output}
            </div>
          )}
          {syntax && (
            <pre className='mt-1 text-left whitespace-pre-wrap text-[#c9d1d9]'>{syntax}</pre>
          )}
          <div className='mt-1 h-4 w-2 animate-pulse bg-[#c9d1d9]' />
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

Terminal.displayName = 'Terminal';
