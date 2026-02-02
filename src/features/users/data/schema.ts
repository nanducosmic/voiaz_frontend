import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('super_admin'),
  z.literal('admin'),
  z.literal('user'), // Added 'user' in case some sub-users have this role
])

const userSchema = z.object({
  // Use _id to match MongoDB, but keep id as optional for TanStack compatibility
  _id: z.string(),
  id: z.string().optional(), 
  name: z.string(),
  email: z.string(),
  role: userRoleSchema.or(z.string()), // More flexible for different role strings
  balance: z.number().default(0),
  
  // CRITICAL: Updated to handle the object you see in the Network tab
  tenant_id: z.object({
    _id: z.string(),
    name: z.string(),
    balance: z.number().optional()
  }).nullable().optional(),

  status: userStatusSchema.optional().default('active'),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  phoneNumber: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

// This is what validates the array of 9 users
export const userListSchema = z.array(userSchema)