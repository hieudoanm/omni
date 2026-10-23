'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { TbHierarchy2, TbX } from 'react-icons/tb';
import { buildGraph } from '@/lib/office/md/wikilinks';
import type { Note, SimLink, SimNode } from '@/lib/office/md/types';

const NODE_RADIUS = 6;
const HIT_RADIUS = 12;

interface GraphViewProps {
  notes: Note[];
  onSelectNote: (id: string) => void;
  onClose: () => void;
}

export const GraphView: FC<GraphViewProps> = ({ notes, onSelectNote, onClose }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const data = useMemo(() => buildGraph(notes), [notes]);
  const byId = useMemo(() => new Map(notes.map((n) => [n.id, n])), [notes]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = (): void => {
      const rect = wrap.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes: SimNode[] = data.nodes.map((node) => ({
      ...node,
      x: size.width / 2 + (Math.random() - 0.5) * 40,
      y: size.height / 2 + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
    }));
    const links: SimLink[] = data.links.map((link) => ({ ...link }));
    simNodesRef.current = nodes;

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links)
          .id((node) => node.id)
          .distance(70)
          .strength(0.5),
      )
      .force('charge', forceManyBody().strength(-180))
      .force('center', forceCenter(size.width / 2, size.height / 2))
      .force('collide', forceCollide<SimNode>(NODE_RADIUS * 2.2))
      .stop();

    for (let i = 0; i < 100; i += 1) simulation.tick();

    const dpr = window.devicePixelRatio || 1;
    const draw = (): void => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      for (const link of links) {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }

      for (const node of nodes) {
        const hovered = node.id === hoverIdRef.current;
        ctx.beginPath();
        ctx.arc(node.x, node.y, hovered ? NODE_RADIUS + 3 : NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? '#8b5cf6' : '#6366f1';
        ctx.fill();
      }
    };

    let raf = 0;
    const loop = (): void => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      simulation.stop();
    };
  }, [data, size]);

  const hitTest = (event: React.MouseEvent<HTMLCanvasElement>): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let best: SimNode | null = null;
    let bestDist = HIT_RADIUS;
    for (const node of simNodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist <= bestDist) {
        bestDist = dist;
        best = node;
      }
    }
    return best?.id ?? null;
  };

  const handleMove = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const id = hitTest(event);
    hoverIdRef.current = id;
    setHoveredId(id);
  };

  const handleLeave = (): void => {
    hoverIdRef.current = null;
    setHoveredId(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>): void => {
    const id = hitTest(event);
    if (id) onSelectNote(id);
  };

  const hoveredNote = hoveredId ? byId.get(hoveredId) : null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
      <div className='card bg-base-200 flex h-[90vh] w-full max-w-4xl flex-col shadow-2xl'>
        <div className='border-base-content/10 flex items-center justify-between border-b p-3'>
          <div className='flex items-center gap-2'>
            <TbHierarchy2 size={18} className='text-primary' />
            <h2 className='text-lg'>Graph</h2>
            <span className='text-base-content/50 text-xs'>
              {data.nodes.length} notes · {data.links.length} links · {data.dangling} dangling
            </span>
          </div>
          <button className='btn btn-ghost btn-sm' onClick={onClose} aria-label='Close graph'>
            <TbX size={16} />
          </button>
        </div>

        <div ref={wrapRef} className='relative min-h-0 flex-1'>
          <canvas
            ref={canvasRef}
            className='cursor-pointer'
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onClick={handleClick}
            aria-label='Notes graph'
          />
          {hoveredNote && (
            <div className='bg-base-100 pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg px-3 py-1.5 text-sm shadow-lg'>
              <span className='text-primary'>{hoveredNote.title}</span>
              <span className='text-base-content/50 ml-2 text-xs'>click to open</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
