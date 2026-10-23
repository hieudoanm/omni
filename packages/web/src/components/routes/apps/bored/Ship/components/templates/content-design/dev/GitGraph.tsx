import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Commit {
  id: string;
  message: string;
  merge?: boolean;
}

interface Branch {
  name: string;
  commits: Commit[];
}

const BRANCH_COLORS = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-error'];

export const GitGraph: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const branches = (data.branches as Branch[]) ?? [];

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='flex flex-col gap-y-4'>
        <div className='mb-2 text-center'>
          <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>
            Git Graph
          </h2>
          {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          {branches.map((branch, bi) => (
            <div key={bi}>
              <div className='text-neutral mb-1 text-[9px] font-bold tracking-wider uppercase'>
                {branch.name}
              </div>
              {branch.commits.map((commit, ci) => (
                <div key={ci} className='flex items-center gap-2 py-0.5'>
                  <div
                    className={`${BRANCH_COLORS[bi % BRANCH_COLORS.length]} h-2.5 w-2.5 rounded-full`}
                  />
                  {ci < branch.commits.length - 1 && (
                    <div
                      className={`${BRANCH_COLORS[bi % BRANCH_COLORS.length]} ml-[4px] h-3 w-px opacity-40`}
                    />
                  )}
                  <span className='text-neutral font-mono text-[9px]'>{commit.id.slice(0, 7)}</span>
                  <span className='text-base-content text-[10px]'>{commit.message}</span>
                  {commit.merge && (
                    <span className='bg-accent/10 text-accent rounded px-1.5 py-0.5 text-[8px] font-bold'>
                      merge
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <Footer citation={citation} />
      </div>
    </Background>
  );
};

GitGraph.displayName = 'GitGraph';
