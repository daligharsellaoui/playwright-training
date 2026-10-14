import { defineConfig, devices } from '@playwright/test'

export const AUTH_FILE = '.auth/user.json'
const auth = { storageState: AUTH_FILE }

// UI specs that don't depend on the layout (desktop vs mobile header) run on every browser.
// API and visual specs get their own project, so they don't run once per browser.
const uiOnly = { testIgnore: [/api\//, /visual/, /\.setup\.ts/] }

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // No browser needed: the `request` fixture talks to the API directly
    { name: 'api', testMatch: /api\/.*\.spec\.ts/ },

    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...auth }, dependencies: ['setup'], ...uiOnly },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], ...auth }, dependencies: ['setup'], ...uiOnly },
    { name: 'webkit', use: { ...devices['Desktop Safari'], ...auth }, dependencies: ['setup'], ...uiOnly },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], ...auth },
      dependencies: ['setup'],
      // Modules 2-4 use raw locators on the desktop header on purpose; from module 5 on,
      // the Header page object handles the burger menu, so those specs run on mobile too.
      testMatch: [/05-.*\.spec\.ts/, /06-.*\.spec\.ts/, /09-.*\.spec\.ts/],
    },

    // Screenshots depend on OS and fonts: only one browser, run on demand (npm run test:visual)
    { name: 'visual', use: { ...devices['Desktop Chrome'], ...auth }, dependencies: ['setup'], testMatch: /visual/ },
  ],
  webServer: {
    command: 'npm start --prefix ../../demo-shop',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
  },
})
