import { db } from '@/lib/office/tasks/db';
import {
  mockBoards,
  mockLists,
  mockCards,
  mockLabels,
  mockMembers,
  mockActivity,
} from '@/data/office/tasks/models';

export const seedDatabase = async () => {
  const existing = await db.boards.getAll();
  if (existing.length > 0) return;

  for (const b of mockBoards) await db.boards.put(b);
  for (const l of mockLists) await db.lists.put(l);
  for (const c of mockCards) await db.cards.put(c);
  for (const l of mockLabels) await db.labels.put(l);
  for (const m of mockMembers) await db.members.put(m);
  for (const a of mockActivity) await db.activity.put(a);

  await db.settings.put({
    theme: 'office-light',
    defaultView: 'kanban',
    notifications: true,
    notificationsReadAt: 0,
  });
};
