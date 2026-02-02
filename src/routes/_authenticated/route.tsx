import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const storedToken = localStorage.getItem('token')
    const contextToken = context.auth?.token

    const activeToken = storedToken || contextToken

    const isAuthenticated =
      !!activeToken &&
      activeToken !== 'undefined' &&
      activeToken !== 'null'

    if (!isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    return {
      auth: context.auth,
    }
  },
  component: () => (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  ),
})
