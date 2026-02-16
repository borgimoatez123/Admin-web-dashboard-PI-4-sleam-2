'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Booking } from '@/types';
import { getBookings, updateBookingStatus, cancelBooking } from '@/services/bookingService';
import { Loader2, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await getBookings(1, 100, statusFilter);
      // @ts-ignore
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, status: any) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.user?.name}</div>
                    <div className="text-xs text-muted-foreground">{booking.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.vehicle?.model}</div>
                    <div className="text-xs text-muted-foreground">{booking.vehicle?.plateNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {booking.startDate} - {booking.endDate}
                    </div>
                  </TableCell>
                  <TableCell>${booking.totalPrice}</TableCell>
                  <TableCell>
                    <Badge variant={booking.paymentStatus === 'PAID' ? 'outline' : 'secondary'}>
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'COMPLETED')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
                          Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCancel(booking.id)}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
