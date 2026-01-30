import { useState, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import api from '@/lib/api' // <-- Using the central API instance
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  IconShieldCheck, 
  IconBuildingCommunity, 
  IconActivity, 
  IconDotsVertical,
  IconUserShield,
  IconLoader2,
  IconPlus
} from '@tabler/icons-react'

export const Route = createLazyFileRoute('/_authenticated/admin/')({
  component: AdminPanel,
})

function AdminPanel() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTenantName, setNewTenantName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [open, setOpen] = useState(false)

  // Centralized fetching logic
  const fetchTenants = async () => {
    setLoading(true)
    try {
      // Using the api instance (replaces getAllTenants if you want consistency)
      const res = await api.get('/tenants')
      // Adjust this based on your backend response structure
      const actualData = res.data?.data || res.data || []
      setTenants(Array.isArray(actualData) ? actualData : [])
    } catch (error) {
      console.error("Failed to fetch tenants", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleCreateTenant = async () => {
    if (!newTenantName) return
    setIsCreating(true)
    try {
      // CLEAN: No hardcoded URL, no manual token headers!
      await api.post('/tenants', { name: newTenantName })
      
      setNewTenantName('')
      setOpen(false)
      fetchTenants() // Refresh the list
    } catch (error: any) {
      console.error("Error creating tenant", error)
      alert(error.response?.data?.message || "Failed to create tenant. Ensure you are an Admin.")
    } finally {
      setIsCreating(false)
    }
  }

  if (loading && tenants.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <IconLoader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconUserShield size={32} className="text-indigo-600" />
          <h1 className='text-2xl font-bold tracking-tight'>System Administration</h1>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <IconPlus size={18} className="mr-2" />
              New Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client Tenant</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Company Name</label>
              <Input 
                placeholder="e.g. Acme Corp" 
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateTenant} 
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isCreating || !newTenantName}
              >
                {isCreating ? 'Creating...' : 'Create Tenant'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
            <IconBuildingCommunity size={20} className="text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Systems</CardTitle>
            <IconShieldCheck size={20} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <IconActivity size={20} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Active</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-[10px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants.length === 0 ? (
                   <tr><td colSpan={4} className="p-8 text-center text-muted-foreground italic">No tenants found.</td></tr>
                ) : (
                  tenants.map((t: any) => (
                    <tr key={t._id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{t.name}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 uppercase text-[9px]">Standard</Badge>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-1.5 text-emerald-600">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          Active
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon"><IconDotsVertical size={16} /></Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}