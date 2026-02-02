import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils';
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination, DataTableToolbar } from '@/components/data-table';
import { roles } from '../data/data';
import { type User } from '../data/schema';
import { updateUserBalance, getTenants, updateUserTenant } from '@/services/api';
import { DataTableBulkActions } from './data-table-bulk-actions';
import { usersColumns } from './users-columns';


type DataTableProps = {
  data: User[];
  search: Record<string, unknown>;
  navigate: NavigateFn;
};

export function UsersTable({ data, search, navigate }: DataTableProps) {

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ tenant_id: true });
  const [sorting, setSorting] = useState<SortingState>([]);
  // Real-time table data state
  const [tableData, setTableData] = useState<User[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);

  // Fetch tenants on mount
  useEffect(() => {
    setTableData(data);
  }, [data]);
  useEffect(() => {
    getTenants().then(res => {
      let t = res.data;
      if (t && Array.isArray(t.data)) t = t.data;
      else if (t && Array.isArray(t.tenants)) t = t.tenants;
      else if (!Array.isArray(t)) t = [];
      setTenants(t);
    });
  }, []);

  // Local state management for table (uncomment to use local-only state, not synced with URL)
  // const [columnFilters, onColumnFiltersChange] = useState<ColumnFiltersState>([])
  // const [pagination, onPaginationChange] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // Synced with URL states (keys/defaults mirror users route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // username per-column text filter
      { columnId: 'username', searchKey: 'username', type: 'string' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'role', searchKey: 'role', type: 'array' },
    ],
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const handleSaveBalance = async (userId: string, newAmount: number) => {
    try {
      await updateUserBalance(userId, newAmount);
      setTableData(prev => prev.map(u => u.id === userId ? { ...u, balance: newAmount } : u));
    } catch (e) {
      // Optionally show error
    }
  };
  // Update tenant for a user
  const handleUpdateTenant = async (userId: string, tenantId: string) => {
    try {
      await updateUserTenant(userId, tenantId);
      setTableData(prev => prev.map(u =>
        u.id === userId
          ? { ...u, tenant_id: tenants.find(t => t._id === tenantId) || null }
          : u
      ));
    } catch (e) {}
  };

  const table = useReactTable({
    data: tableData,
    columns: usersColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: { handleSaveBalance, tenants: tenants, onUpdateTenant: handleUpdateTenant },
    initialState: { columnVisibility: { tenant_id: true } },
    getRowId: (row) => row.id || row._id,
  });

  useEffect(() => {
    ensurePageInRange(table.getPageCount());
  }, [table, ensurePageInRange]);

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter users...'
        searchKey='name'
        filters={[
          {
            columnId: 'role',
            title: 'Role',
            options: roles.map((role) => ({ ...role })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={usersColumns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  );
}
