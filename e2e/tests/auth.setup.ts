import { test as setup, expect } from '@playwright/test'
import { AUTH_FILE } from '../playwright.config'
import { USERS } from '../test-data/users'

setup('authenticate', async ({ request }) => {
  const response = await request.post('/api/login', { data: USERS.standard })
  expect(response.ok()).toBeTruthy()
  await request.storageState({ path: AUTH_FILE })
})