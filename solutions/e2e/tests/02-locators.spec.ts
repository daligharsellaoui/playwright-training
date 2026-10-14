import { test, expect, type Page } from '@playwright/test'
import { GUEST, USERS } from '../test-data/users'

// Module 2: locators

const productCard = (page: Page, name: string) =>
  page.getByTestId('product-card').filter({ has: page.getByRole('heading', { name, exact: true }) })

test.describe('login page', () => {
  test.use({ storageState: GUEST })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ❌ Kept as a counter-example: coupled to ids, breaks on any refactor
  test('login with raw CSS selectors', async ({ page }) => {
    await page.locator('#user-name').fill(USERS.standard.username)
    await page.locator('#password').fill(USERS.standard.password)
    await page.locator('#login-button').click()
    await expect(page).toHaveURL(/inventory/)
  })

  test('login with user-facing locators', async ({ page }) => {
    await page.getByLabel('Username').fill(USERS.standard.username)
    await page.getByLabel('Password').fill(USERS.standard.password)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })

  // Test ids: stable, but invisible to users. Fine when there is no good role/label.
  test('login with test ids', async ({ page }) => {
    await page.getByTestId('username').fill(USERS.standard.username)
    await page.getByTestId('password').fill(USERS.standard.password)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })
})

test.describe('inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html')
  })

  test('lists 6 products', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
    await expect(page.getByTestId('product-card')).toHaveCount(6)
  })

  test('strict mode: "Add to cart" alone matches 6 buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add to cart' })).toHaveCount(6)
  })

  test('adds a specific product by filtering its card', async ({ page }) => {
    const card = page.getByTestId('product-card').filter({ hasText: 'Bolt T-Shirt' })
    await card.getByRole('button', { name: 'Add to cart' }).click()
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible()
  })

  test('hasText is loose, heading + exact is strict', async ({ page }) => {
    await expect(page.getByTestId('product-card').filter({ hasText: 'T-Shirt' })).toHaveCount(2)
    await expect(productCard(page, 'Red T-Shirt')).toHaveCount(1)
  })

  test('reads a price without depending on list order', async ({ page }) => {
    await expect(productCard(page, 'Fleece Jacket').getByTestId('product-price')).toHaveText('$49.99')
  })

  test('finds the sort select by its label', async ({ page }) => {
    await expect(page.getByLabel('Sort by')).toHaveValue('name-asc')
  })
})
