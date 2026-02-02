import { createFileRoute } from '@tanstack/react-router'
import { SettingsProfile } from '@/features/settings/profile'

// Remove the trailing slash, TanStack Router prefers the clean path
export const Route = createFileRoute('/_authenticated/settings/')({
  component: SettingsProfile,
})