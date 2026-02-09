
// This file intentionally left blank to avoid root route conflicts.
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <div className="layout">
      {/* This is where your Sidebar and Header live */}
      <nav>Sidebar</nav> 
      <main>
        {/* This Outlet is CRITICAL - it renders History, Dashboard, etc. */}
        <Outlet /> 
      </main>
    </div>
  ),
})