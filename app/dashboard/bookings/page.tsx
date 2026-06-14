'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking } from '@/types';
import { getBookings, updateBookingStatus, cancelBooking } from '@/services/bookingService';
import { formatCurrency } from '@/lib/utils';
import { Loader2, MoreHorizontal, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser } from '@/services/authService';

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

const statusConfig: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-500/10 text-green-600 border-green-500/30' },
  PENDING:   { label: 'Pending',   className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/30' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: '' };
  return (
    <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [agencyNameFilter, setAgencyNameFilter] = useState<string | undefined>(undefined);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings(1, 100, statusFilter);
      const all: Booking[] = (data.bookings || []) as Booking[];
      const filtered = agencyNameFilter
        ? all.filter((b) => {
            const name = (b.agency?.name ?? b.vehicle?.agency?.name ?? '').trim().toLowerCase();
            return name === agencyNameFilter.trim().toLowerCase();
          })
        : all;
      setBookings(filtered);
    } catch {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then((u) => { if (mounted) setAgencyNameFilter(u?.agencyName); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => { fetchBookings(); }, [statusFilter, agencyNameFilter]);

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch { toast.error('Failed to update status'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch { toast.error('Failed to cancel booking'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <CalendarDays className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
            <p className="text-sm text-muted-foreground">{bookings.length} total bookings</p>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="rounded-xl border overflow-hidden shadow-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>User</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded shimmer" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {bookings.map((booking, i) => (
                  <motion.tr
                    key={booking.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, x: 16 }}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="font-medium">{booking.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.vehicle?.model}</div>
                      <div className="text-xs text-muted-foreground font-mono">{booking.vehicle?.plateNumber}</div>
                    </TableCell>
                    <TableCell className="text-sm">{booking.startDate} – {booking.endDate}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(booking.totalPrice)}</TableCell>
                    <TableCell>
                      <Badge variant={booking.paymentStatus === 'PAID' ? 'outline' : 'secondary'}>
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={booking.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'COMPLETED')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCancel(booking.id)}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
