import { createLazyFileRoute } from '@tanstack/react-router'
import Contacts from '@/features/contacts'

export const Route = createLazyFileRoute('/_authenticated/contacts/')({
  component: Contacts,
})