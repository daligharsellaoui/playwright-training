import { test, expect } from '@playwright/test'
import { USERS } from '../../test-data/users'

// Module 8, part B: API tests, no browser. The `api` project has no storageState.

test('health is public', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  expect(await res.json()).toEqual({ status: 'ok' })
})

test('products require a session', async ({ request }) => {
  const res = await request.get('/api/products')
  expect(res.status()).toBe(401)
  expect(await res.json()).toEqual({ error: 'Not authenticated' })
})

test.describe('logged in', () => {
  test.beforeEach(async ({ request }) => {
    const res = await request.post('/api/login', { data: USERS.standard })
    expect(res.ok()).toBeTruthy()
  })

  test('returns 6 well-formed products', async ({ request }) => {
    const res = await request.get('/api/products')
    expect(res.ok()).toBeTruthy()
    const products = await res.json()
    expect(products).toHaveLength(6)
    for (const product of products) {
      expect(product).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(Number),
        description: expect.any(String),
      })
    }
  })

  test('one product by id', async ({ request }) => {
    const res = await request.get('/api/products/4')
    expect(await res.json()).toMatchObject({ id: 4, name: 'Fleece Jacket', price: 49.99 })
  })

  test('unknown product is 404', async ({ request }) => {
    expect((await request.get('/api/products/999')).status()).toBe(404)
  })

  test('/api/me returns the user', async ({ request }) => {
    expect(await (await request.get('/api/me')).json()).toEqual({ username: 'standard_user', name: 'Standard User' })
  })

  test('logout ends the session', async ({ request }) => {
    await request.post('/api/logout')
    expect((await request.get('/api/me')).status()).toBe(401)
  })
})

test.describe('login errors', () => {
  const cases = [
    { title: 'missing fields', data: {}, status: 400 },
    { title: 'wrong password', data: { username: 'standard_user', password: 'nope' }, status: 401 },
    { title: 'locked user', data: USERS.locked, status: 403 },
  ]
  for (const { title, data, status } of cases) {
    test(`login ${title} → ${status}`, async ({ request }) => {
      const res = await request.post('/api/login', { data })
      expect(res.status()).toBe(status)
      expect(await res.json()).toHaveProperty('error')
    })
  }
})
