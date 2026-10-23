'use client';

import type { Board, BoardRole, Member } from '@/lib/office/tasks/types';

export const CURRENT_USER_ID = 'mem-1';
export const CURRENT_USER_NAME = 'Alice Chen';

export const getBoardRole = (
  board: Board | undefined,
  userId: string = CURRENT_USER_ID,
): BoardRole => board?.roles?.[userId] ?? 'admin';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const mentionPattern = (members: Member[]): string =>
  members
    .map((m) => `@${escapeRegex(m.id)}|@${escapeRegex(m.name)}|@${escapeRegex(m.avatar)}`)
    .join('|');

export const extractMentions = (text: string, members: Member[]): string[] => {
  const re = new RegExp(mentionPattern(members), 'g');
  return [...text.matchAll(re)].map((match) => match[0].slice(1));
};
