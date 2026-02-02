import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { roles } from '@/features/users/data/data';
import { Users } from '@/features/users';

const usersSearchSchema = z.object({
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  role: z
    .array(z.enum(roles.map((r) => r.value as (typeof roles)[number]['value'])))
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
});

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: Users,
});
