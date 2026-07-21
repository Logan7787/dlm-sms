'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { StudioProvider } from '@/context/studio-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return <StudioProvider>{children}</StudioProvider>;
  }

  return (
    <StudioProvider>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white print:bg-white print:text-slate-900 print:block print:min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 print:block print:w-full">
          <Header />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:block print:overflow-visible">
            {children}
          </main>
        </div>
      </div>
    </StudioProvider>
  );
}
