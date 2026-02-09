
import {
  IconLayoutDashboard,
  IconPhoneCall,
  IconUsers,
  IconBook,
  IconSettings,
  IconCommand,
  IconCreditCard,
  IconLink,
  IconUserCheck,
  IconHelpCircle,
  IconHistory,
} from '@tabler/icons-react';
import { Users } from 'lucide-react';

export const sidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'Voaiz.com',
      logo: IconCommand,
      // plan removed
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: IconLayoutDashboard,
        },
        {
          title: 'AI Campaigns',
          url: '/campaigns',
          icon: IconPhoneCall,
        },
        {
          title: 'Call History',
          url: '/history',
          icon: IconHistory,
        },
        {
          title: 'Contacts Import',
          url: '/contacts',
          icon: IconUsers,
        },
        {
          title: 'AI Training (KB)',
          url: '/knowledge-base',
          icon: IconBook,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          title: 'Billing & Recharge',
          url: '/billing',
          icon: IconCreditCard,
        },
        {
          title: 'Integrations',
          url: '/integrations',
          icon: IconLink,
        },
        {
          title: 'Agents',
          url: '/agents',
          icon: IconUserCheck,
          roles: ['super_admin'], // Assuming only super_admin manages agents
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
          roles: ['super_admin'],
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            { title: 'Profile', url: '/settings/profile' },
            { title: 'Account', url: '/settings/account' },
            { 
              title: 'Team & Roles', 
              url: '/settings/team', 
              icon: IconUserCheck,
              // Only admins or super_admins should manage teams
              roles: ['super_admin', 'admin'] 
            },
            { title: 'Appearance', url: '/settings/appearance' },
          ],
        },
        {
          title: 'Help Center',
          url: '/help',
          icon: IconHelpCircle,
        },
      ],
    },
  ],
}