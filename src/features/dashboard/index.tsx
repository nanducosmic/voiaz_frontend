import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { IconPhoneCall, IconClock, IconCalendarCheck, IconWallet } from '@tabler/icons-react'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'

// Define the shape of our stats for TypeScript
interface DashboardStats {
  totalCalls: number;
  minutesUsed: number;
  meetingsBooked: number;
  balance: number;
  totalRevenue?: number; // Optional in case backend uses 'balance' instead
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 0,
    minutesUsed: 0,
    meetingsBooked: 0,
    balance: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    // 1. Look for the token under all possible names
    const rawToken = 
      localStorage.getItem('token') || 
      localStorage.getItem('accessToken') || 
      localStorage.getItem('auth_token');

    // Handle nested 'user' object if necessary
    let token = rawToken;
    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          token = userData.token || userData.accessToken;
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }
    }

    if (!token || token === 'null' || token === 'undefined') {
      console.warn("No token found in storage.");
      return;
    }

    // 2. Clean and Send
    const cleanToken = token.replace(/['"]+/g, '').trim();

    axios.get('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${cleanToken}` }
    })
    .then(res => {
      // If backend sends 'balance' but you want to display it as 'totalRevenue'
      const data = res.data;
      if (data.balance !== undefined && data.totalRevenue === undefined) {
        data.totalRevenue = data.balance;
      }
      setStats(data);
    })
    .catch(err => {
      console.error("Dashboard Stats Error:", err.response?.data || err.message);
    });
  }, []);

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>AI Command Center</h1>
          <div className='flex items-center space-x-2'>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Start Campaign</Button>
          </div>
        </div>
        
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='analytics'>Detailed Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              {/* 1. Total Calls */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Total Calls</CardTitle>
                  <IconPhoneCall className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.totalCalls}</div>
                  <p className='text-xs text-muted-foreground'>Lifetime calls made</p>
                </CardContent>
              </Card>

              {/* 2. Minutes Used */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Airtime Used</CardTitle>
                  <IconClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.minutesUsed}m</div>
                  <p className='text-xs text-muted-foreground'>Talk time consumption</p>
                </CardContent>
              </Card>

              {/* 3. Meetings Booked */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Meetings Booked</CardTitle>
                  <IconCalendarCheck className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{stats.meetingsBooked}</div>
                  <p className='text-xs text-emerald-600 font-medium'>
                    Success Rate: {stats.totalCalls > 0 ? ((stats.meetingsBooked / stats.totalCalls) * 100).toFixed(1) : 0}%
                  </p>
                </CardContent>
              </Card>

              {/* 4. Credit Balance / Revenue */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Wallet Balance</CardTitle>
                  <IconWallet className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  {/* Using totalRevenue with a fallback to balance */}
                  <div className='text-2xl font-bold'>
                    ${(stats.totalRevenue ?? stats.balance ?? 0).toFixed(2)}
                  </div>
                  <p className='text-xs text-muted-foreground'>Available for calls</p>
                </CardContent>
              </Card>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader><CardTitle>Call Volume Overview</CardTitle></CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest AI interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: true, disabled: false },
  { title: 'Agents', href: '/agents', isActive: false, disabled: false },
  { title: 'Campaigns', href: '/campaigns', isActive: false, disabled: false },
  { title: 'Billing', href: '/billing', isActive: false, disabled: false },
]