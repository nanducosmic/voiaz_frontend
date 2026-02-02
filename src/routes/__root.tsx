import {
  createRootRouteWithContext,
  Outlet,
  redirect,
  useRouter, // 1. Import useRouter
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import type { MyRouterContext } from '@/main'

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: ({ context, location }) => {
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/otp']

    const isPublicPath = publicPaths.some(
      (path) => location.pathname === path
    )

    const token = context.auth?.token || localStorage.getItem('token')
    const isAuthenticated = !!token && token !== 'undefined' && token !== 'null'

    // LOGIC A: If user is NOT logged in and tries to access a private page -> Send to Sign In
    if (!isPublicPath && !isAuthenticated) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: location.href,
        },
      })
    }

    // LOGIC B: If user IS logged in and tries to access Sign In/Sign Up -> Send to Dashboard
    // This prevents logged-in users from seeing the Sign-Up page again.
    if (isPublicPath && isAuthenticated) {
      throw redirect({
        to: '/', // or wherever your dashboard is
      })
    }
  },

  component: () => {
    // 2. Access the context via the router instance
    // This fixes the 'Property useContext does not exist' error
    const router = useRouter()
    const { queryClient } = router.options.context as MyRouterContext

    return (
      <>
        <NavigationProgress />
        <Outlet />
        <Toaster duration={5000} />

        {import.meta.env.MODE === 'development' && (
          <>
            {/* 3. Passing the client here fixes the 'QueryClient is never read' error */}
            <ReactQueryDevtools client={queryClient} buttonPosition="bottom-left" />
            <TanStackRouterDevtools position="bottom-right" />
          </>
        )}
      </>
    )
  },

  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})