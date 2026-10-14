# Formation Playwright

Deux projets séparés :

| Dossier | Rôle |
|---|---|
| `demo-shop/` | L'application à tester : mini e-shop (login, produits, panier, checkout) avec une vraie API JSON. Zéro dépendance. |
| `e2e/` | **Ton** projet Playwright. Il n'existe pas encore : tu le crées au module 1. |
| `exercises/` | Un fichier par module : objectifs, TODO à cocher, indices, critère « terminé ». |
| `solutions/` | Projet Playwright corrigé (fin du module 10) + CI. À ouvrir **après** les exercices. |
| `guide/` | **`Formation-Playwright.pdf`** : le guide pas à pas complet (initiation + 10 modules + aide-mémoire). Source : `guide.html`. |

## Lancer l'app

```bash
cd demo-shop
npm start            # http://localhost:3000  (PORT=4000 npm start pour changer)
```

Comptes (mot de passe `secret_sauce` pour tous) :

| Utilisateur | Comportement |
|---|---|
| `standard_user` | normal |
| `locked_user` | refusé à la connexion (message d'erreur) |
| `slow_user` | chaque appel API prend 3 s, pour tester les timeouts et le waiting |

## Ce que l'app offre pour s'entraîner

- **Pages** : `/` (login), `/inventory.html`, `/cart.html`, `/checkout.html`, `/complete.html`.
  Les pages protégées redirigent vers `/?redirected=1` sans session.
- **Session** : cookie `sid` HttpOnly (côté serveur). **Panier** : `localStorage` (clé `cart`).
  Les deux sont capturés par `storageState` (module 6).
- **API** :
  - `POST /api/login` `{username, password}` → 200 / 400 / 401 / 403
  - `POST /api/logout`
  - `GET /api/health` (sans auth)
  - `GET /api/me`, `GET /api/products` (latence 400 ms), `GET /api/products/:id`
  - `POST /api/orders` `{items: [ids], shipping: {firstName, lastName, postalCode}}` → 201 / 400
- **Deux types de popup** : `confirm()` natif (bouton « Clear cart ») et `<dialog>` HTML (« Place order »).
- **Validation de formulaire** : champs requis, code postal à 5 chiffres.
- **Responsive** : sous 640 px, la nav passe derrière un bouton burger « Open menu ».
- **Sélecteurs** : mélange volontaire d'`id` CSS bruts, de `data-testid` et de labels/rôles accessibles.
  Cherche toujours le locator le plus « utilisateur » possible.

## Parcours

| # | Module | Fichier |
|---|---|---|
| 1 | Setup & premier test | [exercises/01-setup.md](exercises/01-setup.md) |
| 2 | Locateurs | [exercises/02-locators.md](exercises/02-locators.md) |
| 3 | Formulaires & panier | [exercises/03-forms-cart.md](exercises/03-forms-cart.md) |
| 4 | Assertions & waiting | [exercises/04-assertions-waiting.md](exercises/04-assertions-waiting.md) |
| 5 | Page Object Model | [exercises/05-pom.md](exercises/05-pom.md) |
| 6 | StorageState & fixtures | [exercises/06-auth-fixtures.md](exercises/06-auth-fixtures.md) |
| 7 | Outillage & Trace Viewer | [exercises/07-debug-trace.md](exercises/07-debug-trace.md) |
| 8 | Interception & mock API | [exercises/08-network-api.md](exercises/08-network-api.md) |
| 9 | Multi-navigateurs & mobile | [exercises/09-browsers-mobile.md](exercises/09-browsers-mobile.md) |
| 10 | CI GitHub Actions | [exercises/10-ci.md](exercises/10-ci.md) |
| ★ | Bonus : visuel & accessibilité | [exercises/11-bonus.md](exercises/11-bonus.md) |

Conseil : un commit par module (`git commit -m "module 3"`), pour pouvoir comparer et revenir en arrière.
