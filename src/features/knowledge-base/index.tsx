import { useState, useEffect } from 'react'
import api from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/hooks/use-toast"
import { Badge } from '@/components/ui/badge'
import { IconBrain, IconInfoCircle, IconBolt, IconDeviceFloppy } from '@tabler/icons-react'
import { Main } from '@/components/layout/main'

export function KnowledgeBasePage() {
  const { toast } = useToast()
  const [aiPrompt, setAiPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const res = await api.get('/agent')
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
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      // Get tenant_id from auth state or localStorage
      let tenant_id = null;
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      tenant_id = user?.tenant_id || user?.tenantId || localStorage.getItem('tenant_id') || localStorage.getItem('selectedTenantId');
      if (!tenant_id) {
        toast({
          title: 'Error',
          description: 'Tenant ID is missing. Cannot save AI Training.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      await api.post('/agent', {
        name: 'Main Knowledge Base',
        prompt: aiPrompt,
        bolnaAgentId: "",
        tenant_id
      });
      toast({
        title: 'AI Training Updated',
        description: 'Your AI prompt has been updated.',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: 'Could not update AI prompt.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Main>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrain className="w-5 h-5 text-indigo-500" />
              Knowledge Base
            </CardTitle>
            <CardDescription>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconInfoCircle className="w-4 h-4" />
                This is your AI assistant's training prompt. Update it to improve your bot's knowledge.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={8}
              placeholder="Enter your AI training prompt here..."
              className="font-mono text-sm"
              disabled={fetching}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleUpdate} disabled={loading || fetching}>
                <IconDeviceFloppy className="w-4 h-4 mr-2" />
                Save
              </Button>
              {loading && <Badge variant="secondary"><IconBolt className="w-3 h-3 animate-spin mr-1" />Saving...</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
