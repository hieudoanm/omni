import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer, Header } from '../../_shared';

interface TreeItem {
  name: string;
  depth: number;
  isFolder: boolean;
  isLast: boolean;
}

const buildTree = (lines: string[]): TreeItem[] => {
  const items: TreeItem[] = [];
  const depths: number[] = [];

  for (const line of lines) {
    const name = line.trimStart();
    const leading = line.length - name.length;
    const depth = Math.round(leading / 2);
    const isFolder = name.endsWith('/');

    if (depths[depth] !== undefined) {
      items[depths[depth]].isLast = false;
    }
    depths[depth] = items.length;
    for (let d = depth + 1; d < depths.length; d++) {
      depths[d] = undefined as unknown as number;
    }

    items.push({ name, depth, isFolder, isLast: true });
  }

  return items;
};

const getParentLast = (items: TreeItem[], i: number, depth: number): boolean => {
  for (let j = i; j >= 0; j--) {
    if (items[j].depth === depth) return items[j].isLast;
  }
  return true;
};

const TreePrefix: FC<{ item: TreeItem; items: TreeItem[]; i: number }> = ({ item, items, i }) => {
  const parts: string[] = [];

  for (let d = 0; d < item.depth; d++) {
    parts.push(getParentLast(items, i, d) ? '   ' : '\u2502  ');
  }

  const dashCount = item.depth + 2;
  const connector = (item.isLast ? '\u2514' : '\u251C') + '\u2500'.repeat(dashCount) + ' ';

  return (
    <span className='text-base-content/30 shrink-0'>
      {parts.join('')}
      {connector}
    </span>
  );
};

export const FileTree: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? '';
  const subtitle = (data.subtitle as string) ?? '';
  const tree = (data.tree as string) ?? '';

  const lines = tree.split('\n').filter(Boolean);
  const items = buildTree(lines);

  const citation = (data.citation as string) ?? '';

  return (
    <Background>
      <div className='flex w-full flex-col gap-2'>
        <Header title={title} subtitle={subtitle} />
      </div>
      <div className='border-base-300 mt-3 flex w-full flex-1 flex-col overflow-hidden rounded-2xl border shadow-lg'>
        <div className='border-base-300 bg-base-200 text-base-content/50 flex items-center gap-2 border-b px-3 py-1.5 text-xs font-semibold tracking-wider uppercase'>
          Explorer
        </div>
        <div className='bg-base-100 flex-1 overflow-auto px-3 py-2 font-mono text-xs leading-relaxed'>
          <ul>
            {items.map((item, i) => (
              <li key={i} className='flex items-center truncate leading-relaxed'>
                <TreePrefix item={item} items={items} i={i} />
                <span
                  className={
                    item.isFolder ? 'text-base-content/80 font-semibold' : 'text-base-content/60'
                  }>
                  {item.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer citation={citation} />
    </Background>
  );
};

FileTree.displayName = 'FileTree';
