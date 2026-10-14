import { test, expect } from '../fixtures'
import { AUTH_FILE } from '../playwright.config'
import { USERS } from '../test-data/users'

test.use({ storageState: AUTH_FILE })

test.describe('fixtures inject page objects', () => {
  test('inventoryPage fixture goes to inventory and exposes POM', async ({ inventoryPage }) => {
    await expect(inventoryPage.heading).toBeVisible()
    await expect(inventoryPage.cards).toHaveCount(6)
  })

  test('cartWithItems fixture arrives with prefilled cart', async ({ cartWithItems }) => {
    await expect(cartWithItems.items).toHaveCount(2)
    await expect(cartWithItems.total).toHaveText('$37.98')
  })

  test('cartProducts parameterizes cartWithItems', async ({ cartWithItems, cartProducts }) => {
    await expect(cartWithItems.items).toHaveCount(cartProducts.length)
  })

  test('lockedUserPage fixture shows locked error', async ({ lockedUserPage }) => {
    await expect(lockedUserPage.error).toContainText('locked out')
  })
})

test.describe('override cartProducts per test', () => {
  test.use({ cartProducts: ['Bike Light', 'Fleece Jacket'] })

  test('cart contains overridden products', async ({ cartWithItems }) => {
    await expect(cartWithItems.items).toHaveCount(2)
    await expect(cartWithItems.item('Bike Light')).toBeVisible()
    await expect(cartWithItems.item('Fleece Jacket')).toBeVisible()
  })
})