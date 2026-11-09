'use client';

import { useCallback, useEffect, useRef, type FC } from 'react';
import {
  TOOL_WIDTH,
  removeStrokesNear,
  type AnnotationStroke,
  type AnnotationTool,
  type AnnotPoint,
} from '@/lib/office/keynotes/annotations';
import { generateId } from '@/lib/office/keynotes/id';

const LASER_COLOR = '#ff453a';

const drawStroke = (ctx: CanvasRenderingContext2D, stroke: AnnotationStroke, scale: number) => {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x * scale, stroke.points[0].y * scale);
  for (const p of stroke.points.slice(1)) ctx.lineTo(p.x * scale, p.y * scale);
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (stroke.tool === 'highlighter') ctx.globalAlpha = 0.35;
  ctx.stroke();
  ctx.restore();
};

export const AnnotationOverlay: FC<{
  width: number;
  height: number;
  scale: number;
  tool: AnnotationTool | 'off';
  color: string;
  clearNonce: number;
}> = ({ width, height, scale, tool, color, clearNonce }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<AnnotationStroke[]>([]);
  const drawingRef = useRef<AnnotationStroke | null>(null);
  const laserRef = useRef<AnnotPoint[]>([]);
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const laserTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  toolRef.current = tool;
  colorRef.current = color;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of strokesRef.current) drawStroke(ctx, s, 1);
    if (toolRef.current === 'laser' && laserRef.current.length >= 2) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(laserRef.current[0].x, laserRef.current[0].y);
      for (const p of laserRef.current.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = LASER_COLOR;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
      const head = laserRef.current[laserRef.current.length - 1];
      ctx.beginPath();
      ctx.arc(head.x, head.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = LASER_COLOR;
      ctx.fill();
      ctx.restore();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
    draw();
  }, [scale, draw]);

  useEffect(() => {
    strokesRef.current = [];
    drawingRef.current = null;
    laserRef.current = [];
    draw();
  }, [clearNonce, draw]);

  const clearLaser = useCallback(() => {
    laserRef.current = [];
    draw();
  }, [draw]);

  const toSlide = (e: React.PointerEvent): AnnotPoint => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (tool === 'off' || tool === 'laser') return;
    e.preventDefault();
    const p = toSlide(e);
    if (tool === 'eraser') {
      strokesRef.current = removeStrokesNear(strokesRef.current, p, TOOL_WIDTH.eraser);
      draw();
      return;
    }
    drawingRef.current = {
      id: generateId('an'),
      tool,
      color: colorRef.current,
      width: TOOL_WIDTH[tool],
      points: [p],
    };
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons === 0 && tool !== 'laser' && drawingRef.current === null) return;
    const p = toSlide(e);
    if (drawingRef.current) {
      const last = drawingRef.current.points[drawingRef.current.points.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
      drawingRef.current = {
        ...drawingRef.current,
        points: [...drawingRef.current.points, p],
      };
      draw();
      return;
    }
    if (tool === 'eraser') {
      strokesRef.current = removeStrokesNear(strokesRef.current, p, TOOL_WIDTH.eraser);
      draw();
      return;
    }
    if (tool === 'laser') {
      laserRef.current = [...laserRef.current, p].slice(-16);
      draw();
      if (laserTimerRef.current) clearTimeout(laserTimerRef.current);
      laserTimerRef.current = setTimeout(clearLaser, 250);
    }
  };

  const onPointerUp = () => {
    if (drawingRef.current) {
      strokesRef.current = [...strokesRef.current, drawingRef.current];
      drawingRef.current = null;
    }
    draw();
  };

  const cursor = tool === 'off' ? undefined : tool === 'eraser' ? 'cell' : 'crosshair';

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className='absolute inset-0 z-20'
      style={{
        width: width * scale,
        height: height * scale,
        touchAction: 'none',
        cursor,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    />
  );
};
