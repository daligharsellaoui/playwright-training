import { test, expect } from '@playwright/test'

test.describe('checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('complete checkout: add products, fill form, place order', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Onesie' }).getByRole('button', { name: 'Add to cart' }).click()
    await expect(page.getByTestId('cart-badge')).toHaveText('2')

    await page.getByRole('link', { name: /Cart/ }).click()
    await expect(page.getByTestId('cart-total')).toHaveText('$37.98')

    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('75001')

    await page.getByRole('button', { name: 'Place order' }).click()
    await expect(page.getByRole('dialog', { name: 'Confirm your order' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Confirm your order' })).toContainText('$37.98')
    await page.getByRole('dialog', { name: 'Confirm your order' }).getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible()
    await expect(page.getByTestId('order-number')).toHaveText(/^#\d+$/)
    await expect(page.getByTestId('cart-badge')).toBeHidden()
  })

  test('cancel in confirm dialog keeps you on checkout', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('75001')
    await page.getByRole('button', { name: 'Place order' }).click()
    await page.getByRole('dialog', { name: 'Confirm your order' }).getByRole('button', { name: 'Cancel' }).click()
    await expect(page).toHaveURL(/checkout/)
  })
})

test.describe('native confirm dialog - Clear cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
  })

  test('accept clears the cart', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByText('Your cart is empty.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Checkout' })).toBeDisabled()
  })

  test('dismiss keeps the cart intact', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'Clear cart' }).click()
    await expect(page.getByTestId('cart-item')).toHaveCount(1)
  })

  test('dialog message is correct', async ({ page }) => {
    const dialogPromise = page.waitForEvent('dialog')
    const clickPromise = page.getByRole('button', { name: 'Clear cart' }).click()
    const dialog = await dialogPromise
    expect(dialog.message()).toBe('Remove all items from your cart?')
    await dialog.dismiss()
    await clickPromise
  })
})

test.describe('sort dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('sort by price low to high', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('price-asc')
    const prices = await page.getByTestId('product-price').allTextContents()
    const values = prices.map((p) => Number(p.replace('$', '')))
    expect(values).toEqual([...values].sort((a, b) => a - b))
  })

  test('sort by price high to low', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('price-desc')
    const prices = await page.getByTestId('product-price').allTextContents()
    const values = prices.map((p) => Number(p.replace('$', '')))
    expect(values).toEqual([...values].sort((a, b) => b - a))
  })
})

test.describe('add/remove toggles button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
  })

  test('button changes from Add to cart to Remove', async ({ page }) => {
    const card = page.getByTestId('product-card').filter({ hasText: 'Backpack' })
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible()
    await card.getByRole('button', { name: 'Add to cart' }).click()
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible()
    await card.getByRole('button', { name: 'Remove' }).click()
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeVisible()
  })
})