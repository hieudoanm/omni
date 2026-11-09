'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from 'react';
import type { Member } from '@/lib/office/tasks/types';
import { db } from '@/lib/office/tasks/db';

interface AuthContextType {
  currentUser: Member | null;
  switchMember: (memberId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    const restore = async () => {
      const session = await db.session.get();
      const members = await db.members.getAll();
      setCurrentUser(members.find((m) => m.id === session.userId) ?? members[0] ?? null);
    };
    restore();
  }, []);

  const switchMember = useCallback(async (memberId: string) => {
    const members = await db.members.getAll();
    const member = members.find((m) => m.id === memberId);
    if (!member) return;
    await db.session.put({ id: 'session', userId: member.id });
    setCurrentUser(member);
  }, []);

  const signOut = useCallback(async () => {
    await db.session.put({ id: 'session', userId: null });
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, switchMember, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';
