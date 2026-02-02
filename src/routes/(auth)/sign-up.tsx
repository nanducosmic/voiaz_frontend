import { createFileRoute, redirect } from '@tanstack/react-router'
import { SignUp } from '@/features/auth/sign-up'

export const Route = createFileRoute('/(auth)/sign-up')({
  beforeLoad: () => {
    try {
      // Direct check of storage
      const userRaw = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (token && userRaw) {
        // Only redirect if we are 100% sure they are logged in
        throw redirect({ 
          to: '/dashboard',
          replace: true 
        })
      }
    } catch (e) {
      // If the error is a TanStack redirect, we MUST throw it
      if (e instanceof Error && (e as any).isRedirect) throw e
      
      // Otherwise, ignore the error and just let the page load
      console.error('Auth guard failed safely:', e)
    }
  },
  component: SignUp,
})