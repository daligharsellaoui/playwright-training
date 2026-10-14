import { test, expect } from '../fixtures'
import { SHIPPING } from '../test-data/users'

// Module 8, part A: intercepting the browser's network with page.route()
// Routes are declared BEFORE the navigation that triggers the request.

test.describe('mocked products', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({
        json: [
          { id: 98, name: 'Mocked Mug', price: 0.01, description: 'From the mock' },
          { id: 99, name: 'Mocked Cap', price: 1.5, description: 'From the mock' },
        ],
      })
    )
  })

  test('shows only the mocked products', async ({ inventoryPage, page }) => {
    await expect(inventoryPage.cards).toHaveCount(2)
    await expect(page.getByText('$0.01')).toBeVisible()
  })
})

test('modifies the real response', async ({ page, inventoryPage }) => {
  await page.route('**/api/products', async (route) => {
    const response = await route.fetch()
    const products = await response.json()
    products[0].name = 'Mocked Backpack'
    await route.fulfill({ response, json: products })
  })
  await inventoryPage.goto()
  await expect(inventoryPage.productCard('Mocked Backpack')).toBeVisible()
  await expect(inventoryPage.cards).toHaveCount(6)
})

test('server error shows a message', async ({ page, inventoryPage }) => {
  await page.route('**/api/products', (route) => route.fulfill({ status: 500, json: { error: 'Database down' } }))
  await inventoryPage.goto()
  await expect(inventoryPage.loadError).toHaveText('Could not load products: Database down')
})

test('empty list renders no card (UX bug: no "no products" message)', async ({ page, inventoryPage }) => {
  await page.route('**/api/products', (route) => route.fulfill({ json: [] }))
  await inventoryPage.goto()
  await expect(inventoryPage.loading).toBeHidden()
  await expect(inventoryPage.cards).toHaveCount(0)
  test.info().annotations.push({ type: 'issue', description: 'Empty catalog shows a blank page' })
})

test('slow API shows the loading state', async ({ page, inventoryPage }) => {
  await page.route('**/api/products', async (route) => {
    await new Promise((r) => setTimeout(r, 2000))
    await route.continue()
  })
  await inventoryPage.goto()
  await expect(inventoryPage.loading).toHaveText('Loading products…')
  await expect(inventoryPage.loading).toBeHidden()
  await expect(inventoryPage.cards).toHaveCount(6)
})

test('declined order shows the API error', async ({ page, cartWithItems, checkoutPage }) => {
  await page.route('**/api/orders', (route) => route.fulfill({ status: 400, json: { error: 'Payment declined' } }))
  await cartWithItems.checkout()
  await checkoutPage.fillShipping(SHIPPING)
  await checkoutPage.placeOrder()
  await checkoutPage.confirm()
  await expect(checkoutPage.orderError).toHaveText('Payment declined')
  await expect(page).toHaveURL(/checkout/)
})

test('spies on the order request body', async ({ page, cartWithItems, checkoutPage }) => {
  await cartWithItems.checkout()
  await checkoutPage.fillShipping(SHIPPING)
  await checkoutPage.placeOrder()

  // Listen BEFORE the click, await AFTER
  const orderRequest = page.waitForRequest((req) => req.url().endsWith('/api/orders') && req.method() === 'POST')
  const orderResponse = page.waitForResponse('**/api/orders')
  await checkoutPage.confirm()

  expect((await orderRequest).postDataJSON()).toEqual({ items: [1, 5], shipping: SHIPPING })
  expect((await orderResponse).status()).toBe(201)
  // Don't read response.json() here: the page navigates to /complete.html right after,
  // and Chromium drops the body of a response the page navigated away from.
  await expect(page).toHaveURL(/complete\.html\?order=\d+/)
  const orderId = new URL(page.url()).searchParams.get('order')
  await expect(checkoutPage.orderNumber).toHaveText(`#${orderId}`)
})

test('hybrid: state through the API, check through the UI', async ({ page, inventoryPage }) => {
  // page.request shares the page's cookies: it's the logged-in session
  const products = await (await page.request.get('/api/products')).json()
  await inventoryPage.goto()
  await expect(inventoryPage.cards).toHaveCount(products.length)
  await expect(inventoryPage.priceOf(products[0].name)).toHaveText(`$${products[0].price.toFixed(2)}`)
})
