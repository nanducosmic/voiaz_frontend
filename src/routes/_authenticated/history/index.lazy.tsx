
import { createLazyFileRoute } from '@tanstack/react-router';
import { History } from '@/features/history';

export const Route = createLazyFileRoute('/_authenticated/history/')({
  component: History,
});