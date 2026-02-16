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

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendUp,
  color = 'default',
  className,
  delay = 0,
}: StatsCardProps) {
  const colorStyles = {
    default: 'text-foreground',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  const bgStyles = {
    default: 'bg-muted/50',
    blue: 'bg-blue-50 dark:bg-blue-950/20',
    green: 'bg-green-50 dark:bg-green-950/20',
    red: 'bg-red-50 dark:bg-red-950/20',
    orange: 'bg-orange-50 dark:bg-orange-950/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
    >
      <ShadcnCard className={cn("overflow-hidden border-none shadow-sm hover:shadow-md transition-all", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={cn("p-2 rounded-full", bgStyles[color])}>
            <Icon className={cn("h-4 w-4", colorStyles[color])} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {(description || trend) && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {trend && (
                <span className={cn("mr-2 font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                  {trend}
                </span>
              )}
              {description}
            </div>
          )}
          {/* Accent Bar */}
          <div className={cn("absolute bottom-0 left-0 w-full h-1 opacity-20", 
            color === 'default' ? 'bg-primary' :
            color === 'blue' ? 'bg-blue-500' :
            color === 'green' ? 'bg-green-500' :
            color === 'red' ? 'bg-red-500' :
            'bg-orange-500'
          )} />
        </CardContent>
      </ShadcnCard>
    </motion.div>
  );
}
