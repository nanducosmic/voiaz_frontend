import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// Badge component for source
function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        source === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
      }`}
    >
      {source === 'user' ? 'Personal' : 'Company'}
    </span>
  );
}

export default function CallHistory() {
  const [selectedCall, setSelectedCall] = useState<null | any>(null);

  // Fetch call history
  const { data, isLoading, error } = useQuery({
    queryKey: ['callHistory'],
    queryFn: async () => {
      const res = await axios.get('call-logs/history');
      return res.data;
    },
  });

  const calls = data?.calls || [];

  return (
    <div className="flex gap-6">
      {/* Recent Interactions List */}
      <div className="w-1/3 border-r pr-4">
        <h2 className="font-bold mb-2">Recent Interactions</h2>
        {isLoading && <div>Loading...</div>}
        {error && <div className="text-red-500">Error loading calls.</div>}
        <ul className="space-y-2">
          {calls.map((call: any) => (
            <li
              key={call._id}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${selectedCall?._id === call._id ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedCall(call)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{call.recipient}</span>
                <SourceBadge source={call.source} />
              </div>
              <div className="text-xs text-gray-500">
                {new Date(call.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Conversation Intel Panel */}
      <div className="w-2/3 pl-4">
        <h2 className="font-bold mb-2">Conversation Intel</h2>
        {selectedCall ? (
          <div>
            <div className="mb-2">
              <span className="font-semibold">Transcript:</span>
              <div className="bg-gray-50 p-2 rounded mt-1 text-sm whitespace-pre-wrap">
                {selectedCall.transcript || 'No transcript available.'}
              </div>
            </div>
            <div>
              <span className="font-semibold">Summary:</span>
              <div className="bg-gray-50 p-2 rounded mt-1 text-sm">
                {selectedCall.summary || 'No summary available.'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Select a call to view details.</div>
        )}
      </div>
    </div>
  );
}
