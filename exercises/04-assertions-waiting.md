# Module 4 — Assertions & waiting

**Objectif** : comprendre l'**auto-waiting** et les **web-first assertions**. Règle d'or : jamais de `waitForTimeout`.

## TODO

- [ ] Badge panier : après 2 ajouts, `expect(badge).toHaveText('2')`. Après suppression de tout, il est caché (`toBeHidden`).
- [ ] Redirection : `toHaveURL(/inventory/)` après login.
  Va sur `/cart.html` sans être connecté : redirigé vers `/?redirected=1` + message « You must log in… ».
- [ ] Messages d'erreur du login (un test par cas, ou un `for` sur un tableau de cas) :
  | Saisie | Message attendu |
  |---|---|
  | rien | `Username is required` |
  | user seul | `Password is required` |
  | mauvais mot de passe | `Username and password do not match any user` |
  | `locked_user` | `Sorry, this user has been locked out` |
- [ ] Le message d'erreur se ferme avec le bouton « Close error ».
- [ ] Validation du checkout : soumets vide → 3 erreurs. Code postal `123` → `Postal code must be 5 digits`.
  Vérifie aussi `toHaveAttribute('aria-invalid', 'true')`.
- [ ] Totaux : `cart-total` et la modale affichent le bon montant (Backpack + Onesie = `$37.98`).
- [ ] Tri : après « Price (low to high) », les prix sont croissants (`allTextContents()` + tri en JS).
- [ ] **`slow_user`** (API à 3 s) : ton test de login passe-t-il ? Avec quel timeout ?
  Corrige-le **localement** (`expect(..., { timeout: 10_000 })` ou `test.slow()`), pas en augmentant le timeout global.
- [ ] Expérience : ajoute un `await page.waitForTimeout(2000)` puis retire-le. Pourquoi c'est une mauvaise pratique ?

## Indices

- `expect(locator)` réessaie jusqu'au timeout (5 s par défaut) ; `expect(await locator.textContent())` ne réessaie **pas**.
  Compare les deux sur la liste des produits (chargée avec 400 ms de latence).
- `toHaveCount`, `toContainText`, `toBeEnabled`, `toHaveValue`, `expect.soft`, `expect.poll`.
- Le bouton « Place order » est désactivé tant que le total n'est pas chargé. Le `click()` de Playwright attend qu'il soit activé : tu n'as rien à faire.

## Terminé quand

Aucun `waitForTimeout` et aucune assertion sur une valeur lue « à la main », sauf le tri (justifié).
