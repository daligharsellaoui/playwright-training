# Module 5 — Page Object Model

**Objectif** : sortir les locators et les actions des tests, pour que les tests se lisent comme un scénario métier.

## Structure cible

```
e2e/
  pages/
    LoginPage.ts
    InventoryPage.ts
    CartPage.ts
    CheckoutPage.ts
    components/Header.ts      # badge, lien panier, logout, burger : présent sur toutes les pages
  tests/
```

## Starter

```ts
// pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly username: Locator
  readonly password: Locator
  readonly submit: Locator
  readonly error: Locator

  constructor(private readonly page: Page) {
    this.username = page.getByLabel('Username')
    // TODO: password, submit, error
  }

  async goto() {
    // TODO
  }

  async login(username: string, password: string) {
    // TODO
  }
}
```

## TODO

- [ ] `LoginPage` : `goto()`, `login(user, pwd)`, locator `error`
- [ ] `InventoryPage` : `productCard(name)`, `addToCart(name)`, `removeFromCart(name)`, `sortBy(option)`, `prices()`
- [ ] `CartPage` : `items`, `total`, `remove(name)`, `clear({ accept })`, `checkout()`
- [ ] `CheckoutPage` : `fillShipping({ firstName, lastName, postalCode })`, `placeOrder()`, `confirmDialog`
- [ ] `Header` (composant réutilisé) : `cartBadge`, `openCart()`, `logout()`
- [ ] Réécris les tests des modules 3 et 4 avec les POM. Le parcours checkout doit tenir en ~10 lignes lisibles.
- [ ] Données de test dans `test-data/users.ts` (pas de `'secret_sauce'` en dur dans 15 fichiers).

## Règles à respecter

- **Pas d'`expect` dans les POM** (débat ouvert, mais commence comme ça) : les POM exposent des locators, les tests vérifient.
- Les méthodes décrivent une **intention** (`addToCart('Backpack')`), pas un geste (`clickSecondButton()`).
- Pas de logique de test (`if`) dans les POM.

## Terminé quand

Aucun `page.getBy…` dans `tests/`, uniquement dans `pages/`.
