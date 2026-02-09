import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
// --- CHANGE HERE: Import from TanStack ---
import { useNavigate } from '@tanstack/react-router'; 
import {
  getContactLists,
  createContactList,
  importExcelContacts,
  getContacts as apiGetContacts
} from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconFolder, IconChevronLeft, IconUpload, IconRocket } from '@tabler/icons-react';

// Types
interface ContactList {
  id: string;
  _id?: string;
  name: string;
  createdAt: string;
}
interface Contact {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  status: 'pending' | 'completed' | 'failed' | 'calling' | 'no-answer' | 'busy';
  retries: number;
}

const statusColor: Record<string, string> = {
  pending: 'text-yellow-500',
  calling: 'text-blue-500',
  completed: 'text-green-600',
  failed: 'text-red-500',
  'no-answer': 'text-red-500',
  busy: 'text-red-500',
};

export function ContactJournal() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- CHANGE HERE: Initialize TanStack Navigate ---
  const navigate = useNavigate(); 

  // Fetch lists
  const { data: lists = [], isLoading: listsLoading } = useQuery<ContactList[]>({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const res = await getContactLists();
      return res.data;
    },
  });

  // Fetch contacts for selected list
  const {
    data: contacts = [],
    isLoading: contactsLoading,
  } = useQuery<Contact[]>({
    queryKey: ['contacts', selectedListId],
    queryFn: async () => {
      if (!selectedListId) return [];
      const res = await apiGetContacts({ list_id: selectedListId }); 
      return res.data;
    },
    enabled: !!selectedListId,
  });

  const selectedList = lists.find((l) => l._id === selectedListId);

  // --- CHANGE HERE: TanStack Router navigation logic ---
  const handleLaunchCampaign = () => {
    if (selectedListId) {
      navigate({
        to: '/campaigns',
        search: (prev: any) => ({ ...prev, list_id: selectedListId }),
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4">
        {selectedListId ? (
          <>
            <Button variant="ghost" size="icon" onClick={() => setSelectedListId(null)}>
              <IconChevronLeft />
            </Button>
            <span className="font-semibold text-lg">Journal</span>
            <span className="mx-1 text-gray-400">&gt;</span>
            <span className="font-bold text-lg">{selectedList?.name}</span>
          </>
        ) : (
          <h2 className="text-2xl font-bold">Phone Book Journal</h2>
        )}
        <div className="flex-1" />
        
        {!selectedListId && (
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <IconUpload className="mr-2 h-4 w-4" />
            Global Import
          </Button>
        )}

        {selectedListId && (
          <Button 
            className="ml-2 bg-indigo-600 hover:bg-indigo-700" 
            variant="default"
            onClick={handleLaunchCampaign}
          >
            <IconRocket className="mr-2 h-4 w-4" />
            Launch Campaign
          </Button>
        )}
      </div>

      {/* Folder Grid */}
      {!selectedListId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listsLoading ? (
            <div>Loading...</div>
          ) : lists.length === 0 ? (
            <div>No lists found.</div>
          ) : (
            lists.map((list) => (
              <div key={list._id} className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm bg-white">
                <div className="flex items-center gap-2">
                  <IconFolder className="text-blue-500" />
                  <span className="font-semibold text-lg">{list.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(list.createdAt).toLocaleDateString()}
                </div>
                <Button className="mt-2" onClick={() => setSelectedListId(list._id || null)}>
                  View Contacts
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contact Table */}
      {selectedListId && (
        <div className="rounded-md border bg-white p-4">
          {contactsLoading ? (
            <div>Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div>No contacts found in this list.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact._id ?? contact.id ?? contact.phone}>
                    <TableCell>{contact.name || "Unknown"}</TableCell>
                    <TableCell className="font-mono">{contact.phone}</TableCell>
                    <TableCell>
                      <span className={statusColor[contact.status || 'pending'] || 'text-yellow-500'}>
                        {contact.status || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>{contact.retries ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {/* Global Import Modal */}
      <Dialog open={importOpen} onOpenChange={(open) => {
        setImportOpen(open);
        if (!open) {
          setListName('');
          setExcelFile(null);
          setImportLoading(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Global Import</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!listName.trim() || !excelFile) return;
              setImportLoading(true);
              try {
                const resList = await createContactList({ name: listName.trim() });
                const listData = resList.data;
                const listId = listData._id || listData.id;
                if (!listId) throw new Error('No list_id returned');
                
                const formData = new FormData();
                formData.append('file', excelFile);
                formData.append('list_id', listId);
                
                await importExcelContacts(formData);
                await queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
                setImportOpen(false);
              } catch (err) {
                alert((err as Error).message);
              } finally {
                setImportLoading(false);
              }
            }}
          >
            <label className="flex flex-col gap-1">
              <span className="font-medium">Batch/List Name <span className="text-red-500">*</span></span>
              <input
                type="text"
                className="input input-bordered px-3 py-2 rounded border"
                value={listName}
                onChange={e => setListName(e.target.value)}
                required
                placeholder="e.g. Real Estate Leads Feb"
                disabled={importLoading}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium">Excel File <span className="text-red-500">*</span></span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="input input-bordered px-3 py-2 rounded border"
                onChange={e => setExcelFile(e.target.files?.[0] || null)}
                required
                disabled={importLoading}
              />
            </label>
            <Button type="submit" disabled={importLoading || !listName.trim() || !excelFile}
              className="mt-2">
              {importLoading ? 'Importing...' : 'Import'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}