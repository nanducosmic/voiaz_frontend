import {
  IconLayoutDashboard,
  IconPhoneCall,
  IconUsers,
  IconBook,
  IconSettings,
  IconUserShield,
  IconCommand,
  IconCreditCard,
  IconLink,
  IconUserCheck,
  IconHelpCircle,
  IconHistory, // Added for the new Call History page
} from '@tabler/icons-react'

export const sidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/avatars/01.png',
  },
  teams: [
    {
      name: 'AI Booking Inc',
      logo: IconCommand,
      plan: 'Enterprise',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: 'AI Campaigns',
          url: '/campaigns',
          icon: IconPhoneCall,
        },
        {
          title: 'Call History', // New item added here
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
          title: 'Admin Panel',
          url: '/admin',
          icon: IconUserShield,
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
            { title: 'Team & Roles', url: '/settings/team', icon: IconUserCheck },
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