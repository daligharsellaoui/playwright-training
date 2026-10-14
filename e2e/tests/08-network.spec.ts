import { test, expect } from '@playwright/test'
import { GUEST } from '../test-data/users'

test.use({ storageState: GUEST })

test.describe('page.route() mocks', () => {
  test('mock products API with fake data', async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({
        json: [
          { id: 99, name: 'Fake Product', price: 0.01, description: 'Mocked' },
          { id: 100, name: 'Another Fake', price: 99.99, description: 'Also mocked' },
        ],
      })
    )
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByTestId('product-card')).toHaveCount(2)
    await expect(page.getByRole('heading', { name: 'Fake Product' })).toBeVisible()
  })

  test('modify real response', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch()
      const json = await response.json()
      json[0].name = 'Mocked Backpack'
      await route.fulfill({ response, json })
    })
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('heading', { name: 'Mocked Backpack' })).toBeVisible()
  })

  test('simulate server error', async ({ page }) => {
    await page.route('**/api/products', (route) =>
      route.fulfill({ status: 500, json: { error: 'Internal Server Error' } })
    )
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('alert')).toContainText('Could not load products')
  })

  test('empty products list', async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ json: [] }))
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByTestId('product-card')).toHaveCount(0)
  })

  test('mock order rejection', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('75001')
    await page.route('**/api/orders', (route) =>
      route.fulfill({ status: 400, json: { error: 'Payment declined' } })
    )
    await page.getByRole('button', { name: 'Place order' }).click()
    await page.getByRole('dialog', { name: 'Confirm your order' }).getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByRole('alert')).toContainText('Payment declined')
  })
})

test.describe('spy on network', () => {
  test('verify order request body', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByTestId('product-card').filter({ hasText: 'Onesie' }).getByRole('button', { name: 'Add to cart' }).click()
    await page.getByRole('link', { name: /Cart/ }).click()
    await page.getByRole('button', { name: 'Checkout' }).click()
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Postal code').fill('75001')

    await page.getByRole('button', { name: 'Place order' }).click()
    const requestPromise = page.waitForRequest('**/api/orders')
    await page.getByRole('dialog', { name: 'Confirm your order' }).getByRole('button', { name: 'Confirm' }).click()
    const request = await requestPromise
    const postData = request.postDataJSON()
    expect(postData.items).toEqual([1, 5])
    expect(postData.shipping).toEqual({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '75001' })
  })
})

test.describe('delayed responses', () => {
  test('shows loading state during slow products API', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await new Promise((r) => setTimeout(r, 2000))
      await route.continue()
    })
    await page.goto('/')
    await page.getByLabel('Username').fill('standard_user')
    await page.getByLabel('Password').fill('secret_sauce')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.getByRole('status')).toBeVisible()
    await expect(page.getByRole('status')).toBeHidden({ timeout: 10000 })
    await expect(page.getByTestId('product-card')).toHaveCount(6)
  })
})