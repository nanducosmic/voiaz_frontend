import React from 'react';
import { type ColumnDef, Table } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table';
import { LongText } from '@/components/long-text';
import { type User } from '../data/schema';
import { DataTableRowActions } from './data-table-row-actions';
import { useToast } from '@/hooks/use-toast';

export const usersColumns: ColumnDef<User, any>[] = [
  {
    accessorKey: 'tenant_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Organization' />
    ),
    cell: ({ row }: { row: any }) => {
      const tenant = row.original.tenant_id;
      return tenant && typeof tenant === 'object' && tenant.name
        ? tenant.name
        : '—';
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      return (
        <div className='flex items-center gap-x-2'>
          <span className='text-sm capitalize'>{role.replace('_', ' ')}</span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Balance' />
    ),
    cell: function BalanceCell({ row, table }: { row: any; table: Table<User> & { options: { meta?: { handleSaveBalance?: (userId: string, amount: number) => void } } } }) {
      const [editing, setEditing] = React.useState(false);
      const [amount, setAmount] = React.useState(row.original.balance);
      const handleSave = () => {
        const meta = table.options.meta as any;
        if (typeof meta?.handleSaveBalance === 'function') {
          meta.handleSaveBalance(row.original.id, amount);
        }
        setEditing(false);
      };
      return editing ? (
        <div className='flex items-center gap-2 justify-end'>
          <input
            type='number'
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className='w-20 border rounded px-1 text-right'
            style={{ minWidth: 60 }}
          />
          <button className='px-2 py-1 bg-green-500 text-white rounded' onClick={handleSave}>Save</button>
          <button className='px-2 py-1 bg-gray-300 rounded' onClick={() => { setEditing(false); setAmount(row.original.balance); }}>Cancel</button>
        </div>
      ) : (
        <div className='text-right font-medium flex items-center justify-end gap-2'>
          ${row.getValue('balance')}
          <button className='px-1 py-0.5 text-xs bg-blue-100 rounded' onClick={() => setEditing(true)}>Edit</button>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
