
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="gradient-glow absolute top-0 left-0 right-0 h-64 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
};
