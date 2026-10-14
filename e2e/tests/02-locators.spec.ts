import { test, expect } from '@playwright/test'
import { GUEST } from '../test-data/users'

test.use({ storageState: GUEST })

test.describe('login with user-facing locators', () => {
  test('login with getByLabel and getByRole', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })

  test('login with getByTestId', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('username').fill('standard_user')
    await page.getByTestId('password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })
})

test.describe('inventory page locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('counts 6 product cards', async ({ page }) => {
    await expect(page.getByTestId('product-card')).toHaveCount(6)
  })

  test('adds Bolt T-Shirt by filtering card first', async ({ page }) => {
    await page
      .getByTestId('product-card')
      .filter({ hasText: 'Bolt T-Shirt' })
      .getByRole('button', { name: 'Add to cart' })
      .click()
    await expect(page.getByTestId('cart-badge')).toHaveText('1')
  })

  test('retrieves price of Fleece Jacket via product card', async ({ page }) => {
    const price = await page
      .getByTestId('product-card')
      .filter({ has: page.getByRole('heading', { name: 'Fleece Jacket', exact: true }) })
      .getByTestId('product-price')
      .textContent()
    expect(price).toBe('$49.99')
  })
})

test.describe('burger menu on mobile', () => {
  test('finds burger button by role on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  })
})

test.describe('strict mode violations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('hasText matches too broadly - T-Shirt matches two cards', async ({ page }) => {
    const cards = page.getByTestId('product-card').filter({ hasText: 'T-Shirt' })
    await expect(cards).toHaveCount(2)
  })

  test('has with exact heading is strict - Bolt T-Shirt only', async ({ page }) => {
    const cards = page.getByTestId('product-card').filter({
      has: page.getByRole('heading', { name: 'Bolt T-Shirt', exact: true }),
    })
    await expect(cards).toHaveCount(1)
  })
})