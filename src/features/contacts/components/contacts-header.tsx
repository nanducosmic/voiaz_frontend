import { IconUsers, IconDownload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface ContactsHeaderProps {
  onImportClick: () => void
}

export function ContactsHeader({ onImportClick }: ContactsHeaderProps) {
  const downloadCsvTemplate = () => {
    const csvContent = 'name,phone\nJohn Doe,+1234567890\nJane Smith,+0987654321'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'contacts_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconUsers size={32} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Manager</h1>
          <p className="text-muted-foreground">
            Manage your contacts and import new ones from CSV files.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={downloadCsvTemplate}>
          <IconDownload size={16} className="mr-2" />
          Download CSV Template
        </Button>
        <Button onClick={onImportClick}>
          Import Contacts
        </Button>
      </div>
    </div>
  )
}