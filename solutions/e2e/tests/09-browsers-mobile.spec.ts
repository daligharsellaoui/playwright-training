import { test, expect } from '../fixtures'

// Module 9: runs on every project (chromium, firefox, webkit, mobile)

test('burger toggles the menu', { tag: '@mobile' }, async ({ inventoryPage, page, isMobile }) => {
  test.skip(!isMobile, 'The burger only exists on small screens')
  const { burger } = inventoryPage.header
  await expect(burger).toHaveAttribute('aria-expanded', 'false')
  await expect(inventoryPage.header.cartLink).toBeHidden()
  await burger.click()
  await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  await expect(inventoryPage.header.cartLink).toBeVisible()
})

test('desktop shows the nav without a burger', async ({ inventoryPage, isMobile }) => {
  test.skip(isMobile, 'Desktop layout only')
  await expect(inventoryPage.header.burger).toBeHidden()
  await expect(inventoryPage.header.cartLink).toBeVisible()
})

test('open the cart from the header on any screen', { tag: '@smoke' }, async ({ inventoryPage, page }) => {
  await inventoryPage.addToCart('Onesie')
  await inventoryPage.header.openCart()
  await expect(page).toHaveURL(/cart/)
})
