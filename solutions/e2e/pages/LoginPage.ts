import type { Locator, Page } from '@playwright/test'

export class LoginPage {
  readonly username: Locator
  readonly password: Locator
  readonly submit: Locator
  readonly error: Locator
  readonly closeError: Locator
  readonly redirectInfo: Locator

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username')
    this.password = page.getByLabel('Password')
    this.submit = page.getByRole('button', { name: 'Login' })
    this.error = page.getByRole('alert')
    this.closeError = page.getByRole('button', { name: 'Close error' })
    this.redirectInfo = page.getByText('You must log in to access this page.')
  }

  async goto() {
    await this.page.goto('/')
  }

  async login(username: string, password: string) {
    await this.username.fill(username)
    await this.password.fill(password)
    await this.submit.click()
  }
}
