import { test, expect } from '@playwright/test'
import { USERS } from '../../test-data/users'

test.describe('products API', () => {
  test('health endpoint', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body).toEqual({ status: 'ok' })
  })

  test('products requires authentication', async ({ request }) => {
    const response = await request.get('/api/products')
    expect(response.status()).toBe(401)
  })

  test('get products with valid session', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.get('/api/products')
    expect(response.ok()).toBeTruthy()
    const products = await response.json()
    expect(products).toHaveLength(6)
    for (const product of products) {
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('price')
    }
  })

  test('get single product', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.get('/api/products/1')
    expect(response.ok()).toBeTruthy()
    const product = await response.json()
    expect(product).toEqual({
      id: 1,
      name: 'Backpack',
      price: 29.99,
      description: 'Carry everything, everywhere.',
    })
  })

  test('product not found', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.get('/api/products/999')
    expect(response.status()).toBe(404)
  })
})