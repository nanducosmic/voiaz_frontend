import { useState, useEffect } from 'react'

import { useQuery } from '@tanstack/react-query';

import api from '@/services/api'

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

  IconAlertCircle,

  IconFolder

} from '@tabler/icons-react'

import { getRouteApi } from '@tanstack/react-router';

import { getContactListById } from '@/services/api'



// 1. Define the Agent type

interface Agent {

  _id: string;

  name: string;

  role: string;

  tenant_id?: string; // Added to match backend and fix error

  gender?: string; // Added to support gender selection

}



const route = getRouteApi('/_authenticated/campaigns/');



export function Campaigns() {

  // const { toast } = useToast();

  const [agents, setAgents] = useState<Agent[]>([])

  const [selectedFolderName, setSelectedFolderName] = useState<string>("");

  const [activeLogs, setActiveLogs] = useState<any>(null)

  const [selectedAgentId, setSelectedAgentId] = useState('')

  // 1. Update the State & Initialization
  const [selectedVoiceId, setSelectedVoiceId] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('')

  const [loading, setLoading] = useState(false)

  const [fetching, setFetching] = useState(true)

  const [error, setError] = useState(false)



  const search = route.useSearch() || {};

  const listId = (search as any).list_id ?? undefined;

  const {

    data: activeList,

  } = useQuery({

    queryKey: ['contact-list', listId],

    queryFn: async () => {

      if (!listId) return null;

      // Debug log for network call

      console.log('Fetching list:', listId, 'Full URL:', api.defaults.baseURL + '/contact/lists/' + listId);

      const res = await getContactListById(listId);

      // Handle both single and double data wrapping

      return res.data?.data || res.data;

    },

    enabled: !!listId,

  })



  // Removed unused variable: listData



  // Update selectedFolderName when activeList changes

  useEffect(() => {

    if (activeList?.name) {

      setSelectedFolderName(activeList.name);

    } else if ((search as any).list_id) {

      setSelectedFolderName((search as any).list_id);

    }

  }, [activeList, search]);



  useEffect(() => {

    const fetchData = async () => {

      setFetching(true)

      setError(false)

      try {

        // Fetch agents and logs independently so logs failure doesn't block folder name

        const agentsPromise = api.get('/agent');

        const logsPromise = api.get('/call-logs/history');

        let agentsRes, logsRes;

        try {

          agentsRes = await agentsPromise;

        } catch (err) {

          agentsRes = { data: [] };

        }

        try {

          logsRes = await logsPromise;

        } catch (err) {

          logsRes = { data: [] };

        }

        // Always flatten agent array (emergency fix)
        const data = agentsRes.data?.data || agentsRes.data || [];
        setAgents(Array.isArray(data) ? data : [data]);
        if (Array.isArray(data) && data.length === 0) {
          const fallback = [
            { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
            { _id: 'n1', name: 'Neha', role: 'Customer Support' }
          ];
          setAgents(fallback);
          setSelectedAgentId(fallback[0]._id); // Pre-select first (Main Knowledge Base)
        } else if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          setSelectedAgentId(first._id || first.id || '');
        }
        setActiveLogs(logsRes.data || logsRes);

      } catch (err) {

        console.error("Fetch failed:", err);

        setError(true);

        const fallback = [
          { _id: 'v1', name: 'Vikram', role: 'Sales Appointment Setter' },
          { _id: 'n1', name: 'Neha', role: 'Customer Support' }
        ];
        setAgents(fallback);
        setSelectedAgentId(fallback[0]._id);
        setActiveLogs({ calls: [] });

      } finally {

        setFetching(false);

      }
    };
    fetchData();

  }, []);



  // Auto-select the first agent (voice) once agents load
  useEffect(() => {
    if (agents.length > 0 && !selectedVoiceId) {
      setSelectedVoiceId(agents[0]._id);
    }
  }, [agents]);

  // 2. Replace the handleStartCampaign Logic
  const handleStartCampaign = async () => {
    setLoading(true);
    try {
      // Set gender and agent name based on dropdown value
      let genderValue = 'male';
      let selectedName = '';
      let agentId = '';
      if (selectedVoiceId === 'v1') {
        genderValue = 'male';
        selectedName = 'VIKRAM';
        agentId = 'v1';
      } else if (selectedVoiceId === 'n1') {
        genderValue = 'female';
        selectedName = 'Neha';
        agentId = 'n1';
      }
      // LOG IT CLEARLY
      console.log('VOICE CHECK:', {
        selectedName,
        detectedGender: genderValue,
        fullPayload: { phoneNumber, gender: genderValue }
      });
      alert(`Voice Sync: Using ${selectedName || 'Default'} (${genderValue})`);
      const commonPayload = {
        gender: genderValue,
        tenant_id: '6978dcf7e35ccc43aeccbdc6',
        agent_id: agentId
      };
      if (phoneNumber && phoneNumber.trim() !== '') {
        await api.post('/calls/initiate', { ...commonPayload, phoneNumber });
      } else if (listId) {
        const contactRes = await api.get('/contacts?list_id=' + listId);
        const numbers = (contactRes.data || []).map((c: any) => c.phone).filter(Boolean);
        await api.post('/calls/initiate', { ...commonPayload, recipients: numbers });
      }
      alert('Call Initiated Successfully!');
    } catch (err: any) {
      alert('API Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log('Active List Data:', activeList);



  return (

    <Main>
      {/* DEBUG INFO - REMOVE IN PRODUCTION */}
      <div style={{ background: '#ffeeba', color: '#856404', padding: '8px', marginBottom: '16px', borderRadius: '6px', fontSize: '14px' }}>
        <strong>DEBUG:</strong> listId: {String(listId)}, selectedAgentId: {String(selectedAgentId)}, agents.length: {agents.length}
      </div>
      <div className="mb-6">

        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>

        <p className="text-muted-foreground">Launch AI outreach and track real-time activity.</p>

        {/* Target Information Box with debug and fallback */}

        <div className="mb-6 flex items-center gap-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 z-50 relative">

          <div className="bg-blue-200 rounded-full p-2 flex items-center justify-center">

            <IconFolder className="text-blue-700" size={28} />

          </div>

          <div>

            <div className="uppercase text-xs font-semibold text-blue-700 tracking-wider">Targeting File</div>

            <div className="text-2xl font-bold text-blue-900">{selectedFolderName || 'No folder selected'}</div>

          </div>

        </div>

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

              <IconUserCheck className="text-indigo-600" /> 1. Selected Knowledge Base

            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-3">

            {fetching && agents.length === 0 ? (

              <div className="flex justify-center py-4"><IconLoader2 className="animate-spin text-indigo-600" /></div>

            ) : (

              <>

                {agents.length === 1 ? (

                  <div className="p-4 border rounded-xl bg-indigo-50 border-indigo-600 ring-2 ring-indigo-100">

                    <p className="font-bold text-slate-900">{agents[0].name} (Main Knowledge Base)</p>

                    <p className="text-xs text-slate-500 uppercase tracking-wider">{agents[0].role}</p>

                  </div>

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

                <div className="mt-4">

                  <label className="block text-sm font-medium mb-1">Select Voice</label>
                  <select
                    className="border rounded px-3 py-2 w-full"
                    value={selectedVoiceId}
                    onChange={e => setSelectedVoiceId(e.target.value)}
                  >
                    <option value="">Select Voice</option>
                    <option value="v1">VIKRAM</option>
                    <option value="n1">Neha</option>
                  </select>

                </div>

              </>

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

              type="button"

              disabled={loading}

              onClick={handleStartCampaign}

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

                  <TableHead>Type</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Date</TableHead>

                </TableRow>

              </TableHeader>

              <TableBody>

                {console.log('Table Data:', activeLogs)}

                {/* SAFE CHECK: Ensure activeLogs is an object before accessing calls */}

                {console.log('RAW LOGS FROM API:', activeLogs)}

                {/* Use activeLogs?.calls for table data */}

                {(!Array.isArray(activeLogs?.calls || activeLogs?.data?.calls) || (activeLogs?.calls || activeLogs?.data?.calls || []).length === 0) ? (

                  <TableRow>

                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">

                      No recent calls found.

                    </TableCell>

                  </TableRow>

                ) : (

                  (activeLogs?.calls || activeLogs?.data?.calls || []).map((log: any) => (

                    <TableRow key={log._id || log.createdAt} className="transition-colors hover:bg-muted/50">

                      <TableCell className="font-medium">

                        <div className="flex items-center gap-2">

                          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 p-1 mr-1">

                            <IconPhoneIncoming size={14} className="text-blue-500" />

                          </span>

                          <span className="tracking-wide font-mono">{log.phone}</span>

                        </div>

                      </TableCell>

                      <TableCell>

                        AI Voice

                      </TableCell>

                      <TableCell>

                        {log.status === 'initiated' ? (

                          <Badge className="capitalize bg-blue-100 text-blue-700 border-blue-200">Initiated</Badge>

                        ) : log.status === 'completed' ? (

                          <Badge variant="default" className="capitalize">Completed</Badge>

                        ) : (

                          <Badge variant="secondary" className="capitalize">{log.status}</Badge>

                        )}

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

  );

}



export default Campaigns;