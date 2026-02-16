'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Car,
  CalendarDays,
  Users,
  LogOut,
  Map,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Vehicles',
    href: '/dashboard/vehicles',
    icon: Car,
  },
  {
    title: 'Bookings',
    href: '/dashboard/bookings',
    icon: CalendarDays,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Live Tracking',
    href: '/dashboard/tracking',
    icon: Map,
  },
  {
    title: 'Incidents',
    href: '/dashboard/incidents',
    icon: ShieldAlert,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check local storage for collapsed state
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    deleteCookie('token');
    deleteCookie('user');
    router.push('/login');
  };

  if (!mounted) return <div className="w-64 border-r bg-card" />; // Prevent hydration mismatch

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex h-full flex-col border-r bg-card text-card-foreground z-20 shadow-sm"
    >
      <div className="flex h-16 items-center border-b px-4 justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold overflow-hidden">
          <motion.div
            animate={{ rotate: collapsed ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Car className="h-6 w-6 text-primary" />
          </motion.div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap"
              >
                SAVES Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-8 w-8 ml-auto hidden md:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all group relative overflow-hidden',
                  isActive 
                    ? 'text-primary font-medium bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={cn("h-5 w-5 shrink-0 z-10 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap z-10"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {collapsed && (
                  <div className="absolute left-14 bg-popover text-popover-foreground px-2 py-1 rounded-md text-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto border-t p-4">
        <Button
          variant="outline"
          className={cn("w-full gap-2 transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </motion.div>
  );
}
