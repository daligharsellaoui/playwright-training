# Module 8 — Interception & mock API

**Objectif** : contrôler le réseau (mock, erreurs, latence) et tester l'API directement.

## Partie A — `page.route()`

- [ ] **Mock** : intercepte `**/api/products` et renvoie 2 produits inventés (dont un à `$0.01`).
  Vérifie que la page n'affiche que ces 2 produits.
- [ ] **Modifier la vraie réponse** : `route.fetch()`, puis renomme « Backpack » en « Mocked Backpack » et `route.fulfill({ response, json })`.
- [ ] **Erreur serveur** : renvoie un `500` → la page affiche `Could not load products: …`.
- [ ] **Liste vide** : `[]` → aucune carte. Le message est-il clair pour l'utilisateur ? (Note le manque : c'est un vrai bug UX à remonter.)
- [ ] **Commande refusée** : intercepte `POST /api/orders` → `400 { error: 'Payment declined' }` → le message s'affiche sur le checkout.
- [ ] **Espionner** sans mocker : `page.waitForRequest` / `waitForResponse` pour vérifier le **body** envoyé à `/api/orders` (items + shipping).
- [ ] **Latence** : retarde `/api/products` de 2 s, puis vérifie que « Loading products… » est visible et disparaît.

## Partie B — `request` (tests API purs, sans navigateur)

- [ ] `tests/api/products.spec.ts` :
  - [ ] `GET /api/health` → 200 `{ status: 'ok' }`
  - [ ] `GET /api/products` **sans** session → 401
  - [ ] `POST /api/login` puis `GET /api/products` → 6 produits, chacun avec `id`, `name`, `price`
  - [ ] `GET /api/products/999` → 404
  - [ ] `POST /api/orders` sans `postalCode` → 400 + message
  - [ ] `POST /api/orders` valide → 201, `total` correct
- [ ] **Hybride** : crée l'état par l'API (login), vérifie par l'UI.

## Indices

```ts
await page.route('**/api/products', (route) =>
  route.fulfill({ json: [{ id: 99, name: 'Fake', price: 0.01, description: 'Mocked' }] })
)
```
- Déclare la route **avant** `page.goto()`.
- La fixture `request` partage `baseURL`, et garde les cookies entre ses appels.

## Terminé quand

Au moins un test pour chaque cas : mock, erreur, espion, et un fichier de tests API pur.
