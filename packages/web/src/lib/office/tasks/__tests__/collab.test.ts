import {
  CURRENT_USER_ID,
  CURRENT_USER_NAME,
  extractMentions,
  getBoardRole,
  mentionPattern,
} from '@/lib/office/tasks/collab';
import type { Board, Member } from '@/lib/office/tasks/types';

describe('collab constants', () => {
  it('exposes the current user identity', () => {
    expect(CURRENT_USER_ID).toBe('mem-1');
    expect(CURRENT_USER_NAME).toBe('Alice Chen');
  });
});

describe('getBoardRole', () => {
  it('returns admin when no board is provided', () => {
    expect(getBoardRole(undefined)).toBe('admin');
  });

  it('returns admin when the user has no role entry', () => {
    const board = { roles: {} } as Board;
    expect(getBoardRole(board, 'mem-2')).toBe('admin');
  });

  it('returns the explicit role for the current user', () => {
    const board = { roles: { 'mem-2': 'viewer' } } as unknown as Board;
    expect(getBoardRole(board, 'mem-2')).toBe('viewer');
  });

  it('uses the default current user when userId is omitted', () => {
    const board = { roles: { 'mem-1': 'member' } } as unknown as Board;
    expect(getBoardRole(board)).toBe('member');
  });
});

describe('mentionPattern', () => {
  const members: Member[] = [
    { id: 'mem-1', name: 'Bob K.', email: 'bob@dev.io', avatar: 'BK' },
    { id: 'mem-2', name: 'Amy', email: 'amy@dev.io', avatar: 'AM' },
  ];

  it('builds alternation over id, name and avatar for each member', () => {
    const pattern = mentionPattern(members);
    expect(pattern).toContain('@mem-1');
    expect(pattern).toContain('@Bob');
    expect(pattern).toContain('@BK');
    expect(pattern).toContain('@Amy');
  });

  it('escapes regex-special characters in member tokens', () => {
    const tricky: Member[] = [{ id: 'm.1', name: 'Dr. Xu', email: 'xu@dev.io', avatar: 'DX' }];
    const pattern = mentionPattern(tricky);
    expect(pattern).toContain('@Dr\\. Xu');
    expect(() => new RegExp(pattern)).not.toThrow();
  });
});

describe('extractMentions', () => {
  const members: Member[] = [
    { id: 'mem-1', name: 'Alice Chen', email: 'alice@dev.io', avatar: 'AC' },
    { id: 'mem-2', name: 'Bob Smith', email: 'bob@dev.io', avatar: 'BS' },
  ];

  it('extracts all matched mentions stripped of the @ prefix', () => {
    const text = 'Hey @Alice Chen and @mem-2, ping @AC';
    expect(extractMentions(text, members)).toEqual(['Alice Chen', 'mem-2', 'AC']);
  });

  it('returns an empty array when nothing matches', () => {
    expect(extractMentions('no mentions here', members)).toEqual([]);
  });
});
