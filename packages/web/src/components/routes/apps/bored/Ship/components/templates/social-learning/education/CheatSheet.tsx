import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface Item {
  label: string;
  content: string;
}

export const CheatSheet: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Cheat Sheet';
  const subject = (data.subject as string) ?? 'JavaScript';
  const items = (data.items as Item[]) ?? [
    { label: 'Variable', content: 'let x = value' },
    { label: 'Constant', content: 'const x = value' },
    { label: 'Function', content: 'const fn = () => {}' },
    { label: 'Array Map', content: 'arr.map(x => x)' },
    { label: 'Fetch', content: 'await fetch(url)' },
    { label: 'Class', content: 'class Foo extends Bar {}' },
  ];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <Header title={title} subtitle={subject} />
        <ul className='flex flex-1 flex-col gap-2'>
          {items.map((item, i) => (
            <li key={i} className='border-base-300 flex items-stretch gap-2 rounded-2xl border'>
              <div className='bg-primary flex w-24 shrink-0 items-center justify-center rounded-l-2xl text-sm font-bold text-white'>
                {item.label}
              </div>
              <div className='text-base-content flex flex-1 items-center px-2 font-mono text-sm'>
                {item.content}
              </div>
            </li>
          ))}
        </ul>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

CheatSheet.displayName = 'CheatSheet';
