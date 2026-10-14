import { test as setup, expect } from '@playwright/test'
import { AUTH_FILE } from '../playwright.config'
import { USERS } from '../test-data/users'

// Module 6: log in ONCE through the API (~50 ms) and save cookies + localStorage.
// The UI login itself is covered by 02/04 specs.
setup('authenticate', async ({ request }) => {
  const response = await request.post('/api/login', { data: USERS.standard })
  expect(response.ok()).toBeTruthy()
  await request.storageState({ path: AUTH_FILE })
})

/* UI variant (slower, also valid):
setup('authenticate', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Username').fill(USERS.standard.username)
  await page.getByLabel('Password').fill(USERS.standard.password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/inventory/) // wait until the cookie is set
  await page.context().storageState({ path: AUTH_FILE })
})
*/
