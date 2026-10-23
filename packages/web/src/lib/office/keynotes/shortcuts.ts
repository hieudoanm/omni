export interface ShortcutEvent {
  key: string;
  shiftKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

export type ShortcutCommand =
  | 'undo'
  | 'redo'
  | 'selectAll'
  | 'duplicate'
  | 'group'
  | 'ungroup'
  | 'delete'
  | 'escape'
  | 'save'
  | 'lock'
  | 'cycleNext'
  | 'cyclePrev'
  | 'nudgeLeft'
  | 'nudgeRight'
  | 'nudgeUp'
  | 'nudgeDown'
  | 'nudgeLeftBig'
  | 'nudgeRightBig'
  | 'nudgeUpBig'
  | 'nudgeDownBig'
  | null;

const mod = (e: ShortcutEvent): boolean => e.metaKey || e.ctrlKey;

export const matchShortcut = (e: ShortcutEvent): ShortcutCommand => {
  const key = e.key.toLowerCase();

  if (mod(e) && key === 'z') return e.shiftKey ? 'redo' : 'undo';
  if (mod(e) && key === 'y') return 'redo';
  if (mod(e) && key === 's') return 'save';
  if (mod(e) && key === 'a') return 'selectAll';
  if (mod(e) && key === 'd') return 'duplicate';
  if (mod(e) && key === 'g') return e.shiftKey ? 'ungroup' : 'group';
  if (mod(e) && key === 'l') return 'lock';

  if (e.key === 'Delete' || e.key === 'Backspace') return 'delete';
  if (e.key === 'Escape') return 'escape';
  if (e.key === 'Tab') return e.shiftKey ? 'cyclePrev' : 'cycleNext';

  if (e.key === 'ArrowLeft') return e.shiftKey ? 'nudgeLeftBig' : 'nudgeLeft';
  if (e.key === 'ArrowRight') return e.shiftKey ? 'nudgeRightBig' : 'nudgeRight';
  if (e.key === 'ArrowUp') return e.shiftKey ? 'nudgeUpBig' : 'nudgeUp';
  if (e.key === 'ArrowDown') return e.shiftKey ? 'nudgeDownBig' : 'nudgeDown';

  return null;
};
