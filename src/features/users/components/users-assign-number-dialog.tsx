import { useState } from 'react'
import { updateUserPhone } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUsers } from './users-provider'

export function UsersAssignNumberDialog() {
  const { open, setOpen, currentRow } = useUsers()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!currentRow) return;

    setLoading(true)

    try {
      if (typeof currentRow.id === 'string') {
        await updateUserPhone(currentRow.id, phoneNumber)
        setOpen(null)
        // TODO: Refresh the users list
      } else {
        throw new Error('User ID is missing or invalid.')
      }
    } catch (err) {
      console.error('Assign number error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open === 'assignNumber'} onOpenChange={() => setOpen(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Phone Number</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <p>Assign phone number to {currentRow?.name}</p>
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}