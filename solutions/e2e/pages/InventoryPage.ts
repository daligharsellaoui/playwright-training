import type { Locator, Page } from '@playwright/test'
import { Header } from './components/Header'
import type { ProductName } from '../test-data/users'

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'

export class InventoryPage {
  readonly header: Header
  readonly heading: Locator
  readonly cards: Locator
  readonly prices: Locator
  readonly sortSelect: Locator
  readonly loading: Locator
  readonly loadError: Locator

  constructor(private readonly page: Page) {
    this.header = new Header(page)
    this.heading = page.getByRole('heading', { name: 'Products' })
    this.cards = page.getByTestId('product-card')
    this.prices = page.getByTestId('product-price')
    this.sortSelect = page.getByLabel('Sort by')
    this.loading = page.getByRole('status')
    this.loadError = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/inventory.html')
  }

  productCard(name: string) {
    return this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) })
  }

  addButton(name: string) {
    return this.productCard(name).getByRole('button', { name: 'Add to cart' })
  }

  removeButton(name: string) {
    return this.productCard(name).getByRole('button', { name: 'Remove' })
  }

  priceOf(name: string) {
    return this.productCard(name).getByTestId('product-price')
  }

  async addToCart(...names: ProductName[]) {
    for (const name of names) await this.addButton(name).click()
  }

  async removeFromCart(name: ProductName) {
    await this.removeButton(name).click()
  }

  async sortBy(option: SortOption) {
    await this.sortSelect.selectOption(option)
  }

  /** Displayed prices as numbers. Call it once the list is rendered (it does not wait). */
  async priceValues() {
    return (await this.prices.allTextContents()).map((p) => Number(p.replace('$', '')))
  }

  async names() {
    return this.cards.getByRole('heading').allTextContents()
  }
}
