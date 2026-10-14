import type { Locator, Page } from '@playwright/test'
import { Header } from './components/Header'

export type Shipping = { firstName: string; lastName: string; postalCode: string }

export class CheckoutPage {
  readonly header: Header
  readonly firstName: Locator
  readonly lastName: Locator
  readonly postalCode: Locator
  readonly total: Locator
  readonly placeOrderButton: Locator
  readonly orderError: Locator
  readonly confirmDialog: Locator
  readonly confirmButton: Locator
  readonly cancelButton: Locator
  readonly thankYou: Locator
  readonly orderNumber: Locator

  constructor(private readonly page: Page) {
    this.header = new Header(page)
    this.firstName = page.getByLabel('First name')
    this.lastName = page.getByLabel('Last name')
    this.postalCode = page.getByLabel('Postal code')
    this.total = page.getByTestId('checkout-total')
    this.placeOrderButton = page.getByRole('button', { name: 'Place order' })
    this.orderError = page.getByRole('alert')
    this.confirmDialog = page.getByRole('dialog', { name: 'Confirm your order' })
    this.confirmButton = this.confirmDialog.getByRole('button', { name: 'Confirm' })
    this.cancelButton = this.confirmDialog.getByRole('button', { name: 'Cancel' })
    // complete.html
    this.thankYou = page.getByRole('heading', { name: 'Thank you for your order!' })
    this.orderNumber = page.getByTestId('order-number')
  }

  async goto() {
    await this.page.goto('/checkout.html')
  }

  fieldError(message: string) {
    return this.page.getByText(message, { exact: true })
  }

  async fillShipping({ firstName, lastName, postalCode }: Shipping) {
    await this.firstName.fill(firstName)
    await this.lastName.fill(lastName)
    await this.postalCode.fill(postalCode)
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }

  async confirm() {
    await this.confirmButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
