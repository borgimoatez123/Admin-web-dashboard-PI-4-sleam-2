import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'STOLEN' | 'ACCIDENT' | 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PAID' | 'FAILED';

interface StatusBadgeProps {
  status: string;
  className?: string;
  animate?: boolean;
}

export function StatusBadge({ status, className, animate = false }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase() as StatusType;

  const styles = {
    // Vehicle Status
    AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    BOOKED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    STOLEN: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    ACCIDENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    
    // User/General Status
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    BLOCKED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    
    // Booking Status
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    
    // Payment Status
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  const style = styles[normalizedStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium border px-2.5 py-0.5 transition-colors", 
        style,
        animate && normalizedStatus === 'STOLEN' && "animate-pulse",
        className
      )}
    >
      {normalizedStatus}
    </Badge>
  );
}
