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
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // No browser needed: the `request` fixture talks to the API directly
    { name: 'api', testMatch: /api\/.*\.spec\.ts/ },

    // Default project: NO storageState. Tests that need auth use fixtures (which rely on setup dependency)
    // or explicitly opt in. Login tests override with test.use({ storageState: GUEST }).
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'], ...uiOnly },
    { name: 'chromium-auth', use: { ...devices['Desktop Chrome'], ...auth }, dependencies: ['setup'], ...uiOnly },
  ],
  webServer: {
    command: 'npm start --prefix ../demo-shop',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
  },
})