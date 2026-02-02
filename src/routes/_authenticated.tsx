import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // Replace with your actual auth selector or context
  const user = useSelector((state: any) => state.auth?.user);

  useEffect(() => {
    if (!user) {
      redirect({ to: '/login' });
    }
  }, [user]);

  return (
    <div className='flex min-h-screen'>
      <AppSidebar />
      <div className='flex flex-1 flex-col'>
        <Header />
        <main className='flex-1 p-4'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
