import type { FC } from 'react';
import type { TemplateProps } from '../../common';
import { Background, Footer } from '../../_shared';

interface Node {
  name: string;
  version?: string;
}

interface Edge {
  from: string;
  to: string;
}

export const DependencyGraph: FC<TemplateProps> = ({ data }) => {
  const title = (data.title as string) ?? 'Dependencies';
  const nodes = (data.nodes as Node[]) ?? [];
  const edges = (data.edges as Edge[]) ?? [];

  const nW = 100;
  const nH = 36;
  const gap = 500 / (nodes.length + 1);
  const pos = new Map(
    nodes.map((n, i) => [n.name, { x: gap * (i + 1) - nW / 2, y: i % 2 === 0 ? 60 : 150 }]),
  );

  const citation = (data.citation as string) ?? '';
  return (
    <Background>
      <div className='mb-1 text-center'>
        <h2 className='text-accent text-[10px] font-bold tracking-[0.2em] uppercase'>
          Dependency Graph
        </h2>
        {title && <h3 className='text-base-content mt-1 text-sm font-bold'>{title}</h3>}
      </div>
      <svg className='flex-1' viewBox='0 0 500 220'>
        <defs>
          <marker id='arrow' markerWidth='8' markerHeight='6' refX='8' refY='3' orient='auto'>
            <path d='M0,0 L8,3 L0,6' fill='none' stroke='oklch(var(--n)/0.5)' strokeWidth='1' />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const f = pos.get(e.from);
          const t = pos.get(e.to);
          return f && t ? (
            <line
              key={i}
              x1={f.x + nW / 2}
              y1={f.y + nH}
              x2={t.x + nW / 2}
              y2={t.y}
              stroke='oklch(var(--n)/0.3)'
              strokeWidth='1.5'
              markerEnd='url(#arrow)'
            />
          ) : null;
        })}
        {nodes.map((node) => {
          const p = pos.get(node.name);
          return p ? (
            <g key={node.name}>
              <rect
                x={p.x}
                y={p.y}
                width={nW}
                height={nH}
                rx='6'
                className='fill-base-200 stroke-base-300'
                strokeWidth='1.5'
              />
              <text
                x={p.x + nW / 2}
                y={p.y + 14}
                textAnchor='middle'
                className='fill-base-content text-[10px] font-bold'>
                {node.name}
              </text>
              {node.version && (
                <text
                  x={p.x + nW / 2}
                  y={p.y + 27}
                  textAnchor='middle'
                  className='fill-neutral text-[8px]'>
                  {node.version}
                </text>
              )}
            </g>
          ) : null;
        })}
      </svg>
      <Footer citation={citation} />
    </Background>
  );
};

DependencyGraph.displayName = 'DependencyGraph';
