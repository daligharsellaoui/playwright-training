# Module 6 — StorageState & fixtures

**Objectif** : se connecter **une seule fois**, réutiliser la session partout, et injecter les POM via des fixtures.

## Partie A — `storageState`

- [ ] Crée `tests/auth.setup.ts` :
  ```ts
  import { test as setup, expect } from '@playwright/test'

  const authFile = '.auth/user.json'

  setup('authenticate', async ({ page }) => {
    // TODO: login via l'UI, attendre /inventory, puis :
    await page.context().storageState({ path: authFile })
  })
  ```
- [ ] Dans `playwright.config.ts`, ajoute un projet `setup` et fais-en une dépendance :
  ```ts
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  ```
- [ ] Ouvre `.auth/user.json` : trouve le cookie `sid`. Vérifie que `.auth/` est dans le `.gitignore`.
- [ ] Les tests de **login** ne doivent pas être connectés : `test.use({ storageState: { cookies: [], origins: [] } })`.
- [ ] Variante plus rapide : connecte-toi via l'**API** (`request.post('/api/login')`) au lieu de l'UI, puis `request.storageState(...)`.
- [ ] Question : pourquoi le panier (en `localStorage`) n'est **pas** partagé entre tests, alors que la session l'est ?

## Partie B — Custom fixtures

- [ ] Crée `fixtures/index.ts` :
  ```ts
  import { test as base } from '@playwright/test'
  import { InventoryPage } from '../pages/InventoryPage'
  // TODO: autres pages

  type Pages = { inventoryPage: InventoryPage /* TODO */ }

  export const test = base.extend<Pages>({
    inventoryPage: async ({ page }, use) => {
      const inventoryPage = new InventoryPage(page)
      await inventoryPage.goto()
      await use(inventoryPage)
    },
  })
  export { expect } from '@playwright/test'
  ```
- [ ] Les tests importent `test` depuis `fixtures`, plus depuis `@playwright/test`.
- [ ] Fixture `cartWithItems` : arrive sur `/cart.html` avec Backpack + Onesie déjà ajoutés.
  Bonus : remplis le panier via `localStorage` (`page.addInitScript`) plutôt que par l'UI.
- [ ] Fixture `lockedUserPage` pour tester `locked_user` sans toucher aux autres tests.

## Terminé quand

Un seul login UI par run (vérifie-le dans le rapport), et les tests reçoivent leurs pages prêtes à l'emploi.
