
import React, { useEffect, useState } from 'react';
import { getAllTenants, getTenants, getAdminUsers, toggleUserStatus } from '@/services/api';
import { useTenant } from '@/context/TenantContext';
// Removed useToast import

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';



interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  balance: number;
  isActive: boolean;
  tenant_id?: string;
}

const UserTable: React.FC = () => {
    // Removed unused fetchUsers function
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove editing and modal state
  const [tenants, setTenants] = useState<any[]>([]);
  const { tenantId } = useTenant();
  // Removed toast usage

  useEffect(() => {
    setLoading(true);
    // Fetch tenants on mount
    (async () => {
      const res = await getTenants();
      setTenants(res.data?.tenants || res.data || []);
    })();
    if (!tenantId) {
      getAdminUsers().then(res => {
        let data = res.data;
        if (!Array.isArray(data)) {
          if (data && Array.isArray(data.users)) {
            data = data.users;
          } else {
            data = [];
          }
        }
        setUsers(data);
        setLoading(false);
      });
    } else {
      getAllTenants().then(res => {
        let data = res.data;
        if (data && Array.isArray(data.tenants)) {
          data = data.tenants;
        } else if (!Array.isArray(data)) {
          data = [];
        }
        data = data.filter((u: User) => u._id === tenantId);
        setUsers(data);
        setLoading(false);
      });
    }
  }, [tenantId]);


  // Remove credit assignment and update balance handlers

  const handleToggleActive = async (userId: string) => {
    // Optimistically update UI
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    try {
      await toggleUserStatus(userId);
    } catch (e) {
      // Rollback on error
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    }
  };

  // Column definitions for TanStack Table (useMemo for reactivity)
  const columns: ColumnDef<User, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'tenant_id',
      header: 'Tenant',
      cell: (info: any) => {
        const user = info.row.original;
        return (
          <span>{typeof user.tenant_id === 'object' ? user.tenant_id.name : user.tenant_id || '-'}</span>
        );
      },
      size: 250,
      minSize: 250,
      maxSize: 400,
    },
    {
      accessorKey: 'balance',
      header: 'Balance',
      cell: (info: any) => `$${info.getValue()}`,
    },
    // Remove actions column (credit assignment, update balance)
    {
      id: 'status',
      header: 'Status',
      cell: (info: any) => {
        const user = info.row.original;
        return (
          <span
            style={{ cursor: 'pointer', color: user.isActive ? 'green' : 'red', textDecoration: !user.isActive ? 'underline' : 'none' }}
            onClick={() => handleToggleActive(user._id)}
            title={user.isActive ? 'Active' : 'Click to toggle'}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
  ], [tenants]);

  const table = useReactTable<User>({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { tenants },
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <table className="min-w-full border" style={{ tableLayout: 'auto' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} style={header.column.id === 'tenant_id' ? { width: 200 } : {}}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} style={cell.column.id === 'tenant_id' ? { width: 200 } : {}}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* No modal or credit assignment UI */}
    </div>
  );
};

export default UserTable;
