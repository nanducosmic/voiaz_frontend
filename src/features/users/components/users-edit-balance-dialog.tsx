
import { useState } from 'react'
import { updateUserBalance } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUsers } from './users-provider'

export function UsersEditBalanceDialog() {
  const { open, setOpen, currentRow } = useUsers()
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!currentRow) return;

    setLoading(true)

    try {
      await updateUserBalance(currentRow.id, Number(balance))
      setOpen(null)
      // TODO: Refresh the users list
    } catch (err) {
      console.error('Edit balance error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open === 'editBalance'} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Balance</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <p>Edit balance for {currentRow?.name}</p>
          <div>
            <Label htmlFor="balance">Balance</Label>
            <Input id="balance" type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Enter balance" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Updating...' : 'Update'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
