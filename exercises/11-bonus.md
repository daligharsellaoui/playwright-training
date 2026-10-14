# Bonus — Visual regression & accessibilité

## Visual regression

- [ ] `await expect(page).toHaveScreenshot('inventory.png')`. Le 1er run crée la référence, les suivants comparent.
- [ ] Change une couleur dans `demo-shop/public/styles.css` → le test casse → regarde le diff dans le rapport.
- [ ] `--update-snapshots` pour accepter un changement voulu.
- [ ] `mask: [page.getByTestId('order-number')]` pour ignorer une zone variable.
- [ ] Question : pourquoi les screenshots générés sur ton Linux ne matchent pas en CI ? (Indice : Docker, image `mcr.microsoft.com/playwright`.)

## Accessibilité

- [ ] `npm i -D @axe-core/playwright`
- [ ] Scan de chaque page :
  ```ts
  import AxeBuilder from '@axe-core/playwright'
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
  ```
- [ ] Analyse les violations trouvées (s'il y en a) et corrige l'app.
- [ ] `expect(locator).toMatchAriaSnapshot(...)` sur la modale de confirmation.

## Pour aller plus loin

- `test.describe.configure({ mode: 'serial' })` : quand (et pourquoi c'est rarement une bonne idée)
- Variables d'environnement (`dotenv`) pour `baseURL` et les credentials
- `globalSetup` vs projet `setup` : différences
- Reporters custom, `testInfo.attach()`
