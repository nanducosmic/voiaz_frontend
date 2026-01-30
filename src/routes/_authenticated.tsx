import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { store } from '@/stores'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = store.getState().auth
    
    // If user is NOT logged in, they can't touch anything inside this group
    if (!isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: () => <Outlet />, // This allows sub-pages to render
})