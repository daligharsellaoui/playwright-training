# Solutions — à ouvrir APRÈS avoir fait les exercices

`e2e/` est le projet Playwright **tel qu'il doit être à la fin du module 10**, avec toutes les
sections « À toi » résolues. Un fichier de test par module :

| Fichier | Module |
|---|---|
| `tests/01-smoke.spec.ts` | 1 — premiers tests |
| `tests/02-locators.spec.ts` | 2 — CSS vs rôles vs test ids, filtres, strict mode |
| `tests/03-forms-cart.spec.ts` | 3 — parcours d'achat, modale HTML, `confirm()` natif |
| `tests/04-assertions.spec.ts` | 4 — tests paramétrés, redirection, tri, `slow_user`, `expect.soft` |
| `tests/05-pom.spec.ts` + `pages/` | 5 — Page Object Model |
| `tests/auth.setup.ts`, `tests/06-fixtures.spec.ts`, `fixtures/` | 6 — storageState, fixtures custom et options |
| `tests/07-debug.spec.ts` | 7 — les 3 échecs volontaires (`test.fail()`) et leurs corrections, `test.step` |
| `tests/08-network.spec.ts`, `tests/api/` | 8 — mocks, erreurs, espion, tests API purs |
| `tests/09-browsers-mobile.spec.ts` | 9 — matrice de navigateurs, mobile, tags |
| `.github/workflows/playwright.yml`, `.gitlab-ci.yml` | 10 — CI avec sharding et fusion des rapports |
| `tests/visual-a11y.spec.ts` | Bonus — screenshots, axe, aria snapshot |

## Lancer

```bash
cd solutions/e2e
npm install
npx playwright install            # + `sudo npx playwright install-deps` si WebKit refuse de démarrer
npm test                          # tous les projets
npm run test:smoke                # @smoke uniquement
npm run test:visual               # 1er run : crée les références (échec normal), puis compare
npm run typecheck
```

## Pièges trouvés en écrivant ces solutions (lis les commentaires dans le code)

1. **Logout + storageState partagé** (`05-pom.spec.ts`) : tous les tests partagent le même cookie `sid`.
   Un test qui se déconnecte détruit la session **côté serveur**, et les tests suivants sont redirigés vers le login.
   Ce test doit donc ouvrir sa propre session.
2. **`isVisible()` n'attend pas** (`pages/components/Header.ts`) : juste après une navigation, le burger
   « n'existe pas encore ». Attends que le header soit là avant de tester sa visibilité.
3. **Body d'une réponse suivie d'une navigation** (`08-network.spec.ts`) : Chromium jette le body si la page
   navigue juste après. Lis-le avant la navigation, ou vérifie autrement (ici, via l'URL).
4. **Masque trop étroit** (`visual-a11y.spec.ts`) : `#9` vs `#42` change la largeur du texte. Masque la phrase entière.
5. **`test.fail()` + timeout de test** (`07-debug.spec.ts`) : un dépassement du timeout du test ne compte pas comme
   « échec attendu ». Mets un timeout court sur l'**action**.
6. **Pas besoin de navigateur pour l'API** : le projet `api` n'a pas de `use.browserName`, il ne lance rien.
