import { test, expect } from '@playwright/test'

test.describe('multi-browser', () => {
  test('inventory page loads in all browsers', async ({ page, browserName }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByTestId('product-card')).toHaveCount(6)
    console.log(`Browser: ${browserName}`)
  })
})

test.describe('tags', () => {
  test('smoke test tagged @smoke', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Demo Shop/)
  })

  test('another smoke test', { tag: '@smoke' }, async ({ page }) => {
    const response = await page.goto('/api/health')
    expect(response?.ok()).toBe(true)
  })
})

test.describe('browser-specific skips', () => {
  test('webkit skip example', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit specific issue')
    await page.goto('/')
    await expect(page).toHaveTitle(/Demo Shop/)
  })

  test('runs on chromium and firefox', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Skipping on WebKit')
    await page.goto('/')
    await expect(page).toHaveTitle(/Demo Shop/)
  })
})