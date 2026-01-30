import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import axios from 'axios'
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
import { IconRocket, IconUserCheck, IconHistory, IconPhoneIncoming } from '@tabler/icons-react'

// Define the Interface for TypeScript
interface Agent {
  _id: string;
  name: string;
  role: string;
}

export const Route = createFileRoute('/campaigns')({
  component: CampaignsPage,
})

function CampaignsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [logs, setLogs] = useState([])
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, logsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/agent', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/calls/logs', { headers: { Authorization: `Bearer ${token}` } })
        ])

        // Logic: Use Vikram and Neha if the DB is empty
        if (agentsRes.data.length === 0) {
          setAgents([
            { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
            { _id: 'n1', name: 'Neha', role: 'Customer Support' }
          ])
        } else {
          setAgents(agentsRes.data)
        }
        
        setLogs(logsRes.data)
      } catch (err) {
        console.error("Error fetching data, using defaults:", err)
        // Fallback on error
        setAgents([
          { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
          { _id: 'n1', name: 'Neha', role: 'Customer Support' }
        ])
      }
    }
    fetchData()
  }, [token])

  const handleLaunch = async () => {
    if (!selectedAgentId || !phoneNumber) return alert("Select agent and enter number.")
    setLoading(true)
    try {
      await axios.post('http://localhost:5000/api/calls/make-call', {
        agentId: selectedAgentId,
        to: phoneNumber
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      alert("🚀 Call Initiated!")
      // Refresh logs
      setTimeout(async () => {
        const res = await axios.get('http://localhost:5000/api/calls/logs', { headers: { Authorization: `Bearer ${token}` } })
        setLogs(res.data)
      }, 2000)
    } catch (err) {
      alert("Launch failed. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Main>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">Launch AI outreach and track real-time activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Step 1: Select Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUserCheck className="text-indigo-600" /> 1. Select Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent._id}
                onClick={() => setSelectedAgentId(agent._id)}
                className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-sm ${
                  selectedAgentId === agent._id 
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100' 
                    : 'hover:bg-slate-50 border-slate-200'
                }`}
              >
                <p className="font-bold text-slate-900">{agent.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{agent.role}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 2: Launch Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconRocket className="text-orange-500" /> 2. Launch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Number</label>
              <Input 
                placeholder="+1 234 567 8900" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-11"
              />
            </div>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" 
              disabled={loading || !selectedAgentId} 
              onClick={handleLaunch}
            >
              {loading ? "Connecting to AI..." : "Start AI Campaign"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Call Logs */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconHistory className="text-slate-500" /> Recent Activity
          </CardTitle>
          <CardDescription>Track the performance of your AI agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Recipient</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                    No recent calls. Start a campaign to see logs here.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <IconPhoneIncoming size={14} className="text-slate-400" />
                      {log.to}
                    </TableCell>
                    <TableCell>{log.agentId?.name || 'AI'}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'completed' ? 'default' : 'secondary'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Main>
  )
}