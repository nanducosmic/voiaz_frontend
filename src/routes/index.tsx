import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined') {
      throw redirect({ to: '/sign-in' })
    }
    // If they are logged in, send them to dashboard
    throw redirect({ to: '/dashboard' })
  },
})