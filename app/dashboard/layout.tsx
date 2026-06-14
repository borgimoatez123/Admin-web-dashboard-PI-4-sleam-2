'use client';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ModeToggle } from '@/components/mode-toggle';
import { getCurrentUser } from '@/services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [agencyName, setAgencyName] = useState<string | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!mounted) return;
        setAgencyName(user?.agencyName);
      } catch { /* ignore */ }
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
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6"
        >
          <div className="w-full flex-1">
            <AnimatePresence mode="wait">
              <motion.h1
                key={agencyName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-extrabold text-foreground leading-tight"
              >
                {agencyName ?? 'Agency'}
              </motion.h1>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </motion.header>

        {/* Page content with route-change animation */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
