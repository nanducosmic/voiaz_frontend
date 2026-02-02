import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Contact } from '../data/schema'

interface ContactsContextType {
  selectedContacts: Contact[]
  setSelectedContacts: (contacts: Contact[]) => void
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])

  return (
    <ContactsContext.Provider value={{ selectedContacts, setSelectedContacts }}>
      {children}
    </ContactsContext.Provider>
  )
}

export function useContacts() {
  const context = useContext(ContactsContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider')
  }
  return context
}