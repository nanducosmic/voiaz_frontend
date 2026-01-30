import { createLazyFileRoute } from '@tanstack/react-router'
import { useSelector } from 'react-redux'
// Fixed the typo!
import { type RootState } from '@/stores' 

export const Route = createLazyFileRoute('/_authenticated/agents/')({
  component: AgentsPage,
})

function AgentsPage() {
  // Now TypeScript will see 'state.auth' correctly
  const auth = useSelector((state: RootState) => state.auth)
  const user = auth?.user

  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold'>Agents Management</h1>
      
      {user?.role === 'superadmin' ? (
        <section className="mt-6 space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <h2 className="text-lg font-semibold text-indigo-700">Super Admin Dashboard</h2>
            <p className="text-sm text-indigo-600">Assign AI Personalities (Vikram, Neha) to your Sub-Users.</p>
          </div>
          {/* Assignment UI goes here */}
        </section>
      ) : (
        <section className="mt-6 space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <h2 className="text-lg font-semibold text-emerald-700">Client Agent Training</h2>
            <p className="text-sm text-emerald-600">Upload Reference Documents and set detailed AI prompts.</p>
          </div>
          {/* Training UI goes here */}
        </section>
      )}
    </div>
  )
}