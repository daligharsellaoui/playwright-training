import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { InventoryPage } from '../pages/InventoryPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { GUEST, PRODUCT_IDS, USERS, type ProductName } from '../test-data/users'

type Fixtures = {
  loginPage: LoginPage
  inventoryPage: InventoryPage
  cartPage: CartPage
  checkoutPage: CheckoutPage
  /** Products put in the cart by `cartWithItems`. Override with test.use({ cartProducts: [...] }) */
  cartProducts: ProductName[]
  /** Cart page already filled (through localStorage, not the UI) */
  cartWithItems: CartPage
  /** Login page in a fresh context (no session) after a locked_user login attempt */
  lockedUserPage: LoginPage
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  inventoryPage: async ({ page }, use) => {
    const inventoryPage = new InventoryPage(page)
    await inventoryPage.goto()
    await use(inventoryPage)
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page))
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page))
  },

  cartProducts: [['Backpack', 'Onesie'], { option: true }],

  cartWithItems: async ({ page, cartProducts }, use) => {
    const ids = cartProducts.map((name) => PRODUCT_IDS[name])
    // Runs before any page script: the cart is there on first render
    await page.addInitScript((cart) => localStorage.setItem('cart', cart), JSON.stringify(ids))
    const cartPage = new CartPage(page)
    await cartPage.goto()
    await use(cartPage)
  },

  lockedUserPage: async ({ browser, baseURL }, use) => {
    // Own context: whatever storageState the project uses, this one starts logged out.
    // browser.newContext() does not inherit the config's `use` options: pass baseURL explicitly.
    const context = await browser.newContext({ baseURL, storageState: GUEST })
    const loginPage = new LoginPage(await context.newPage())
    await loginPage.goto()
    await loginPage.login(USERS.locked.username, USERS.locked.password)
    await use(loginPage)
    await context.close() // teardown
  },
})

export { expect } from '@playwright/test'
