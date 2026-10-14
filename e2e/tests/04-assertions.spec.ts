import { test, expect } from '@playwright/test'
import { GUEST } from '../test-data/users'

test.use({ storageState: GUEST })

test.describe('cart badge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('shows count after adding items', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Onesie' }).getByRole('button', { name: 'Add to cart' }).click()
    await expect(page.getByTestId('cart-badge')).toHaveText('2')
  })

  test('hidden when cart is empty', async ({ page }) => {
    await expect(page.getByTestId('cart-badge')).toBeHidden()
  })
})

test.describe('redirects', () => {
  test('after login goes to inventory', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })

  test('protected page without login redirects to login with query', async ({ page }) => {
    await page.goto('/cart.html')
    await expect(page).toHaveURL('/?redirected=1')
    await expect(page.getByText('You must log in to access this page.')).toBeVisible()
  })
})

test.describe('login error messages', () => {
  test('empty username', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toContainText('Username is required')
  })

  test('empty password', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toContainText('Password is required')
  })

  test('wrong password', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toContainText('Username and password do not match any user')
  })

  test('locked user', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('locked_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toContainText('Sorry, this user has been locked out')
  })

  test('error closes with close button', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await page.getByRole('button', { name: 'Close error' }).click()
    await expect(page.getByRole('alert')).toBeHidden()
  })
})

test.describe('checkout validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()
  })

  test('submit empty shows three field errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByText('First name is required')).toBeVisible()
    await expect(page.getByText('Last name is required')).toBeVisible()
    await expect(page.getByText('Postal code is required')).toBeVisible()
  })

  test('invalid postal code shows error', async ({ page }) => {
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('123')
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByText('Postal code must be 5 digits')).toBeVisible()
    await expect(page.getByLabel('Postal code')).toHaveAttribute('aria-invalid', 'true')
  })
})

test.describe('totals', () => {
  test('cart and modal show correct total for Backpack + Onesie', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Onesie' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await expect(page.getByTestId('cart-total')).toHaveText('$37.98')
    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('75001')
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByRole('dialog', { name: 'Confirm your order' })).toContainText('$37.98')
  })
})

test.describe('sort verification with allTextContents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('price low to high produces ascending order', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('price-asc')
    const prices = await page.getByTestId('product-price').allTextContents()
    const values = prices.map((p) => Number(p.replace('$', '')))
    expect(values).toEqual([...values].sort((a, b) => a - b))
  })
})

test.describe('slow_user timeout handling', () => {
  test('login works with extended timeout on assertion', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('slow_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/, { timeout: 10_000 })
  })

  test('login works with test.slow', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.getByLabel('Username').fill('slow_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/)
  })
})

test.describe('web-first vs manual assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('web-first assertion retries until products load', async ({ page }) => {
    await expect(page.getByTestId('product-card')).toHaveCount(6)
  })

  test.fail('manual assertion fails because it does not retry', async ({ page }) => {
    // This demonstrates the anti-pattern - do not do this
    // The products load with 400ms latency; without waiting, count is 0
    const count = await page.getByTestId('product-card').count()
    expect(count).toBe(6)
  })
})