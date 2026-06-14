'use client';

import { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { getUsers, updateUserStatus, deleteUser } from '@/services/userService';
import { Loader2, MoreHorizontal, Ban, CheckCircle, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  show:   (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 401) toast.error('Unauthorized. Please login again.');
      else toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'BLOCKED') => {
    try {
      await updateUserStatus(id, status);
      toast.success(`User marked as ${status}`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 rounded shimmer" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, x: 16 }}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className={user.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-600 border-green-500/30'
                          : 'bg-red-500/10 text-red-600 border-red-500/30'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {user.status === 'ACTIVE' ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'BLOCKED')}>
                              <Ban className="mr-2 h-4 w-4 text-orange-500" /> Block
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'ACTIVE')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Unblock
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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
