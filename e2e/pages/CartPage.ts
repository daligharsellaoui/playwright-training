import type { Locator, Page } from '@playwright/test'
import { Header } from './components/Header'

export class CartPage {
  readonly header: Header
  readonly items: Locator
  readonly total: Locator
  readonly emptyMessage: Locator
  readonly clearButton: Locator
  readonly checkoutButton: Locator
  readonly continueShopping: Locator

  constructor(private readonly page: Page) {
    this.header = new Header(page)
    this.items = page.getByTestId('cart-item')
    this.total = page.getByTestId('cart-total')
    this.emptyMessage = page.getByText('Your cart is empty.')
    this.clearButton = page.getByRole('button', { name: 'Clear cart' })
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' })
    this.continueShopping = page.getByRole('link', { name: 'Continue shopping' })
  }

  async goto() {
    await this.page.goto('/cart.html')
  }

  item(name: string) {
    return this.items.filter({ hasText: name })
  }

  async remove(name: string) {
    await this.item(name).getByRole('button', { name: 'Remove' }).click()
  }

  /** "Clear cart" opens a native confirm(); accept or dismiss it. Returns the dialog message. */
  async clear({ accept }: { accept: boolean }) {
    const dialogPromise = this.page.waitForEvent('dialog')
    const click = this.clearButton.click()
    const dialog = await dialogPromise
    const message = dialog.message()
    await (accept ? dialog.accept() : dialog.dismiss())
    await click
    return message
  }

  async checkout() {
    await this.checkoutButton.click()
  }
}