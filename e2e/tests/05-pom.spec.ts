import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { InventoryPage } from '../pages/InventoryPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { GUEST, SHIPPING, USERS } from '../test-data/users'

test.describe('with UI login', () => {
  test.use({ storageState: GUEST })

  test('buy two products', async ({ page }) => {
    const login = new LoginPage(page)
    const inventory = new InventoryPage(page)
    const cart = new CartPage(page)
    const checkout = new CheckoutPage(page)

    await login.goto()
    await login.login(USERS.standard.username, USERS.standard.password)
    await inventory.addToCart('Backpack', 'Onesie')
    await expect(inventory.header.cartBadge).toHaveText('2')
    await inventory.header.openCart()
    await expect(cart.total).toHaveText('$37.98')
    await cart.checkout()
    await checkout.fillShipping(SHIPPING)
    await checkout.placeOrder()
    await expect(checkout.confirmDialog).toContainText('$37.98')
    await checkout.confirm()
    await expect(checkout.thankYou).toBeVisible()
    await expect(checkout.orderNumber).toHaveText(/^#\d+$/)
    await expect(checkout.header.cartBadge).toBeHidden()
  })

  test('locked user sees an error', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()
    await login.login(USERS.locked.username, USERS.locked.password)
    await expect(login.error).toContainText('locked out')
  })
})

// Logout destroys the session ON THE SERVER. With the shared storageState, every test
// uses the same `sid` cookie: logging it out would break all the tests running after it.
// So this test opens its own session instead of using the shared one.
test.describe('logout', () => {
  test.use({ storageState: GUEST })

  test('logout returns to the login page', async ({ page }) => {
    const login = new LoginPage(page)
    const inventory = new InventoryPage(page)
    await login.goto()
    await login.login(USERS.standard.username, USERS.standard.password)
    await inventory.header.logout()
    await expect(login.submit).toBeVisible()
    await page.goto('/inventory.html')
    await expect(login.redirectInfo).toBeVisible()
  })
})

test('remove one item from the cart', async ({ page }) => {
  const login = new LoginPage(page)
  const inventory = new InventoryPage(page)
  const cart = new CartPage(page)
  await login.goto()
  await login.login(USERS.standard.username, USERS.standard.password)
  await inventory.addToCart('Backpack', 'Bike Light')
  await inventory.header.openCart()
  await cart.remove('Bike Light')
  await expect(cart.items).toHaveCount(1)
  await expect(cart.total).toHaveText('$29.99')
})

test('clear cart through the page object', async ({ page }) => {
  const login = new LoginPage(page)
  const inventory = new InventoryPage(page)
  const cart = new CartPage(page)
  await login.goto()
  await login.login(USERS.standard.username, USERS.standard.password)
  await inventory.addToCart('Backpack')
  await inventory.header.openCart()

  expect(await cart.clear({ accept: false })).toBe('Remove all items from your cart?')
  await expect(cart.items).toHaveCount(1)
  await cart.clear({ accept: true })
  await expect(cart.emptyMessage).toBeVisible()
  await expect(cart.checkoutButton).toBeDisabled()
})

test('sort by price, high to low', async ({ page }) => {
  const login = new LoginPage(page)
  const inventory = new InventoryPage(page)
  await login.goto()
  await login.login(USERS.standard.username, USERS.standard.password)
  await inventory.sortBy('price-desc')
  await expect(inventory.cards.first()).toContainText('Fleece Jacket')
  const values = await inventory.priceValues()
  expect(values).toEqual([...values].sort((a, b) => b - a))
})