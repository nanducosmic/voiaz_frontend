import { useState, useEffect, useRef } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from "@/hooks/use-toast"
import { 
  IconUsers, 
  IconUserPlus, 
  IconDatabaseImport, 
  IconLoader2, 
  IconFileSpreadsheet, 
  IconTrash,
  IconSearch,
  IconAlertCircle 
} from '@tabler/icons-react'
import * as XLSX from 'xlsx'

export const Route = createLazyFileRoute('/_authenticated/contacts/')({
  component: ContactsPage,
})

function ContactsPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 1. ALWAYS initialize as an empty array to prevent .filter/.map crashes
  const [contacts, setContacts] = useState<any[]>([])
  const [rawInput, setRawInput] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    setFetching(true)
    setError(false)
    try {
      const res = await api.get('/contacts/summary')
      
      // 2. DEFENSIVE DATA GRABBING
      // Extract array regardless of if it's res.data or res.data.data
      const data = res.data?.data || res.data || []
      setContacts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load contacts")
      setError(true)
      setContacts([]) // Keep it as an array on failure
    } finally {
      setFetching(false)
    }
  }

  // 3. SAFE FILTERING
  // This is where your specific error was happening. 
  // We check if contacts is an array before calling .filter()
  const filteredContacts = Array.isArray(contacts) 
    ? contacts.filter(c => 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone?.includes(searchTerm)
      )
    : []

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][]

        const formatted = data
          .slice(1) 
          .filter(row => row[0] && row[1]) 
          .map(row => `${row[0]}, ${row[1]}`)
          .join('\n')
        
        setRawInput(formatted)
        toast({ 
          title: "File Parsed", 
          description: `Extracted ${formatted.split('\n').length} leads from Excel.` 
        })
      } catch (err) {
        toast({ title: "Parse Error", description: "Invalid Excel format.", variant: "destructive" })
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!rawInput.trim()) return
    setIsImporting(true)
    try {
      await api.post('/contacts/import', { csvData: rawInput })
      toast({ title: "Import Successful", description: "Leads added to database." })
      setRawInput("")
      fetchContacts()
    } catch (error: any) {
      toast({ 
        title: "Import Failed", 
        description: error.response?.data?.message || "Check your formatting.", 
        variant: "destructive" 
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className='p-6 space-y-6'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconUsers size={32} className="text-blue-600" />
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Lead Management</h1>
            {error && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <IconAlertCircle size={12} /> Connection to backend failed
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-green-200 hover:bg-green-50">
            <IconFileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
            Upload Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Import Form */}
        <Card className="lg:col-span-1 border-blue-100 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <IconUserPlus size={20} className="text-blue-500" />
              Import Leads
            </CardTitle>
            <CardDescription>Format: Name, Phone Number</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRawInput("")}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <IconTrash size={14} className="mr-1" />
                Clear List
              </Button>
            </div>
            <Textarea 
              placeholder="Ex: Vikram, +919876543210"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="min-h-[300px] font-mono text-[11px] leading-relaxed resize-none focus-visible:ring-blue-500"
            />
            <Button onClick={handleImport} disabled={isImporting || !rawInput.trim()} className="w-full bg-blue-600 hover:bg-blue-700">
              {isImporting ? <IconLoader2 className="animate-spin mr-2" /> : <IconDatabaseImport className="mr-2" />}
              Push to Database
            </Button>
          </CardContent>
        </Card>

        {/* Right Side: Data Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Active Lead Database</CardTitle>
            <CardDescription>Manage and track your imported leads.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
              <div className="relative w-full md:w-80">
                <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search name or phone..."
                  className="w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Badge variant="outline" className="px-3 py-1.5 flex-1 md:flex-none justify-center">
                  Total: {Array.isArray(contacts) ? contacts.length : 0}
                </Badge>
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-left text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4 text-right">AI Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fetching ? (
                    <tr>
                      <td colSpan={3} className="p-12 text-center">
                        <IconLoader2 className="animate-spin mx-auto text-blue-600" size={24} />
                        <p className="text-xs text-muted-foreground mt-2">Loading leads...</p>
                      </td>
                    </tr>
                  ) : filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-16 text-center text-muted-foreground italic">
                        <IconUsers size={40} className="mx-auto opacity-10 mb-2" />
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c, i) => (
                      <tr key={c._id || i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{c.phone}</td>
                        <td className="p-4 text-right">
                          <Badge 
                            variant={c.status === 'completed' ? 'default' : 'secondary'} 
                            className={`text-[9px] uppercase ${c.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : ''}`}
                          >
                            {c.status || 'PENDING'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}