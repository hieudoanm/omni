export type AnnotationTool = 'laser' | 'pen' | 'highlighter' | 'eraser';

export interface AnnotPoint {
  x: number;
  y: number;
}

export interface AnnotationStroke {
  id: string;
  tool: 'pen' | 'highlighter';
  color: string;
  width: number;
  points: AnnotPoint[];
}

export const TOOL_WIDTH: Record<AnnotationTool, number> = {
  laser: 3,
  pen: 3,
  highlighter: 18,
  eraser: 30,
};

export const dist = (a: AnnotPoint, b: AnnotPoint): number => Math.hypot(a.x - b.x, a.y - b.y);

export const strokeNear = (
  stroke: AnnotationStroke,
  point: AnnotPoint,
  tolerance: number,
): boolean => stroke.points.some((p) => dist(p, point) <= tolerance);

export const strokesNear = (
  strokes: AnnotationStroke[],
  point: AnnotPoint,
  tolerance: number,
): AnnotationStroke[] => strokes.filter((s) => strokeNear(s, point, tolerance));

export const removeStrokesNear = (
  strokes: AnnotationStroke[],
  point: AnnotPoint,
  tolerance: number,
): AnnotationStroke[] => strokes.filter((s) => !strokeNear(s, point, tolerance));

export const reducePoints = (points: AnnotPoint[], tolerance = 2): AnnotPoint[] => {
  if (points.length < 3) return points;
  const out: AnnotPoint[] = [points[0]];
  for (const p of points) {
    if (dist(p, out[out.length - 1]) >= tolerance) out.push(p);
  }
  if (dist(out[out.length - 1], points[points.length - 1]) > 0) {
    out.push(points[points.length - 1]);
  }
  return out;
};

export const strokePath = (stroke: AnnotationStroke): string =>
  stroke.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
