import { test, expect } from '@playwright/test'

test.describe('debug failures - intentionally broken', () => {
  test.fail('broken on purpose: wrong locator', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add to bag' }).click()
  })

  test.fail('broken on purpose: wrong expected value', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByTestId('cart-badge')).toHaveText('42')
  })

  test.fail('broken on purpose: flaky assertion without auto-wait', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()
    const total = await page.getByTestId('checkout-total').textContent()
    expect(total).toBe('$37.98')
  }, 5000)
})

test.describe('debug with test.step', () => {
  test('checkout with steps', async ({ page }) => {
    await test.step('login', async () => {
      await page.goto('/')
      await page.getByLabel('Username').fill('standard_user')
      await page.getByLabel('Password').fill('secret_sauce')
      await page.getByRole('button', { name: 'Login' }).click()
    })

    await test.step('add products', async () => {
      await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
      await page.getByTestId('product-card').filter({ hasText: 'Onesie' }).getByRole('button', { name: 'Add to cart' }).click()
    })

    await test.step('checkout', async () => {
      await page.getByRole('link', { name: /Cart/ }).click()
      await page.getByRole('button', { name: 'Checkout' }).click()
      await page.getByLabel('First name').fill('Ada')
      await page.getByLabel('Last name').fill('Lovelace')
      await page.getByLabel('Postal code').fill('75001')
      await page.getByRole('button', { name: 'Place order' }).click()
    })

    await test.step('confirm order', async () => {
      await page.getByRole('dialog', { name: 'Confirm your order' }).getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible()
    })
  })
})