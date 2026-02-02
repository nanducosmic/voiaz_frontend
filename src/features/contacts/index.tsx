import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getContacts } from '@/services/api'
import { contactListSchema } from './data/schema'
import { ContactsHeader } from './components/contacts-header'
import { ContactsTable } from './components/contacts-table'
import { ContactsImportDialog } from './components/contacts-import-dialog'
import { ContactsProvider } from './components/contacts-provider'

export function Contacts() {
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await getContacts()
      return contactListSchema.parse(response.data)
    },
  })

  return (
    <ContactsProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-6">
        <ContactsHeader onImportClick={() => setImportDialogOpen(true)} />

        <ContactsTable
          contacts={contacts}
          isLoading={isLoading}
        />

        <ContactsImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImportSuccess={refetch}
        />
      </div>
    </ContactsProvider>
  )
}