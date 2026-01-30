import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import api from '@/lib/api' // Using the central API instance
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconRobot, IconCircleCheck, IconLoader2, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

// 1. Define the Agent type to satisfy TypeScript
interface Agent {
  _id: string;
  name: string;
  role: string;
  provider?: string;
  language?: string;
}

export const Route = createFileRoute('/agents')({
  component: AgentsPage,
})

function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true)
      try {
        // Using central API: no need to manually handle headers or localhost strings
        const res = await api.get('/agent')
        
        if (res.data && res.data.length === 0) {
          // Fallback if DB is empty
          setAgents([
            { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
            { _id: 'n1', name: 'Neha', role: 'Customer Support' }
          ])
        } else {
          setAgents(res.data)
        }
      } catch (err) {
        console.error("Error fetching agents:", err)
        // Default fallbacks on error
        setAgents([
          { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
          { _id: 'n1', name: 'Neha', role: 'Customer Support' }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return (
    <Main>
      <div className='mb-8 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>AI Agents</h1>
          <p className='text-muted-foreground font-medium'>Manage and monitor your digital workforce.</p>
        </div>
        {/* Placeholder for future functionality */}
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
          <IconUserPlus size={18} className="mr-2" /> Hire New Agent
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <IconLoader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {agents.map((agent) => (
            <Card key={agent._id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-slate-50/50 border-b pb-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white rounded-xl border shadow-sm text-indigo-600">
                    <IconRobot size={24} />
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-1">
                    <IconCircleCheck size={12} className="mr-1" /> Active
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl font-bold text-slate-900">{agent.name}</CardTitle>
                <p className="text-sm text-indigo-600 font-semibold tracking-wide uppercase mt-1">
                  {agent.role}
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-sm space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-muted-foreground">Voice Provider</span>
                    <Badge variant="secondary" className="font-mono text-[10px] tracking-tighter">
                      {agent.provider || 'Vapi.ai'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Primary Language</span>
                    <span className="font-medium text-slate-700">{agent.language || 'English (US)'}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-6 text-xs font-bold uppercase tracking-widest border-slate-200 hover:bg-slate-50">
                  Configure Personality
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Main>
  )
}