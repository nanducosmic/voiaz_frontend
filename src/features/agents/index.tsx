import { useEffect, useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { AgentsTable } from './components/agents-table'
import { getTenants } from '@/services/api'


export function Agents() {
  const [, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTenants()
      .then(res => {
        let t = res.data;
        if (t && Array.isArray(t.data)) t = t.data;
        else if (t && Array.isArray(t.tenants)) t = t.tenants;
        else if (!Array.isArray(t)) t = [];
        setTenants(t);
      })
      .catch(() => {
        setError('Failed to load tenants');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div>Loading organizations...</div>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <div className='text-red-500'>{error}</div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Organizations</h2>
            <p className='text-muted-foreground'>
              Manage your organizations and agent assignments here.
            </p>
          </div>
        </div>
        <AgentsTable />
      </Main>
    </>
  )
}