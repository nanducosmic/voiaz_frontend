import { z } from 'zod'

const agentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Agent = z.infer<typeof agentSchema>

export const agentListSchema = z.array(agentSchema)