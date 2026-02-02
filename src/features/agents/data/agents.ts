import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const agents = Array.from({ length: 2 }, () => ({
  id: faker.string.uuid(),
  name: faker.company.name(),
  description: faker.lorem.sentence(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
}))