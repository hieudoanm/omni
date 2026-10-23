'use client';

import { useEffect } from 'react';
import type { SlideObject } from '@/types/keynotes/deck';
import { useDeck } from '@/components/office/keynotes/organisms/DeckProvider';
import { matchShortcut } from '@/lib/office/keynotes/shortcuts';

const isEditableTarget = (el: EventTarget | null): boolean => {
  const node = el as HTMLElement | null;
  if (!node) return false;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

const cycleSelection = (ids: string[], active: string[], step: number): string[] => {
  if (!ids.length) return active;
  const last = active[active.length - 1];
  const idx = ids.indexOf(last);
  const next = ids[(idx + step + ids.length) % ids.length];
  return next ? [next] : active;
};

export const useObjectKeyboard = () => {
  const {
    activeSlide,
    selectedObjectIds,
    setSelection,
    deleteObject,
    duplicateSelected,
    groupSelected,
    ungroup,
    updateObject,
    updateObjects,
    undo,
    redo,
    saveDeck,
  } = useDeck();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      const command = matchShortcut(e);
      if (!command) return;

      switch (command) {
        case 'undo':
        case 'redo':
          e.preventDefault();
          if (command === 'undo') undo();
          else redo();
          return;
        case 'save':
          e.preventDefault();
          void saveDeck();
          return;
        case 'selectAll':
          if (activeSlide) {
            e.preventDefault();
            setSelection(activeSlide.objects.map((o) => o.id));
          }
          return;
        case 'duplicate':
          e.preventDefault();
          duplicateSelected();
          return;
        case 'group':
        case 'ungroup': {
          e.preventDefault();
          if (command === 'ungroup') {
            const group = activeSlide?.objects.find((o) => selectedObjectIds.includes(o.id));
            const groupId = group?.group
              ? group.group
              : activeSlide?.objects.find(
                  (o) => selectedObjectIds.includes(o.id) && o.kind === 'group',
                )?.id;
            if (groupId) ungroup(groupId);
          } else {
            groupSelected();
          }
          return;
        }
        case 'delete':
          e.preventDefault();
          for (const id of selectedObjectIds) deleteObject(id);
          return;
        case 'escape':
          setSelection([]);
          return;
        case 'lock': {
          e.preventDefault();
          const objects = activeSlide?.objects.filter((o) => selectedObjectIds.includes(o.id));
          if (!objects?.length) return;
          const next = !objects[0].locked;
          updateObjects(
            objects.map((o) => o.id),
            { locked: next } as Partial<SlideObject>,
          );
          return;
        }
        case 'cycleNext':
        case 'cyclePrev': {
          e.preventDefault();
          const ids = activeSlide?.objects.map((o) => o.id) ?? [];
          setSelection(cycleSelection(ids, selectedObjectIds, command === 'cycleNext' ? 1 : -1));
          return;
        }
        default: {
          const dirs: Record<string, [number, number]> = {
            nudgeLeft: [-1, 0],
            nudgeRight: [1, 0],
            nudgeUp: [0, -1],
            nudgeDown: [0, 1],
            nudgeLeftBig: [-10, 0],
            nudgeRightBig: [10, 0],
            nudgeUpBig: [0, -10],
            nudgeDownBig: [0, 10],
          };
          const [dx, dy] = dirs[command] ?? [0, 0];
          e.preventDefault();
          const objects = activeSlide?.objects.filter((o) => selectedObjectIds.includes(o.id));
          if (objects?.length) {
            for (const o of objects) {
              updateObject(o.id, {
                x: o.x + dx,
                y: o.y + dy,
              } as Partial<SlideObject>);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeSlide,
    selectedObjectIds,
    setSelection,
    deleteObject,
    duplicateSelected,
    groupSelected,
    ungroup,
    updateObject,
    updateObjects,
    undo,
    redo,
    saveDeck,
  ]);
};
