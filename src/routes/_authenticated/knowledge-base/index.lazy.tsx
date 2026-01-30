import { useState, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import api from '@/lib/api' // Using the central API instance
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/hooks/use-toast" 
import { Badge } from '@/components/ui/badge'
import { IconBrain, IconInfoCircle, IconBolt, IconDeviceFloppy } from '@tabler/icons-react'

export const Route = createLazyFileRoute('/_authenticated/knowledge-base/')({
  component: KnowledgeBasePage,
})

function KnowledgeBasePage() {
  const { toast } = useToast()
  const [aiPrompt, setAiPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const res = await api.get('/agent')
        // Assumes your backend returns the first agent or a specific config
        const agentData = Array.isArray(res.data) ? res.data[0] : res.data
        if (agentData?.prompt) setAiPrompt(agentData.prompt)
      } catch (err) {
        console.error("Load failed:", err)
      } finally {
        setFetching(false)
      }
    }
    loadPrompt()
  }, [])

  const handleUpdate = async () => {
    if (!aiPrompt.trim()) return
    setLoading(true)
    try {
      // CLEAN: Replaces saveAgent()
      await api.post('/agent', { name: "Main AI Agent", prompt: aiPrompt })
      toast({ 
        title: "AI Training Updated", 
        description: "Your agent's personality and instructions have been synced." 
      })
    } catch (error) {
      toast({ 
        title: "Update Failed", 
        variant: "destructive",
        description: "Ensure your backend is reachable and you are authorized."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBrain size={32} className="text-purple-600" />
          <h1 className='text-2xl font-bold tracking-tight'>AI Knowledge Base</h1>
        </div>
        <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
          <IconBolt size={12} className="mr-1" /> Vapi Engine v2
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Prompt Editor */}
        <Card className="lg:col-span-2 shadow-sm border-purple-100">
          <CardHeader>
            <CardTitle className="text-lg">System Instructions</CardTitle>
            <CardDescription>
              Define the core identity, goals, and constraints of your AI caller.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[500px] font-mono text-sm p-4 leading-relaxed focus-visible:ring-purple-500"
                placeholder={fetching ? "Loading agent instructions..." : "Example: You are Vikram, a helpful sales assistant..."}
                disabled={fetching}
              />
              {fetching && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <IconBrain className="animate-pulse text-purple-300" size={48} />
                </div>
              )}
            </div>
            <Button 
              onClick={handleUpdate} 
              disabled={loading || fetching} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <IconDeviceFloppy className="animate-spin mr-2" />
              ) : (
                <IconDeviceFloppy className="mr-2" />
              )}
              {loading ? "Saving to Cloud..." : "Save AI Instructions"}
            </Button>
          </CardContent>
        </Card>

        {/* Sidebar Help */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-none shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <IconInfoCircle size={16} className="text-blue-500" />
                Prompting Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-4 text-slate-600 leading-normal">
              <p>For best results, structure your prompt with these sections:</p>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Role:</strong> "You are an appointment setter for [Company]."</li>
                <li><strong>Tone:</strong> "Professional, energetic, and concise."</li>
                <li><strong>Objective:</strong> "Ask if they have 5 minutes for a demo next Tuesday."</li>
                <li><strong>Rules:</strong> "Never mention you are an AI. If asked, say you are a virtual assistant."</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-2 text-center">
              <CardDescription>Live Preview</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
               <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest h-8" disabled>
                 Test Chat (Soon)
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}