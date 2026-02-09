import { redirect, createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getTenants } from '@/services/api';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/_authenticated/users/admin')({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'user', tenant_id: '' });
  const [loading, setLoading] = useState(false);

  // Use the shared API instance for all requests
  const api = require('@/services/api').default;

  // 1. Fetch current user session
  useEffect(() => {
    api.get('/auth/me')
      .then((res: { data: any }) => setUser(res.data))
      .catch((err: unknown) => console.error('Auth check failed', err));
  }, []);

  // 2. Security: Only allow Super Admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      redirect({ to: '/dashboard' });
    }
  }, [user]);

  // 3. Fetch Users (Sub-Users) and Tenants
  const fetchTableData = async () => {
    try {
      // Fetch users from the admin/sub-users endpoint we found in app.ts
      const userRes: { data: any } = await api.get('/admin/sub-users');
      const userData = userRes.data;

      // Handle different response shapes (array vs object)
      let userList = Array.isArray(userData) ? userData : (userData.users || userData.subUsers || []);
      // Map each user to have an id property equal to _id
      userList = userList.map((u: any) => ({ ...u, id: u._id }));
      setUsers(userList);

      // Fetch tenants for the mapping
      const tenantRes: { data: any } = await getTenants();
      let t = tenantRes.data;
      if (t && Array.isArray(t.data)) t = t.data;
      else if (t && Array.isArray(t.tenants)) t = t.tenants;
      else if (!Array.isArray(t)) t = [];
      setTenants(t);
    } catch (err) {
      console.error('Failed to load table data', err);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const handleInvite = async () => {
    if (!form.name || !form.email || !form.role || !form.tenant_id) return;
    setLoading(true);
    try {
      const res: { status: number; data: any } = await api.post('/auth/register', form);
      if (res.status !== 200 && res.status !== 201) {
        throw new Error(res.data?.message || 'Failed to invite user');
      }

      toast({ title: 'User invited', description: `Successfully invited ${form.email}.` });
      setInviteOpen(false);
      setForm({ name: '', email: '', role: 'user', tenant_id: '' });
      fetchTableData(); // Refresh the list
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6 p-6')}>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>User Management</h1>
        <Button onClick={() => setInviteOpen(true)}>Invite New User</Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length ? (
              users.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    {/* Maps the tenant_id to the actual Name of the 11 tenants */}
                    {tenants.find((t) => t._id === u.tenant_id)?.name || u.tenant_id || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center'>
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <form
            className='flex flex-col gap-4 mt-2'
            onSubmit={(e) => {
              e.preventDefault();
              handleInvite();
            }}
          >
            <Input
              placeholder='Full Name'
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={loading}
              required
            />
            <Input
              type='email'
              placeholder='Email Address'
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              disabled={loading}
              required
            />
            <Select
              value={form.role}
              onValueChange={(val) => setForm((f) => ({ ...f, role: val }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={form.tenant_id}
              onValueChange={(val) => setForm((f) => ({ ...f, tenant_id: val }))}
              disabled={loading}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder='Select Organization' />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((t: any) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DialogFooter className='mt-4'>
              <Button type="button" variant='ghost' onClick={() => setInviteOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? 'Sending...' : 'Invite User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}