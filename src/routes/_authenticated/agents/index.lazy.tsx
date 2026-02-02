import { createLazyFileRoute } from '@tanstack/react-router'
import { Agents } from '@/features/agents'

export const Route = createLazyFileRoute('/_authenticated/agents/')({
  component: Agents,
})