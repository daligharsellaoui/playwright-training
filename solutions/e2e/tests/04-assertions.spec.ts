import { test, expect } from '@playwright/test'
import { GUEST, SHIPPING, USERS } from '../test-data/users'

// Module 4: assertions & waiting (no waitForTimeout anywhere)

test.describe('login errors', () => {
  test.use({ storageState: GUEST })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  const cases = [
    { title: 'empty form', user: '', pwd: '', error: 'Username is required' },
    { title: 'no password', user: USERS.standard.username, pwd: '', error: 'Password is required' },
    { title: 'wrong password', user: USERS.standard.username, pwd: 'nope', error: 'Username and password do not match any user' },
    { title: 'locked user', user: USERS.locked.username, pwd: USERS.locked.password, error: 'Sorry, this user has been locked out' },
  ]

  for (const { title, user, pwd, error } of cases) {
    test(`login error: ${title}`, async ({ page }) => {
      await page.getByLabel('Username').fill(user)
      await page.getByLabel('Password').fill(pwd)
      await page.getByRole('button', { name: 'Login' }).click()
      await expect(page.getByRole('alert')).toContainText(error)
      await expect(page).toHaveURL('/')
    })
  }

  test('the error can be closed', async ({ page }) => {
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await page.getByRole('button', { name: 'Close error' }).click()
    await expect(page.getByRole('alert')).toBeHidden()
  })

  test('protected page redirects to login', async ({ page }) => {
    await page.goto('/cart.html')
    await expect(page).toHaveURL('/?redirected=1')
    await expect(page.getByText('You must log in to access this page.')).toBeVisible()
  })

  test('slow user can still log in', async ({ page }) => {
    test.slow() // x3 timeout for THIS test only
    await page.getByLabel('Username').fill(USERS.slow.username)
    await page.getByLabel('Password').fill(USERS.slow.password)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/inventory/, { timeout: 10_000 })
    // slow_user: every API call takes 3 s (+400 ms for /api/products)
    await expect(page.getByTestId('product-card')).toHaveCount(6, { timeout: 15_000 })
  })
})

test.describe('cart badge & totals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html')
  })

  test('badge follows the cart', async ({ page }) => {
    const badge = page.getByTestId('cart-badge')
    await expect(badge).toBeHidden()
    for (const name of ['Backpack', 'Onesie']) {
      await page.getByTestId('product-card').filter({ hasText: name }).getByRole('button', { name: 'Add to cart' }).click()
    }
    await expect(badge).toHaveText('2')
    await page.getByRole('button', { name: 'Remove' }).first().click()
    await expect(badge).toHaveText('1')
    await page.getByRole('button', { name: 'Remove' }).click()
    await expect(badge).toBeHidden()
  })

  test('totals: cart and confirm modal show $37.98', async ({ page }) => {
    for (const name of ['Backpack', 'Onesie']) {
      await page.getByTestId('product-card').filter({ hasText: name }).getByRole('button', { name: 'Add to cart' }).click()
    }
    await page.goto('/cart.html')
    await expect(page.getByTestId('cart-total')).toHaveText('$37.98')

    await page.getByRole('button', { name: 'Checkout' }).click()
    await expect(page.getByTestId('checkout-total')).toHaveText('$37.98')
    await page.getByLabel('First name').fill(SHIPPING.firstName)
    await page.getByLabel('Last name').fill(SHIPPING.lastName)
    await page.getByLabel('Postal code').fill(SHIPPING.postalCode)
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByRole('dialog')).toContainText('$37.98')
  })

  test('sort by price: prices are ascending', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('price-asc')
    const prices = page.getByTestId('product-price')
    await expect(prices).toHaveCount(6) // allTextContents() does not wait: wait first
    const values = (await prices.allTextContents()).map((p) => Number(p.replace('$', '')))
    expect(values).toEqual([...values].sort((a, b) => a - b))
  })

  test('sort by name Z to A', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('name-desc')
    await expect(page.getByTestId('product-card').getByRole('heading')).toHaveText([
      'Red T-Shirt', 'Onesie', 'Fleece Jacket', 'Bolt T-Shirt', 'Bike Light', 'Backpack',
    ])
  })
})

test.describe('checkout validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html')
    await page.getByRole('button', { name: 'Add to cart' }).first().click()
    await page.goto('/checkout.html')
  })

  test('empty form shows 3 errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect.soft(page.getByText('First name is required')).toBeVisible()
    await expect.soft(page.getByText('Last name is required')).toBeVisible()
    await expect.soft(page.getByText('Postal code is required')).toBeVisible()
    for (const label of ['First name', 'Last name', 'Postal code']) {
      await expect.soft(page.getByLabel(label)).toHaveAttribute('aria-invalid', 'true')
    }
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('postal code must be 5 digits', async ({ page }) => {
    await page.getByLabel('First name').fill(SHIPPING.firstName)
    await page.getByLabel('Last name').fill(SHIPPING.lastName)
    await page.getByLabel('Postal code').fill('123')
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByText('Postal code must be 5 digits')).toBeVisible()
    await expect(page.getByLabel('First name')).toHaveAttribute('aria-invalid', 'false')
  })

  test('"Place order" waits for the total (auto-wait on enabled)', async ({ page }) => {
    // The button is disabled until /api/products answers: click() waits for it, no sleep needed
    await page.getByLabel('First name').fill(SHIPPING.firstName)
    await page.getByLabel('Last name').fill(SHIPPING.lastName)
    await page.getByLabel('Postal code').fill(SHIPPING.postalCode)
    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByRole('dialog')).not.toContainText('$0.00')
  })
})
