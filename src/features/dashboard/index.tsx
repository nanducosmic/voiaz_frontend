import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import useSyncTenantToStorage from '@/context/useSyncTenantToStorage';
import { AgentsTable } from '@/features/agents/components/agents-table';
// Removed duplicate import of useSelector
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { IconUsers, IconTarget, IconPhoneCall, IconWallet, IconUserCheck, IconTrendingUp } from '@tabler/icons-react'
import { getAdminStats } from '@/services/api';
import { CallActivityChart } from './components/call-activity-chart'
import type { RootState } from '@/stores/index'

const topNav = [
  { title: 'Overview', href: '/dashboard', isActive: true, disabled: false },
  { title: 'Agents', href: '/agents', isActive: false, disabled: false },
  { title: 'Campaigns', href: '/campaigns', isActive: false, disabled: false },
  { title: 'Billing', href: '/billing', isActive: false, disabled: false },
]

interface AdminStats {
  totalSubUsers: number;
  totalTenants: number;
  totalCreditsInSystem: number;
  activeCampaigns: number;
  callActivity?: Array<{ date: string; calls: number }>;
}


interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  color?: string
}

const StatCard = ({ title, value, icon: Icon, color = 'text-muted-foreground' }: StatCardProps) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className='text-2xl font-bold'>{value}</div>
    </CardContent>
  </Card>
)

export function Dashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isSuperAdmin = user?.role === 'super_admin';
  const { tenantId } = useTenant();
  useSyncTenantToStorage();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setIsLoading(true);
    getAdminStats()
      .then(response => {
        setStats(response.data);
        setError(null);
      })
      .catch(() => {
        setError('Failed to load dashboard statistics. Please try again later.');
        setStats(null);
      })
      .finally(() => setIsLoading(false));
  }, [isSuperAdmin, tenantId]);

  return (
    <Main>
      {/* Top Bar */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <TopNav links={topNav} />
        </div>
        <div className="flex items-center gap-2">
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </div>

      <div className='mb-2 flex items-center justify-between space-y-2'>
        <h1 className='text-2xl font-bold tracking-tight'>
          {isSuperAdmin ? 'Super Admin Dashboard' : 'Client Dashboard'}
        </h1>
      </div>

      {error && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900 dark:text-red-200'>
          Failed to load dashboard statistics. Please try again later.
        </div>
      )}

      {/* Stat Cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6'>
        {isSuperAdmin ? (
          <>
            <StatCard
              title='Platform Users'
              value={stats?.totalSubUsers ?? 0}
              icon={IconUsers}
            />
            <StatCard
              title='Total Tenants'
              value={stats?.totalTenants ?? 0}
              icon={IconUserCheck}
              color='text-purple-500'
            />
            <StatCard
              title='Total Credits in System'
              value={stats?.totalCreditsInSystem ?? 0}
              icon={IconPhoneCall}
              color='text-green-500'
            />
            <StatCard
              title='Active Campaigns'
              value={stats?.activeCampaigns ?? 0}
              icon={IconTarget}
              color='text-blue-500'
            />
          </>
        ) : (
          <>
            <StatCard
              title='Available Credits'
              value={`$${(stats && typeof stats === 'object' && 'balance' in stats ? String(stats.balance) : '0')}`}
              icon={IconWallet}
              color='text-indigo-500'
            />
            <StatCard
              title='My Contact List'
              value={stats && typeof stats === 'object' && 'totalContacts' in stats ? Number(stats.totalContacts) : 0}
              icon={IconUserCheck}
              color='text-purple-500'
            />
            <StatCard
              title='Campaign Progress'
              value={stats && typeof stats === 'object' && 'callsMade' in stats ? Number(stats.callsMade) : 0}
              icon={IconTrendingUp}
              color='text-orange-500'
            />
          </>
        )}
      </div>

      {/* Call Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Call Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='h-[350px] flex items-center justify-center'>
              <Skeleton className='h-[300px] w-full' />
            </div>
          ) : (
            <CallActivityChart data={stats?.callActivity ?? []} />
          )}
        </CardContent>
      </Card>
      {/* User Table below stats cards */}
      <div className='mt-8'>
        <AgentsTable />
      </div>
    </Main>
  );
}