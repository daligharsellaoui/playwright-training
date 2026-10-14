import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '../fixtures'

test.describe('visual', () => {
  test('inventory page', async ({ inventoryPage, page }) => {
    await expect(inventoryPage.cards).toHaveCount(6)
    await expect(page).toHaveScreenshot('inventory.png', { fullPage: true })
  })

  test('order complete, number masked', async ({ cartWithItems, checkoutPage, page }) => {
    await cartWithItems.checkout()
    await checkoutPage.fillShipping({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '75001' })
    await checkoutPage.placeOrder()
    await checkoutPage.confirm()
    await expect(checkoutPage.thankYou).toBeVisible()
    const orderLine = page.getByText('Your order number is')
    await expect(page).toHaveScreenshot('complete.png', { mask: [orderLine] })
  })
})

test.describe('accessibility', () => {
  for (const path of ['/inventory.html', '/cart.html', '/checkout.html']) {
    test(`no axe violations on ${path}`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole('status')).toBeHidden()
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
    })
  }

  test('confirm modal structure', async ({ cartWithItems, checkoutPage }) => {
    await cartWithItems.checkout()
    await checkoutPage.fillShipping({ firstName: 'Ada', lastName: 'Lovelace', postalCode: '75001' })
    await checkoutPage.placeOrder()
    await expect(checkoutPage.confirmDialog).toMatchAriaSnapshot(`
      - dialog "Confirm your order":
        - heading "Confirm your order" [level=2]
        - paragraph:
          - text: You are about to pay
          - strong: /\\$\\d+\\.\\d{2}/
        - button "Cancel"
        - button "Confirm"
    `)
  })
})