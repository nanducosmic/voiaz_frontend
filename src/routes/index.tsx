import { createFileRoute, redirect } from '@tanstack/react-router'
import '@/styles/index.css'
import '@/styles/theme.css'

// Example usage of api, hooks, and utils (for demonstration/global setup)
// You can use these in your components as needed

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
