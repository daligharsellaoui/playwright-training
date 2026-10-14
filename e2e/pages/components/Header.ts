import type { Locator, Page } from '@playwright/test'

/** Header shown on every logged-in page. On small screens the nav sits behind a burger. */
export class Header {
  readonly logo: Locator
  readonly burger: Locator
  readonly cartBadge: Locator
  readonly cartLink: Locator
  readonly productsLink: Locator
  readonly logoutButton: Locator

  constructor(private readonly page: Page) {
    this.logo = page.getByRole('link', { name: 'Demo Shop' })
    this.burger = page.getByRole('button', { name: 'Open menu' })
    this.cartBadge = page.getByTestId('cart-badge')
    this.cartLink = page.getByRole('link', { name: /Cart/ })
    this.productsLink = page.getByRole('link', { name: 'Products' })
    this.logoutButton = page.getByRole('button', { name: 'Logout' })
  }

  // The `if` hides a layout detail (responsive nav), not test logic.
  // isVisible() does NOT wait: without waiting for the header first, a call right after a
  // navigation sees no burger yet, skips it, then waits forever for a hidden nav link.
  private async openMenuIfCollapsed() {
    await this.logo.waitFor()
    if (await this.burger.isVisible()) await this.burger.click()
  }

  async openCart() {
    await this.openMenuIfCollapsed()
    await this.cartLink.click()
  }

  async openProducts() {
    await this.openMenuIfCollapsed()
    await this.productsLink.click()
  }

  async logout() {
    await this.openMenuIfCollapsed()
    await this.logoutButton.click()
  }
}