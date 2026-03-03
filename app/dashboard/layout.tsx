'use client';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { getCurrentUser } from '@/services/authService';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [agencyName, setAgencyName] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        setAgencyName(user?.agencyName);
      } catch {
        // ignore
      }
    };
    fetchUser();

    const onAgencyUpdated = () => fetchUser();
    window.addEventListener('agency-updated', onAgencyUpdated as unknown as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener('agency-updated', onAgencyUpdated as unknown as EventListener);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="w-full flex-1">
            <h1 className="text-2xl font-extrabold text-foreground leading-tight">
              {agencyName ?? 'Agency'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {/* Add User Menu here if needed */}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}
