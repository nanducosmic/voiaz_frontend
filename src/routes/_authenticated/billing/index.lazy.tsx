import { useState, useEffect } from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  IconCreditCard, 
  IconReceipt, 
  IconWallet, 
  IconCircleCheck, 
  IconBolt, 
  IconLoader2,
  IconAlertCircle 
} from '@tabler/icons-react'

export const Route = createLazyFileRoute('/_authenticated/billing/')({
  component: BillingPage,
})

function BillingPage() {
  const [balance, setBalance] = useState(0)
  // 1. ALWAYS initialize as an empty array
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true)
      setError(false)
      try {
        const [creditsRes, historyRes] = await Promise.all([
          api.get('/credits/balance'),
          api.get('/credits/history')
        ])

        // 2. DEFENSIVE DATA EXTRACTION
        // Handles cases where backend sends { data: [] } or just []
        const rawBalance = creditsRes.data?.balance ?? creditsRes.data ?? 0
        const rawHistory = historyRes.data?.data || historyRes.data || []

        setBalance(typeof rawBalance === 'number' ? rawBalance : 0)
        setHistory(Array.isArray(rawHistory) ? rawHistory : [])
      } catch (err) {
        console.error("Error fetching billing data:", err)
        setError(true)
        setHistory([]) // Ensure it stays an array even on failure
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [])

  const pricingPlans = [
    { name: 'Starter', credits: 500, price: '₹4,999', popular: false },
    { name: 'Growth', credits: 2000, price: '₹14,999', popular: true },
    { name: 'Enterprise', credits: 5000, price: '₹34,999', popular: false },
  ]

  // Improved loading state: only shows full-page loader on initial empty load
  if (loading && history.length === 0 && balance === 0 && !error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <IconLoader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    )
  }

  return (
    <div className='p-6 space-y-8'>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconCreditCard size={32} className="text-emerald-600" />
          <h1 className='text-2xl font-bold tracking-tight'>Billing & Subscription</h1>
        </div>
        {error && (
          <Badge variant="destructive" className="flex gap-1">
            <IconAlertCircle size={14} /> Backend Offline
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 bg-emerald-600 text-white border-none shadow-lg relative overflow-hidden">
          <CardHeader>
            <CardDescription className="text-emerald-100 uppercase text-[10px] font-bold tracking-widest">
              Current Balance
            </CardDescription>
            <CardTitle className="text-4xl font-black flex items-baseline gap-2">
              <IconWallet className="opacity-50" size={28} />
              {balance.toLocaleString()} 
              <span className="text-sm font-normal text-emerald-100 italic">Credits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
             <p className="text-xs text-emerald-100">Roughly ~{Math.floor(balance/2)} minutes of AI calling time.</p>
          </CardContent>
          <IconBolt className="absolute -right-4 -bottom-4 text-emerald-500 opacity-20" size={120} />
        </Card>

        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={`relative transition-all hover:shadow-md ${plan.popular ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600">Most Popular</Badge>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="text-2xl font-bold mt-1">{plan.price}</div>
              <CardDescription className="text-xs font-medium">{plan.credits} Call Credits</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" variant={plan.popular ? 'default' : 'outline'}>
                Recharge Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IconReceipt size={20} className="text-muted-foreground" />
            Transaction History
          </CardTitle>
          <CardDescription>View your recent credit top-ups and usage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b text-[10px] uppercase font-bold text-muted-foreground text-left">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* 3. SAFE MAP: Checking if it's an array before mapping */}
                {!Array.isArray(history) || history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                      {loading ? "Loading history..." : "No recent transactions found."}
                    </td>
                  </tr>
                ) : (
                  history.map((tx: any, idx: number) => (
                    <tr key={tx._id || tx.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {tx.referenceId || 'TXN-REF'}
                      </td>
                      <td className="p-4 font-bold text-emerald-600">
                        +{tx.credits || 0}
                      </td>
                      <td className="p-4 text-right">
                        <Badge variant="outline" className="text-[10px] uppercase bg-emerald-50 text-emerald-700 border-emerald-100 py-0.5">
                          <IconCircleCheck size={10} className="mr-1" /> Success
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}