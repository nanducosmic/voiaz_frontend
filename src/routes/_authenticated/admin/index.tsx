import { createFileRoute, redirect } from '@tanstack/react-router'
import { store } from '@/stores'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/admin/')({
  beforeLoad: () => {
    const { user, isAuthenticated } = store.getState().auth

    // 1. Check if authenticated
    if (!isAuthenticated) {
      throw redirect({ to: '/sign-in' })
    }

    // 2. Flexible Super Admin check
    // We check for 'superadmin' OR 'super_admin' to be safe
    const userRole = String(user?.role).toLowerCase();
    const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';

    if (!isSuperAdmin) {
      toast.error('Access Denied: Super Admin permissions required.')
      throw redirect({
        to: '/', 
      })
    }
  },
})