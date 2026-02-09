import { createLazyFileRoute } from '@tanstack/react-router';
import { KnowledgeBasePage } from '@/features/knowledge-base';

export const Route = createLazyFileRoute('/_authenticated/knowledge-base/')({
  component: KnowledgeBasePage,
});