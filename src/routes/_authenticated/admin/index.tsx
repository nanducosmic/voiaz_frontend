import { createFileRoute, redirect } from '@tanstack/react-router'
import { store } from '@/stores'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: () => {
    // Access Redux state directly from the store
    const auth = store.getState().auth
    const user = auth.user
    const isAuthenticated = auth.isAuthenticated

    // 1. If not logged in, force redirect to sign-in
    if (!isAuthenticated) {
      throw redirect({ 
        to: '/sign-in' 
      })
    }

    // 2. Flexible role check
    // We lowercase the role and check for both common spellings
    const userRole = String(user?.role || '').toLowerCase()
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin'

    if (!isSuperAdmin) {
      // Log the actual role found to the console for debugging
      console.warn("Access Denied. User role is:", userRole)
      
      toast.error('Access Denied: Super Admin permissions required.')
      
      // ✅ Using "/" because your error log confirmed it's a valid type-safe path
      throw redirect({ 
        to: '/' 
      }) 
    }
  },
})