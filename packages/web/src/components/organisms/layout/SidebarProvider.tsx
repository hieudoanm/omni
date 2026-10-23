'use client';

import type { SidebarTab } from '@/components/organisms/layout/types';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface SidebarContextValue {
  sidebarTab: SidebarTab | null;
  toggleSidebar: (tab: SidebarTab) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>(null);

  const toggleSidebar = useCallback(
    (tab: SidebarTab) => setSidebarTab((prev) => (prev === tab ? null : tab)),
    [],
  );

  return (
    <SidebarContext.Provider value={{ sidebarTab, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
};
