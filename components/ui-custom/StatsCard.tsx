'use client';

import { motion } from 'framer-motion';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'default' | 'blue' | 'green' | 'red' | 'orange';
  className?: string;
  delay?: number;
}

const colorStyles = {
  default: { text: 'text-foreground',       bg: 'bg-muted/50',              bar: 'bg-primary',    glow: '' },
  blue:    { text: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/20',   bar: 'bg-blue-500',   glow: 'shadow-blue-500/20' },
  green:   { text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20', bar: 'bg-green-500',  glow: 'shadow-green-500/20' },
  red:     { text: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-950/20',     bar: 'bg-red-500',    glow: 'shadow-red-500/20' },
  orange:  { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20', bar: 'bg-orange-500', glow: 'shadow-orange-500/20' },
};

export function StatsCard({
  title, value, icon: Icon, description, trend, trendUp,
  color = 'default', className, delay = 0,
}: StatsCardProps) {
  const c = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
      className="relative"
    >
      <ShadcnCard className={cn(
        'overflow-hidden border-none shadow-sm hover:shadow-lg transition-shadow duration-300',
        c.glow && `hover:shadow-lg hover:${c.glow}`,
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <motion.div
            className={cn('p-2 rounded-full', c.bg)}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className={cn('h-4 w-4', c.text)} />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="text-2xl font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.15, duration: 0.4, type: 'spring' }}
          >
            {value}
          </motion.div>
          {(description || trend) && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {trend && (
                <motion.span
                  className={cn('mr-2 font-medium', trendUp ? 'text-green-600' : 'text-red-600')}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.25 }}
                >
                  {trend}
                </motion.span>
              )}
              {description}
            </div>
          )}
          {/* Animated accent bar */}
          <motion.div
            className={cn('absolute bottom-0 left-0 h-1 opacity-30', c.bar)}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
          />
        </CardContent>
      </ShadcnCard>
    </motion.div>
  );
}
