import { test, expect } from '@playwright/test'
import { GUEST, SHIPPING, USERS } from '../test-data/users'

// Module 3: forms, cart, the two kinds of popup

async function addToCart(page: import('@playwright/test').Page, ...names: string[]) {
  for (const name of names) {
    await page.getByTestId('product-card').filter({ hasText: name })
      .getByRole('button', { name: 'Add to cart' }).click()
  }
}

test.describe('full purchase (logs in through the UI)', () => {
  test.use({ storageState: GUEST })

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill(USERS.standard.username)
    await page.getByLabel('Password').fill(USERS.standard.password)
    await page.getByLabel('Password').press('Enter')
    await expect(page).toHaveURL(/inventory/)
  })

  test('buy two products', async ({ page }) => {
    await addToCart(page, 'Backpack', 'Onesie')
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()

    await page.getByLabel('First name').fill(SHIPPING.firstName)
    await page.getByLabel('Last name').fill(SHIPPING.lastName)
    await page.getByLabel('Postal code').fill(SHIPPING.postalCode)
    await page.getByRole('button', { name: 'Place order' }).click()

    const dialog = page.getByRole('dialog', { name: 'Confirm your order' })
    await dialog.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible()
  })
})

test.describe('HTML modal', () => {
  test('cancel keeps you on the checkout', async ({ page }) => {
    await page.goto('/inventory.html')
    await addToCart(page, 'Backpack')
    await page.goto('/checkout.html')
    await page.getByLabel('First name').fill(SHIPPING.firstName)
    await page.getByLabel('Last name').fill(SHIPPING.lastName)
    await page.getByLabel('Postal code').fill(SHIPPING.postalCode)
    await page.getByRole('button', { name: 'Place order' }).click()

    const dialog = page.getByRole('dialog', { name: 'Confirm your order' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancel' }).click()

    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/checkout/)
  })
})

test.describe('native confirm() on "Clear cart"', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html')
    await addToCart(page, 'Backpack', 'Onesie')
    await page.goto('/cart.html')
    await expect(page.getByTestId('cart-item')).toHaveCount(2)
  })

  test('accept empties the cart', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toBe('Remove all items from your cart?')
      await dialog.accept()
    })
    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
  })

  test('dismiss keeps the items', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByTestId('cart-item')).toHaveCount(2)
  })

  test('without a handler, Playwright dismisses it', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByTestId('cart-item')).toHaveCount(2)
  })
})

test.describe('inventory interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html')
  })

  test('sort by price puts the cheapest first', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('price-asc')
    await expect(page.getByTestId('product-card').first()).toContainText('Onesie')
    await page.getByLabel('Sort by').selectOption({ label: 'Price (high to low)' })
    await expect(page.getByTestId('product-card').first()).toContainText('Fleece Jacket')
  })

  test('add then remove toggles the button back', async ({ page }) => {
    const card = page.getByTestId('product-card').filter({ hasText: 'Backpack' })
    await card.getByRole('button', { name: 'Add to cart' }).click()
    await card.getByRole('button', { name: 'Remove' }).click()
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible()
  })

  test('"Continue shopping" goes back to products', async ({ page }) => {
    await page.goto('/cart.html')
    await page.getByRole('link', { name: 'Continue shopping' }).click()
    await expect(page).toHaveURL(/inventory/)
  })
})
