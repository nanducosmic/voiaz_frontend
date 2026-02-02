import { useState } from 'react';
import { useRouter, useSearch, createLazyFileRoute } from '@tanstack/react-router';
import { useLoaderData } from '@tanstack/react-router';
// Import the specific function to ensure the correct baseURL is used
import api, { getFullHistory } from '@/services/api'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  IconHistory, 
  IconMessage2, 
  IconPhoneOutgoing, 
  IconChevronLeft,
  IconChevronRight
} from '@tabler/icons-react'

// ... Keep your CallLog and CallHistoryResponse interfaces ...

export const Route = createLazyFileRoute('/_authenticated/history/')({
  validateSearch: (search: Record<string, unknown>): HistorySearch => {
    return {
      page: (search.page as string) || '1',
    }
  },
  loader: async ({ search }) => {
    const page = Number(search.page) || 1;
    const url = `/call-logs/history?page=${page}`;
    console.log('Fetching from backend:', url);
    const res = await api.get(url);
    return res.data;
  },
  // Link the component directly here
  component: CallHistoryPage,
})

function CallHistoryPage() {
  const loaderData = useLoaderData({ from: '/_authenticated/history/' });
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const router = useRouter();

  // If the loader fails or returns empty, show this state
  if (!loaderData || !loaderData.calls) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-12 text-center">
        <IconHistory size={64} className="mb-4 text-red-400 opacity-20" />
        <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
        <p className="text-muted-foreground max-w-xs">
          Could not fetch data from your API. Ensure your backend server is running on port 5000.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  const { calls, pagination } = loaderData;

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconHistory size={32} className="text-indigo-600" />
          <h1 className='text-2xl font-bold tracking-tight'>Call History</h1>
        </div>
        {pagination.grandTotalBurn > 0 && (
          <Badge variant="outline" className="px-3 py-1 text-xs font-mono bg-white shadow-sm border-indigo-100 text-indigo-700">
            Total Burn: ${pagination.grandTotalBurn.toFixed(2)}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Call List Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[calc(100vh-250px)] flex flex-col shadow-sm overflow-hidden border-slate-200">
            <CardHeader className='border-b bg-slate-50/50 py-3'>
              <CardTitle className='text-[10px] uppercase tracking-widest text-muted-foreground font-bold'>
                Recent Interactions ({pagination.totalCalls})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin">
              {calls.map((call) => (
                <div
                  key={call._id}
                  onClick={() => setSelectedCall(call)}
                  className={`p-4 cursor-pointer transition-all border-l-4 ${
                    selectedCall?._id === call._id ? 'bg-indigo-50 border-indigo-500' : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-slate-800">{call.phone}</p>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] mt-1">{call.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" size="sm" 
              disabled={!pagination.hasPrevPage}
              onClick={() => router.navigate({ search: { page: (pagination.currentPage - 1).toString() } })}
            >
              <IconChevronLeft size={16} /> Previous
            </Button>
            <span className="text-xs font-bold">Page {pagination.currentPage} / {pagination.totalPages}</span>
            <Button 
              variant="ghost" size="sm" 
              disabled={!pagination.hasNextPage}
              onClick={() => router.navigate({ search: { page: (pagination.currentPage + 1).toString() } })}
            >
              Next <IconChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Conversation Detail */}
        <Card className="lg:col-span-3 h-[calc(100vh-180px)] shadow-md overflow-hidden border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg">Conversation Intel</CardTitle>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto h-full scrollbar-thin">
            {selectedCall ? (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="text-[10px] font-bold uppercase text-indigo-500 mb-2">Transcript</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedCall.transcript || "No transcript available."}</p>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="text-[10px] font-bold uppercase text-indigo-600 mb-2">AI Summary</h4>
                  <p className="text-sm text-slate-800 font-medium">{selectedCall.summary || "Summary not generated."}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-30">
                <IconPhoneOutgoing size={48} />
                <p className="text-sm font-bold mt-2">SELECT A CALL TO VIEW DETAILS</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}