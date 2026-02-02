import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { IconUpload, IconTrash, IconLoader2 } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { bulkImportContacts } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

interface ContactsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
}

interface ParsedContact {
  name: string
  phone: string
}

export function ContactsImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: ContactsImportDialogProps) {
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const contacts: ParsedContact[] = results.data
          .filter((row: any) => row.name && row.phone)
          .map((row: any) => ({
            name: String(row.name).trim(),
            phone: String(row.phone).trim(),
          }))

        setParsedContacts(contacts)
        toast({
          title: 'File parsed successfully',
          description: `Found ${contacts.length} contacts to import.`,
        })
      },
      error: (error) => {
        toast({
          title: 'Parse error',
          description: error.message,
          variant: 'destructive',
        })
      },
    })
  }

  const removeContact = (index: number) => {
    setParsedContacts((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImport = async () => {
    if (parsedContacts.length === 0) return

    setIsImporting(true)
    try {
      await bulkImportContacts(parsedContacts)
      toast({
        title: 'Import successful',
        description: `Imported ${parsedContacts.length} contacts.`,
      })
      setParsedContacts([])
      onImportSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: 'Import failed',
        description: error.response?.data?.message || 'Failed to import contacts.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setParsedContacts([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <IconUpload className="mr-2 h-4 w-4" />
              Select CSV File
            </Button>
          </div>

          {parsedContacts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Preview ({parsedContacts.length} contacts)
              </h3>
              <div className="rounded-md border max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedContacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell className="font-mono">
                          {contact.phone}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContact(index)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedContacts.length === 0 || isImporting}
          >
            {isImporting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Import ({parsedContacts.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}