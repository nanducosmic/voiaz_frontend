import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { updateTenantConfig } from '@/services/tenantConfig'
import React from 'react';

const AGENT_IDS = [
  { label: 'Vikram', value: '50fe0026-30f2-4060-aba8-ad35791fb0e0' },
  { label: 'Neha', value: '9caf93c6-3b54-4159-9cf7-4d0707550e2b' },
];

export const agentsColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Organization' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('name')}</LongText>
    ),
  },
  {
    accessorKey: 'bolnaAgentIds',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Agent IDs' />
    ),
    cell: ({ row }) => {
      // Support both array and legacy string
      const initial = Array.isArray(row.original.bolnaAgentIds)
        ? row.original.bolnaAgentIds
        : row.original.bolnaAgentId
        ? [row.original.bolnaAgentId]
        : [];
      const [checked, setChecked] = React.useState<string[]>(initial);
      const [phone, setPhone] = React.useState(row.original.assignedPhoneNumber || '');
      const [saving, setSaving] = React.useState(false);
      // Sync phone number from sibling input
      const handleCheckboxChange = async (id: string) => {
        let newChecked;
        if (checked.includes(id)) {
          newChecked = checked.filter(x => x !== id);
        } else {
          newChecked = [...checked, id];
        }
        setChecked(newChecked);
        setSaving(true);
        try {
            await updateTenantConfig(row.original._id, { bolnaAgentId: newChecked.join(','), assignedNumber: phone });
        } finally {
          setSaving(false);
        }
      };
      // Sync phone number change
      const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
      };
      const handlePhoneBlur = async () => {
        setSaving(true);
        try {
            await updateTenantConfig(row.original._id, { bolnaAgentId: checked.join(','), assignedNumber: phone });
        } finally {
          setSaving(false);
        }
      };
      return (
        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            {AGENT_IDS.map(opt => (
              <label key={opt.value} className='flex items-center gap-1'>
                <input
                  type='checkbox'
                  checked={checked.includes(opt.value)}
                  onChange={() => handleCheckboxChange(opt.value)}
                  disabled={saving}
                />
                {opt.label}
              </label>
            ))}
          </div>
          <input
            type='text'
            value={phone}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            disabled={saving}
            className='border rounded px-2 py-1 w-full mt-1'
            placeholder='Assign number...'
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.getValue('description')}</LongText>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => (
      <div>{new Date(row.getValue('createdAt')).toLocaleDateString()}</div>
    ),
  },
]