import { useState, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import api from '@/lib/api' // Using the central API instance
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  IconHistory, 
  IconMessage2, 
  IconPhoneOutgoing, 
  IconClock, 
  IconUser,
  IconChevronRight,
  IconLoader2
} from '@tabler/icons-react'

export const Route = createLazyFileRoute('/_authenticated/history/')({
  component: CallHistoryPage,
})

function CallHistoryPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        // CLEAN: URL is relative, token is handled automatically
        const res = await api.get('/calls/logs')
        
        // Defensive check: Handle different backend response structures
        const rawData = res.data?.data || res.data || []
        setLogs(Array.isArray(rawData) ? rawData : [])
      } catch (err) {
        console.error("Fetch failed:", err)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center gap-2">
        <IconHistory size={32} className="text-indigo-600" />
        <h1 className='text-2xl font-bold tracking-tight'>Call History</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Side: Call List */}
        <Card className="lg:col-span-2 h-[calc(100vh-180px)] flex flex-col shadow-sm overflow-hidden">
          <CardHeader className='border-b bg-muted/5'>
            <CardTitle className='text-sm uppercase tracking-widest text-muted-foreground'>Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin">
            <div className="divide-y">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <IconLoader2 className="animate-spin mb-2" size={24} />
                  <p className="text-xs italic">Syncing logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm italic">
                  No calls recorded yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log._id} 
                    onClick={() => setSelectedCall(log)}
                    className={`p-4 cursor-pointer transition-all hover:bg-muted/50 border-l-4 ${
                      selectedCall?._id === log._id 
                        ? 'bg-indigo-50/50 border-indigo-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm flex items-center gap-2">
                        <IconUser size={14} className='text-indigo-400' />
                        {log.contactName || 'Prospect'}
                      </p>
                      <Badge variant={log.status === 'completed' ? 'default' : 'outline'} className="text-[9px] uppercase">
                        {log.duration || '0s'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{log.to || log.contactPhone}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconClock size={12}/> 
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      <IconChevronRight size={14} className={selectedCall?._id === log._id ? 'text-indigo-500' : 'text-slate-300'} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Transcript & Details */}
        <Card className="lg:col-span-3 h-[calc(100vh-180px)] flex flex-col shadow-md overflow-hidden">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                    <IconMessage2 size={20} />
                </div>
                <div>
                    <CardTitle className="text-lg">Conversation Intel</CardTitle>
                    <CardDescription>AI Transcript and metadata</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-slate-50/30">
            {selectedCall ? (
              <div className="space-y-6">
                {/* Transcript Display */}
                <div className="rounded-xl border bg-white p-6 shadow-sm border-indigo-50">
                  <h4 className="text-[10px] font-bold uppercase text-indigo-500 mb-4 tracking-widest">Full Transcript</h4>
                   {selectedCall.transcript ? (
                     <div className="space-y-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 italic border-l-2 border-indigo-100 pl-4">
                          "{selectedCall.transcript}"
                        </p>
                     </div>
                   ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic">
                        <IconPhoneOutgoing size={40} className="mb-2 opacity-10" />
                        <p className="text-sm">No speech was captured for this interaction.</p>
                    </div>
                   )}
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='p-4 rounded-xl bg-white border shadow-sm'>
                        <p className='text-muted-foreground mb-1 uppercase font-bold text-[9px] tracking-tighter'>Session ID</p>
                        <p className='font-mono text-[10px] break-all'>{selectedCall._id}</p>
                    </div>
                    <div className='p-4 rounded-xl bg-white border shadow-sm'>
                        <p className='text-muted-foreground mb-1 uppercase font-bold text-[9px] tracking-tighter'>Agent Assigned</p>
                        <p className='text-sm font-medium'>{selectedCall.agentId?.name || 'Standard Agent'}</p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center space-y-4 p-12">
                <div className="relative">
                  <IconPhoneOutgoing size={64} className="opacity-10" />
                  <IconHistory size={24} className="absolute -bottom-2 -right-2 text-indigo-200" />
                </div>
                <div className="space-y-1">
                  <p className='font-medium text-slate-900 text-sm'>No Call Selected</p>
                  <p className='text-xs max-w-[220px]'>Pick a record from the history panel to analyze the AI performance and transcripts.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}