import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUsers } from './users-provider'

type Agent = {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export function UsersAssignAgentsDialog() {
  const { open, setOpen, currentRow } = useUsers()
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    if (open === 'assignAgents' && currentRow) {
      fetchAgents()
      // TODO: Fetch currently assigned agents for the user
      setSelectedAgents([]) // Reset selection
    }
  }, [open, currentRow])

  const fetchAgents = async () => {
    setFetchLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bolnabackend1-production.up.railway.app/api'
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/admin/agents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAgents(response.data)
    } catch (err) {
      console.error('Failed to fetch agents:', err)
      setAgents([])
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentRow) return

    setLoading(true)
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bolnabackend1-production.up.railway.app/api'
      const token = localStorage.getItem('token')
      await axios.patch(`${API_BASE_URL}/admin/users/${currentRow.id}/agents`, { agentIds: selectedAgents }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOpen(null)
    } catch (err) {
      console.error('Assign agents error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  return (
    <Dialog open={open === 'assignAgents'} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Agents to {currentRow?.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="agents">Select Agents</Label>
            {fetchLoading ? (
              <div>Loading agents...</div>
            ) : agents.length === 0 ? (
              <div>No agents available</div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={agent.id}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <Label htmlFor={agent.id} className="text-sm font-medium">
                      {agent.name}
                    </Label>
                    {agent.description && (
                      <span className="text-xs text-muted-foreground">({agent.description})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(null)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || fetchLoading}>
            {loading ? 'Assigning...' : 'Assign Agents'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}