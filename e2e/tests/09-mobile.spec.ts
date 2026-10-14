import { test, expect } from '@playwright/test'
import { GUEST } from '../test-data/users'

test.use({ storageState: GUEST })

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('burger menu opens on mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
    await page.getByRole('button', { name: 'Open menu' }).click()
    await expect(page.getByRole('link', { name: 'Products' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Cart/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  test('burger toggles aria-expanded', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    const burger = page.getByRole('button', { name: /Open menu|Close menu/ })
    await expect(burger).toHaveAttribute('aria-expanded', 'false')
    await burger.click()
    await expect(burger).toHaveAttribute('aria-expanded', 'true')
    await expect(burger).toHaveAttribute('aria-label', 'Close menu')
  })
})