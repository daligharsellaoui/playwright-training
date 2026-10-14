import { test, expect } from '@playwright/test'
import { GUEST } from '../test-data/users'

// Module 1: first tests
test.use({ storageState: GUEST })

test('home page has the Demo Shop title', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Demo Shop/)
})

test('health endpoint answers', { tag: '@smoke' }, async ({ page }) => {
  const response = await page.goto('/api/health')
  expect(response?.ok()).toBe(true)
})
