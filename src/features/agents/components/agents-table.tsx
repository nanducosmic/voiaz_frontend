import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
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
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'

import { getTenants } from '@/services/api'
import { agentsColumns as columns } from './agents-columns'

export function AgentsTable() {
  const { toast } = useToast();
  // State for Assign Credits dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [assignLoading, setAssignLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: {},
    navigate: () => {},
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true },
    columnFilters: [
      { columnId: 'name', searchKey: 'name', type: 'string' },
    ],
  })
  // Fetch tenants
  const fetchTenants = () => {
    getTenants().then(res => {
      let t = res.data;
      if (t && Array.isArray(t.data)) t = t.data;
      else if (t && Array.isArray(t.tenants)) t = t.tenants;
      else if (!Array.isArray(t)) t = [];
      setTenants(t);
    });
  };
  useEffect(() => {
    fetchTenants();
  }, []);
  const table = useReactTable({
    data: tenants,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter agents...'
        searchKey='name'
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                      {/* Assign Credits button in last cell */}
                      {idx === row.getVisibleCells().length - 1 && (
                        <Button
                          size='sm'
                          variant='outline'
                          className='ml-2'
                          onClick={() => {
                            setSelectedTenant(row.original);
                            setCreditAmount(0);
                            setAssignDialogOpen(true);
                          }}
                        >
                          Assign Credits
                        </Button>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      {/* Assign Credits Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Credits</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4 mt-2'>
            <label className='text-sm font-medium'>Amount</label>
            <input
              type='number'
              min={0}
              value={creditAmount}
              onChange={e => setCreditAmount(Number(e.target.value))}
              className='border rounded px-2 py-1 w-full'
              placeholder='Enter amount'
              disabled={assignLoading}
            />
          </div>
          <DialogFooter className='mt-4'>
            <Button
              variant='ghost'
              onClick={() => setAssignDialogOpen(false)}
              disabled={assignLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedTenant || creditAmount <= 0) return;
                setAssignLoading(true);
                try {
                  const res = await fetch(`/api/tenants/${selectedTenant._id}/credits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: creditAmount }),
                  });
                  if (!res.ok) throw new Error('Failed to assign credits');
                  toast({ title: 'Credits assigned', description: `Successfully assigned $${creditAmount.toFixed(2)} to ${selectedTenant.name}.`, variant: 'default' });
                  setAssignDialogOpen(false);
                  setSelectedTenant(null);
                  setCreditAmount(0);
                  fetchTenants(); // Refresh table
                } catch (err: any) {
                  toast({ title: 'Error', description: err.message || 'Failed to assign credits', variant: 'destructive' });
                } finally {
                  setAssignLoading(false);
                }
              }}
              disabled={assignLoading || !selectedTenant || creditAmount <= 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}