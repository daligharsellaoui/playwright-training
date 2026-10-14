import { test, expect } from '../fixtures'

// Module 6: the session comes from storageState (auth.setup.ts), pages come from fixtures.

test('starts already logged in', async ({ inventoryPage, page }) => {
  await expect(page).toHaveURL(/inventory/) // no redirect to login
  await expect(inventoryPage.cards).toHaveCount(6)
})

test('add to cart updates the badge', async ({ inventoryPage }) => {
  await inventoryPage.addToCart('Backpack')
  await expect(inventoryPage.header.cartBadge).toHaveText('1')
})

test('each test gets its own cart (fresh context per test)', async ({ inventoryPage }) => {
  // The previous test added a product, yet the badge is hidden here:
  // the context is rebuilt from a COPY of .auth/user.json, so localStorage starts empty.
  await expect(inventoryPage.header.cartBadge).toBeHidden()
})

test('cartWithItems is filled without the UI', async ({ cartWithItems }) => {
  await expect(cartWithItems.items).toHaveCount(2)
  await expect(cartWithItems.total).toHaveText('$37.98')
})

test.describe('custom cart content', () => {
  test.use({ cartProducts: ['Fleece Jacket'] })

  test('fixture option overrides the products', async ({ cartWithItems, checkoutPage }) => {
    await expect(cartWithItems.items).toHaveCount(1)
    await cartWithItems.checkout()
    await expect(checkoutPage.total).toHaveText('$49.99')
  })
})

test('lockedUserPage runs in its own logged-out context', async ({ lockedUserPage }) => {
  await expect(lockedUserPage.error).toHaveText(/Sorry, this user has been locked out/)
})
