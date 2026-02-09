import { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconUpload } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useTenant } from '@/context/TenantContext';

export function ImportContactsButton({ onSuccess }: { onSuccess?: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { tenantId } = useTenant();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            const contacts = (results.data as any[]).map((row) => ({
              name: row.name,
              phone: row.phone,
              tenant_id: tenantId,
            }));
            await uploadContacts(contacts);
          },
          error: () => {
            toast({ title: 'Import failed', description: 'Could not parse CSV file.', variant: 'destructive' });
            setLoading(false);
          },
        });
      } else if (file.name.endsWith('.xlsx')) {
        toast({ title: 'XLSX not supported yet', description: 'Please use CSV for now.', variant: 'destructive' });
        setLoading(false);
      } else {
        toast({ title: 'Invalid file', description: 'Please select a .csv file.', variant: 'destructive' });
        setLoading(false);
      }
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const uploadContacts = async (contacts: any[]) => {
    try {
      await api.post('/contacts', contacts, {
        headers: {
          // Authorization and X-Tenant-ID are set by api interceptor
        },
      });
      toast({ title: 'Contacts imported', description: 'Contacts have been imported successfully.', variant: 'default' });
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.response?.data?.message || err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? <IconLoader2 className="animate-spin w-4 h-4" /> : <IconUpload className="w-4 h-4" />}
        Import Contacts
      </Button>
    </>
  );
}
