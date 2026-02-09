import { createLazyFileRoute } from '@tanstack/react-router';
import { Campaigns } from '@/features/campaigns';

export const Route = createLazyFileRoute('/_authenticated/campaigns/')({
  component: Campaigns,
});