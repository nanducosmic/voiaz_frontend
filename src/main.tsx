import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Provider, useSelector } from 'react-redux'
import { store } from './stores/index'
import { logout } from './stores/slices/authSlice'
import { toast } from 'sonner'
import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
import { TenantProvider } from './context/TenantContext';

// Generated Routes
import { routeTree } from './routeTree.gen'

// Styles
import './styles/index.css'

// 1. Define the Context Interface
export interface MyRouterContext {
  queryClient: QueryClient
  auth: ReturnType<typeof store.getState>['auth']
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (failureCount > 3) return false
        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          store.dispatch(logout()) 
          router.navigate({ to: '/sign-in' })
        }
      }
    },
  }),
})

// 2. Create the router
// Note: We cast the config object itself to MyRouterContext to satisfy 
// the internal type checks during initialization.
const router = createRouter({
  routeTree,
  context: { 
    queryClient,
    auth: undefined!, // Placeholder
  } as MyRouterContext,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// 3. Register the router instance for type safety
// This is the "Magic" that makes context work everywhere.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 4. The App component bridges Redux and Router
function App() {
  // Use 'any' here or your RootState type if defined
  const auth = useSelector((state: any) => state.auth)

  return (
    <TenantProvider>
      <RouterProvider<typeof router>
        router={router}
        context={{
          auth,
          queryClient
        }}
      />
    </TenantProvider>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <App />
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </StrictMode>
  )
}