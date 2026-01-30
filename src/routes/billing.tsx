import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconWallet, IconCreditCard } from '@tabler/icons-react'

export const Route = createFileRoute('/billing')({
  component: BillingPage,
})

function BillingPage() {
  return (
    <Main>
      <h1 className='text-3xl font-bold mb-6'>Billing & Wallet</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-indigo-100 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconWallet className="text-indigo-600" /> Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-900">$0.00</div>
            <p className="text-sm text-indigo-700/70 mt-1">Credits for AI calling time</p>
            <Button className="mt-6 bg-indigo-600 w-full">Add Credits</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCreditCard className="text-slate-600" /> Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">No payment methods saved</p>
            <Button variant="link" className="text-indigo-600">Connect Stripe</Button>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}