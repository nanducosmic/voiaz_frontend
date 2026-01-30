import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import api from '@/lib/api' 
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  IconRocket, 
  IconUserCheck, 
  IconHistory, 
  IconPhoneIncoming, 
  IconLoader2,
  IconAlertCircle 
} from '@tabler/icons-react'

// 1. Define the Agent type
interface Agent {
  _id: string;
  name: string;
  role: string;
}

export const Route = createLazyFileRoute('/_authenticated/campaigns/')({
  component: CampaignsPage,
})

function CampaignsPage() {
  // Always initialize as empty arrays to prevent .map crashes
  const [agents, setAgents] = useState<Agent[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true)
      setError(false)
      try {
        const [agentsRes, logsRes] = await Promise.all([
          api.get('/agent'),
          api.get('/calls/logs')
        ])

        // DEFENSIVE CHECK: Support both { data: [] } and { data: { data: [] } }
        const rawAgents = agentsRes.data?.data || agentsRes.data || []
        const rawLogs = logsRes.data?.data || logsRes.data || []

        // Fallback to Vikram and Neha if database is empty or data isn't an array
        if (Array.isArray(rawAgents) && rawAgents.length === 0) {
          setAgents([
            { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
            { _id: 'n1', name: 'Neha', role: 'Customer Support' }
          ])
        } else {
          setAgents(Array.isArray(rawAgents) ? rawAgents : [])
        }
        
        setLogs(Array.isArray(rawLogs) ? rawLogs : [])
      } catch (err) {
        console.error("Fetch failed:", err)
        setError(true)
        // Ensure UI doesn't crash by providing fallback data
        setAgents([
          { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
          { _id: 'n1', name: 'Neha', role: 'Customer Support' }
        ])
        setLogs([])
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [])

  const handleLaunch = async () => {
    if (!selectedAgentId || !phoneNumber) return alert("Please select an agent and enter a number.")
    
    setLoading(true)
    try {
      await api.post('/calls/make-call', {
        agentId: selectedAgentId,
        to: phoneNumber
      })
      
      alert("🚀 Call Initiated Successfully!")
      
      // Refresh logs
      const res = await api.get('/calls/logs')
      const newLogs = res.data?.data || res.data || []
      setLogs(Array.isArray(newLogs) ? newLogs : [])
    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || "Launch failed. Ensure your backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Main>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">Launch AI outreach and track real-time activity.</p>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <IconAlertCircle size={18} />
            <span>Connection error: Showing fallback agents. check if backend is on port 5000.</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-indigo-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUserCheck className="text-indigo-600" /> 1. Select Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fetching && agents.length === 0 ? (
               <div className="flex justify-center py-4"><IconLoader2 className="animate-spin text-indigo-600" /></div>
            ) : (
              agents.map((agent) => (
                <div
                  key={agent._id}
                  onClick={() => setSelectedAgentId(agent._id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedAgentId === agent._id 
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' 
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="font-bold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{agent.role}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconRocket className="text-orange-500" /> 2. Launch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Number</label>
              <Input 
                placeholder="+91 98765 43210" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-11"
              />
            </div>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-white" 
              disabled={loading || !selectedAgentId} 
              onClick={handleLaunch}
            >
              {loading ? "Connecting to AI..." : "Start AI Campaign"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconHistory className="text-slate-500" /> Recent Activity
          </CardTitle>
          <CardDescription>Performance logs for your digital workforce.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[150px]">Recipient</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* SAFE CHECK: Ensure logs is an array before calling length */}
                {(!Array.isArray(logs) || logs.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">
                      No recent calls found.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log._id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconPhoneIncoming size={14} className="text-slate-400" /> {log.to}
                        </div>
                      </TableCell>
                      <TableCell>{log.agentId?.name || 'AI Agent'}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Main>
  )
}