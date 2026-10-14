import { test, expect } from '@playwright/test'
import { USERS, SHIPPING } from '../../test-data/users'

test.describe('orders API', () => {
  test('create order requires all shipping fields', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.post('/api/orders', {
      data: { items: [1], shipping: { firstName: 'Ada', lastName: 'Lovelace' } },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('postalCode')
  })

  test('create order fails with empty cart', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.post('/api/orders', {
      data: { items: [], shipping: SHIPPING },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('Cart is empty')
  })

  test('create valid order', async ({ request }) => {
    await request.post('/api/login', { data: USERS.standard })
    const response = await request.post('/api/orders', {
      data: { items: [1, 5], shipping: SHIPPING },
    })
    expect(response.status()).toBe(201)
    const order = await response.json()
    expect(order).toHaveProperty('id')
    expect(order.items).toEqual([1, 5])
    expect(order.shipping).toEqual(SHIPPING)
    expect(order.total).toBe(37.98)
  })
})