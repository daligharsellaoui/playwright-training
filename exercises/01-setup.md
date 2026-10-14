# Module 1 — Setup & premier test

**Objectif** : avoir un projet Playwright qui tourne contre `demo-shop`, et connaître les 3 façons de lancer les tests.

## TODO

- [ ] Depuis la racine `playwright-training/` : `npm init playwright@latest e2e`
  - TypeScript : oui · dossier des tests : `tests` · GitHub Actions : **non** (on l'écrit au module 10) · installer les navigateurs : oui
- [ ] Supprime `tests/example.spec.ts` (garde-le ouvert à côté pour lire la syntaxe d'abord).
- [ ] Dans `playwright.config.ts` :
  - [ ] `use.baseURL: 'http://localhost:3000'`, pour écrire `page.goto('/')`
  - [ ] `webServer` qui démarre l'app tout seul :
    ```ts
    webServer: {
      command: 'npm start --prefix ../demo-shop',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !process.env.CI,
    },
    ```
  - [ ] Pour l'instant, garde seulement le projet `chromium` (les autres reviennent au module 9).
- [ ] Crée `tests/smoke.spec.ts` : ouvre `/` et vérifie que le titre de l'onglet contient `Demo Shop`.
- [ ] Lance-le de 3 façons et note la différence :
  - [ ] `npx playwright test`
  - [ ] `npx playwright test --headed`
  - [ ] `npx playwright test --ui` (**UI mode** : ton outil principal à partir de maintenant)
- [ ] Ouvre le rapport : `npx playwright show-report`.

## Indices

- `await expect(page).toHaveTitle(/Demo Shop/)`
- Pourquoi `smoke.spec.ts` et pas `login.spec.ts` ? Ce test ne se connecte pas : nomme les fichiers d'après ce qu'ils testent.

## Terminé quand

`npx playwright test` est vert **sans** que tu aies lancé l'app à la main.
