
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFullHistory } from '@/services/api';
import { cn } from '@/lib/utils';

export function History() {
  const [calls, setCalls] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<any | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getFullHistory(page)
      .then((res: { data: any }) => {
        setCalls(res.data.calls || []);
        setPagination(res.data.pagination || {});
        setLoading(false);
      })
      .catch(() => {
        setError('Could not fetch data from your API. Ensure your backend server is running.');
        setLoading(false);
      });
  }, [page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-12 text-center">
        <h2 className="text-xl font-bold mb-2">Loading...</h2>
        <p className="text-muted-foreground max-w-xs">Fetching call history data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-12 text-center">
        <h2 className="text-xl font-bold mb-2">Connection Issue</h2>
        <p className="text-muted-foreground max-w-xs">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Call History</h1>
        </div>
        {pagination.grandTotalBurn > 0 && (
          <Badge variant="outline" className="px-3 py-1 text-xs font-mono bg-white shadow-sm border-indigo-100 text-indigo-700">
            Total Burn: {pagination.grandTotalBurn.toFixed(2)}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Sidebar: Call List */}
        <div className="w-1/3 min-w-[260px] max-w-xs flex flex-col h-full">
          <Card className="flex flex-col flex-1 shadow-sm overflow-hidden border-slate-200 h-full">
            <CardHeader className="border-b bg-slate-50/50 py-3 flex-shrink-0">
              <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                Recent Interactions ({pagination.totalCalls})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin">
              {calls.map((call) => (
                <div
                  key={call._id}
                  onClick={() => setSelectedCall(call)}
                  className={cn(
                    'p-4 cursor-pointer transition-all border-l-4',
                    selectedCall?._id === call._id
                      ? 'bg-indigo-50 border-indigo-500'
                      : 'border-transparent hover:bg-slate-50'
                  )}
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
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs font-bold">Page {pagination.currentPage} / {pagination.totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
        {/* Main: Chat Interface */}
        <div className="w-2/3 flex flex-col h-full min-w-0">
          <Card className="flex flex-col flex-1 shadow-md overflow-hidden border-slate-200 h-full">
            <CardHeader className="border-b bg-slate-50/50 flex-shrink-0">
              <CardTitle className="text-lg">Conversation</CardTitle>
              {selectedCall && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{selectedCall.phone}</span>
                    <Badge variant="secondary" className="text-[9px]">{selectedCall.status}</Badge>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs font-mono text-muted-foreground">Cost: {selectedCall.cost}</span>
                    <span className="text-xs font-mono text-muted-foreground">Duration: {selectedCall.duration}s</span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {selectedCall ? (
                <ChatInterface transcript={selectedCall.transcript} summary={selectedCall.summary} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-30">
                  <p className="text-sm font-bold mt-2">SELECT A CALL TO VIEW DETAILS</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

// --- ChatInterface Component ---
function ChatInterface({ transcript, summary }: { transcript?: string; summary?: string }) {
  // Parse transcript: "assistant: text\nuser: text"
  const messages = (transcript || '').split(/\n+/).map((line) => {
    const [role, ...rest] = line.split(':');
    return { role: role?.trim(), text: rest.join(':').trim() };
  }).filter(m => m.text);

  return (
    <div className="flex flex-col gap-4 h-full p-6 overflow-y-auto">
      {/* Summary Section */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-2">
        <div className="text-xs font-bold text-indigo-700 uppercase mb-1">Summary</div>
        <div className="text-sm text-indigo-900 font-medium">{summary || 'No summary available.'}</div>
      </div>
      {/* Chat Bubbles */}
      <div className="flex flex-col gap-2 flex-1">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground opacity-50 mt-8">No transcript available.</div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              'flex',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[70%] px-4 py-2 rounded-lg text-sm whitespace-pre-line',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
}
