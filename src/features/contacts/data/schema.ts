import { z } from 'zod'

export const contactSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  tenant_id: z.string(),
})

export type Contact = z.infer<typeof contactSchema>

export const contactListSchema = z.array(contactSchema)