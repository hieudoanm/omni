export type BoardRole = 'admin' | 'member' | 'viewer';

export interface Board {
  id: string;
  name: string;
  background: string;
  starred: boolean;
  listIds: string[];
  roles?: Record<string, BoardRole>;
  shareEnabled?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  cardIds: string[];
  collapsed: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  labels: string[];
  dueDate: number | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  memberIds: string[];
  checklistItems: ChecklistItem[];
  comments: CardComment[];
  attachments: CardAttachment[];
  coverColor: string | null;
  coverImage: string | null;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface CardComment {
  id: string;
  text: string;
  author: string;
  createdAt: number;
}

export interface CardAttachment {
  id: string;
  name: string;
  size: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  background: string;
  lists: { name: string; cards: { title: string }[] }[];
}

export interface Activity {
  id: string;
  boardId: string;
  cardId: string | null;
  message: string;
  userId: string;
  timestamp: number;
}

export interface TasksSettings {
  theme: string;
  defaultView: string;
  notifications: boolean;
  notificationsReadAt?: number;
}

export interface Task {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  id: string;
  userId: string | null;
}

export type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'none';
export type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'urgent';

export interface BoardFilters {
  activeLabel: string | null;
  activeMember: string | null;
  dueFilter: DueFilter;
  priorityFilter: PriorityFilter;
}

export interface Preset extends BoardFilters {
  id: string;
  name: string;
}

export const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'all', label: 'Any due date' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'none', label: 'No due date' },
];

export const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Any priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];
