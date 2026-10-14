import { test, expect } from '@playwright/test'
import { SHIPPING, USERS } from '../../test-data/users'

test.beforeEach(async ({ request }) => {
  await request.post('/api/login', { data: USERS.standard })
})

test('valid order → 201 with the right total', async ({ request }) => {
  const res = await request.post('/api/orders', { data: { items: [1, 5], shipping: SHIPPING } })
  expect(res.status()).toBe(201)
  expect(await res.json()).toMatchObject({ id: expect.any(Number), total: 37.98, items: [1, 5], shipping: SHIPPING })
})

test('missing postal code → 400', async ({ request }) => {
  const { postalCode, ...shipping } = SHIPPING
  const res = await request.post('/api/orders', { data: { items: [1], shipping } })
  expect(res.status()).toBe(400)
  expect(await res.json()).toEqual({ error: 'Missing fields: postalCode' })
})

test('empty cart → 400', async ({ request }) => {
  const res = await request.post('/api/orders', { data: { items: [], shipping: SHIPPING } })
  expect(res.status()).toBe(400)
  expect(await res.json()).toEqual({ error: 'Cart is empty' })
})
