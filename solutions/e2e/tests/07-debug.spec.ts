import { test, expect } from '../fixtures'
import { SHIPPING } from '../test-data/users'

// Module 7: the three planned failures, fixed. Each `test.fail()` block keeps the broken
// version so you can still open its trace: `test.fail()` passes only if the test FAILS.
// Run them alone and look at the traces:  npx playwright test 07 --project=chromium --trace=on

test.describe('broken on purpose', () => {
  test.describe.configure({ retries: 0 })

  test('1. wrong locator → action timeout', async ({ inventoryPage }) => {
    test.fail()
    // Short action timeout so it fails fast. (A test TIMEOUT would not count as "expected to fail")
    await inventoryPage.productCard('Backpack').getByRole('button', { name: 'Add to bag' }).click({ timeout: 2_000 })
  })

  test('2. wrong expected value → diff', async ({ cartWithItems }) => {
    test.fail()
    await expect(cartWithItems.total).toHaveText('$40.00', { timeout: 1_000 })
  })

  test('3. manual read → reads "…" before the API answers', async ({ cartWithItems, checkoutPage }) => {
    test.fail()
    await cartWithItems.checkout()
    expect(await checkoutPage.total.textContent()).toBe('$37.98')
  })
})

test.describe('fixed', () => {
  test('1. right accessible name', async ({ inventoryPage }) => {
    await inventoryPage.addButton('Backpack').click()
    await expect(inventoryPage.removeButton('Backpack')).toBeVisible()
  })

  test('2. right value', async ({ cartWithItems }) => {
    await expect(cartWithItems.total).toHaveText('$37.98')
  })

  test('3. web-first assertion retries until the API answers', async ({ cartWithItems, checkoutPage }) => {
    await cartWithItems.checkout()
    await expect(checkoutPage.total).toHaveText('$37.98')
  })
})

test('checkout with steps (readable report)', async ({ cartWithItems, checkoutPage }) => {
  await test.step('Go to checkout', async () => {
    await cartWithItems.checkout()
  })
  await test.step('Fill shipping information', async () => {
    await checkoutPage.fillShipping(SHIPPING)
  })
  await test.step('Place and confirm the order', async () => {
    await checkoutPage.placeOrder()
    await checkoutPage.confirm()
  })
  await expect(checkoutPage.thankYou).toBeVisible()
})
