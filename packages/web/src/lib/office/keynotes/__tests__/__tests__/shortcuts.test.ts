import { matchShortcut, type ShortcutEvent } from '@/lib/office/keynotes/shortcuts';

const evt = (partial: Partial<ShortcutEvent>): ShortcutEvent => ({
  key: 'a',
  shiftKey: false,
  metaKey: false,
  ctrlKey: false,
  ...partial,
});

describe('matchShortcut', () => {
  it('maps undo / redo via Cmd+Z / Cmd+Shift+Z / Cmd+Y', () => {
    expect(matchShortcut(evt({ key: 'z', metaKey: true }))).toBe('undo');
    expect(matchShortcut(evt({ key: 'z', metaKey: true, shiftKey: true }))).toBe('redo');
    expect(matchShortcut(evt({ key: 'y', ctrlKey: true }))).toBe('redo');
  });

  it('maps save, select all, duplicate, group and lock', () => {
    expect(matchShortcut(evt({ key: 's', metaKey: true }))).toBe('save');
    expect(matchShortcut(evt({ key: 'a', metaKey: true }))).toBe('selectAll');
    expect(matchShortcut(evt({ key: 'd', metaKey: true }))).toBe('duplicate');
    expect(matchShortcut(evt({ key: 'g', metaKey: true }))).toBe('group');
    expect(matchShortcut(evt({ key: 'g', metaKey: true, shiftKey: true }))).toBe('ungroup');
    expect(matchShortcut(evt({ key: 'l', metaKey: true }))).toBe('lock');
  });

  it('maps delete, escape and selection cycling', () => {
    expect(matchShortcut(evt({ key: 'Delete' }))).toBe('delete');
    expect(matchShortcut(evt({ key: 'Backspace' }))).toBe('delete');
    expect(matchShortcut(evt({ key: 'Escape' }))).toBe('escape');
    expect(matchShortcut(evt({ key: 'Tab' }))).toBe('cycleNext');
    expect(matchShortcut(evt({ key: 'Tab', shiftKey: true }))).toBe('cyclePrev');
  });

  it('maps nudges, with shift producing big nudges', () => {
    expect(matchShortcut(evt({ key: 'ArrowLeft' }))).toBe('nudgeLeft');
    expect(matchShortcut(evt({ key: 'ArrowRight', shiftKey: true }))).toBe('nudgeRightBig');
    expect(matchShortcut(evt({ key: 'ArrowUp' }))).toBe('nudgeUp');
    expect(matchShortcut(evt({ key: 'ArrowDown', shiftKey: true }))).toBe('nudgeDownBig');
  });

  it('returns null for unrelated keys', () => {
    expect(matchShortcut(evt({ key: 'q' }))).toBeNull();
    expect(matchShortcut(evt({ key: 'x', metaKey: true }))).toBeNull();
  });
});
