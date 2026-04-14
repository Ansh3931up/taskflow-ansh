import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/layout/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {/* Outlet serves as the dynamic rendering port for React Router Dom */}
        <Outlet />
      </main>
    </div>
  );
}
