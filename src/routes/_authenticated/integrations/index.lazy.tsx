import { createLazyFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  IconBrandGoogle, 
  IconWebhook, 
  IconPlugConnected, 
  IconCircleCheck,
  IconExternalLink,
  IconClock
} from '@tabler/icons-react'

export const Route = createLazyFileRoute('/_authenticated/integrations/')({
  component: IntegrationsPage,
})

function IntegrationsPage() {
  // Use environment variable for the API base to ensure it works in production
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const handleGoogleConnect = () => {
    // Redirects to the OAuth initiator on your backend
    window.location.href = `${API_BASE}/google/auth`;
  };

  const integrations = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Allow AI to check availability and book meetings directly into your calendar.',
      icon: <IconBrandGoogle className="text-red-500" />,
      connected: false, 
      action: 'Connect Calendar'
    },
    {
      id: 'webhooks',
      name: 'Outgoing Webhooks',
      description: 'Send call transcripts and lead data to your own CRM or Zapier automations.',
      icon: <IconWebhook className="text-blue-500" />,
      connected: false,
      action: 'Configure'
    }
  ]

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center gap-2">
        <IconPlugConnected size={32} className="text-indigo-600" />
        <h1 className='text-2xl font-bold tracking-tight'>Integrations</h1>
      </div>

      <p className="text-muted-foreground -mt-4">
        Connect your workspace tools to automate your AI calling workflow.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((item) => (
          <Card key={item.id} className="hover:border-indigo-200 transition-all hover:shadow-md border-slate-200">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">{item.icon}</div>
                <div>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <CardDescription className="max-w-[280px] leading-relaxed text-xs">
                    {item.description}
                  </CardDescription>
                </div>
              </div>
              {item.connected && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px] font-bold">
                  <IconCircleCheck size={10} className="mr-1" /> Connected
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <Button 
                onClick={item.id === 'google_calendar' ? handleGoogleConnect : undefined}
                variant={item.connected ? "outline" : "default"} 
                className={`w-full group ${!item.connected && 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                disabled={item.connected}
              >
                {item.connected ? 'Manage Settings' : item.action}
                {!item.connected && (
                  <IconExternalLink 
                    size={14} 
                    className="ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" 
                  />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Roadmap / Coming Soon Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <IconClock size={16} /> Coming Soon
        </h2>
        <div className="grid gap-4 md:grid-cols-3 opacity-60">
          {['Salesforce', 'HubSpot', 'WhatsApp Business'].map((crm) => (
            <div key={crm} className="p-4 border border-dashed rounded-lg bg-slate-50 flex items-center justify-between">
              <span className="text-sm font-medium">{crm}</span>
              <Badge variant="outline" className="text-[8px] uppercase">Alpha</Badge>
            </div>
          ))}
        </div>
      </div>

      <Card className="bg-indigo-50/30 border-dashed border-2 border-indigo-100">
        <CardContent className="p-10 flex flex-col items-center text-center space-y-3">
          <div className="p-2 bg-white rounded-full shadow-sm text-indigo-600">
             <IconPlugConnected size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-800">Need a custom enterprise connector?</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Our engineering team can build custom webhooks for your internal proprietary systems.
            </p>
          </div>
          <Button variant="link" className="text-indigo-600 text-xs font-bold">Contact Support</Button>
        </CardContent>
      </Card>
    </div>
  )
}