# Module 3 — Formulaires & panier

**Objectif** : enchaîner des actions utilisateur et gérer **les deux types** de popup.

## TODO

- [ ] `tests/checkout.spec.ts` : parcours complet
  - [ ] Login (`fill`, `click`, ou `press('Enter')`)
  - [ ] Ajoute « Backpack » et « Onesie » au panier
  - [ ] Ouvre le panier via le lien du header
  - [ ] « Checkout » → remplis First name / Last name / Postal code
  - [ ] « Place order » → une **modale HTML** s'ouvre : clique « Confirm » **dans la modale**
  - [ ] Arrive sur « Thank you for your order! »
- [ ] Teste « Cancel » dans la modale : tu restes sur le checkout.
- [ ] **Popup native** : sur `/cart.html`, « Clear cart » ouvre un `confirm()` du navigateur.
  - [ ] Accepte-la : le panier est vide.
  - [ ] Refuse-la (`dismiss`) : le panier est intact.
- [ ] Trie les produits avec le `<select>` « Sort by » (`selectOption`) et vérifie le premier produit.
- [ ] Clique « Add to cart » puis « Remove » sur le même produit : que devient le bouton ?

## Indices

- Modale HTML (`<dialog>`) : `page.getByRole('dialog', { name: 'Confirm your order' })`, puis cherche le bouton **dedans**.
- Popup native : enregistre le handler **avant** le clic :
  ```ts
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Clear cart' }).click()
  ```
  Sans handler, Playwright refuse (`dismiss`) automatiquement les `confirm()`.
- `dialog.message()` te donne le texte de la popup : vérifie-le aussi.

## Terminé quand

Le parcours complet passe, et les deux popups sont testées dans les deux sens (accepter / refuser).
