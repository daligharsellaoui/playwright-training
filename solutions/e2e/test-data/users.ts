export const PASSWORD = 'secret_sauce'

export const USERS = {
  standard: { username: 'standard_user', password: PASSWORD },
  locked: { username: 'locked_user', password: PASSWORD },
  slow: { username: 'slow_user', password: PASSWORD },
} as const

export const SHIPPING = { firstName: 'Ada', lastName: 'Lovelace', postalCode: '75001' }

// Product ids from demo-shop/server.js
export const PRODUCT_IDS = { Backpack: 1, 'Bike Light': 2, 'Bolt T-Shirt': 3, 'Fleece Jacket': 4, Onesie: 5, 'Red T-Shirt': 6 } as const
export type ProductName = keyof typeof PRODUCT_IDS

// Browser state for "not logged in" tests (overrides the project's storageState)
export const GUEST = { cookies: [], origins: [] }
