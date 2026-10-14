# Module 2 — Locateurs

**Objectif** : choisir des locators robustes, dans l'ordre de priorité recommandé :
`getByRole` → `getByLabel` / `getByPlaceholder` / `getByText` → `getByTestId` → CSS en dernier recours.

## TODO

- [ ] **Commence par l'outil** : `npx playwright codegen localhost:3000`. Connecte-toi, ajoute un produit, puis regarde ce que codegen génère.
- [ ] Crée `tests/login.spec.ts` en écrivant d'abord une **mauvaise** version avec des sélecteurs CSS : `#user-name`, `#password`, `#login-button`.
- [ ] Réécris-la avec des locators utilisateur :
  - [ ] `getByLabel('Username')`, `getByLabel('Password')`
  - [ ] `getByRole('button', { name: 'Login' })`
- [ ] Même test avec `getByTestId('username')`. Quand préférer l'un ou l'autre ?
- [ ] Sur `/inventory.html` :
  - [ ] Compte les cartes produits (`getByTestId('product-card')`) : il y en a 6.
  - [ ] **Ciblage dynamique** : clique sur « Add to cart » **du produit "Bolt T-Shirt"**.
    Tous les boutons s'appellent « Add to cart » : il faut filtrer la carte d'abord.
  - [ ] Écris une fonction `productCard(page, name)` qui renvoie le locator d'une carte par son nom.
  - [ ] Récupère le prix de « Fleece Jacket » via la carte, sans dépendre de sa position dans la liste.
- [ ] Bonus : trouve le bouton burger avec `getByRole` (indice : il a un `aria-label`).

## Indices

```ts
page.getByTestId('product-card').filter({ hasText: 'Bolt T-Shirt' })
  .getByRole('button', { name: 'Add to cart' })
```
- `filter({ has: page.getByRole('heading', { name: 'Backpack', exact: true }) })` est plus strict que `hasText`.
  Vérifie la différence avec « Bolt T-Shirt » / « Red T-Shirt » et `hasText: 'T-Shirt'`.
- Dans UI mode, l'icône « Pick locator » te propose le meilleur locator d'un élément.
- Erreur `strict mode violation` = ton locator matche plusieurs éléments. C'est voulu : affine-le.

## Terminé quand

Aucun `#id` ni `.class` dans tes tests, sauf un commentaire qui justifie l'exception.
