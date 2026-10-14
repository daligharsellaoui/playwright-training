# Module 7 — Outillage & Trace Viewer

**Objectif** : savoir diagnostiquer un test rouge **sans le relancer 10 fois**.

## TODO

- [ ] Config : `use: { trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure' }` et `retries: 1`.
- [ ] **Échec 1 — mauvais locator** : `getByRole('button', { name: 'Add to bag' })`.
  Lis le message d'erreur : timeout ? strict mode ? Que propose Playwright ?
- [ ] **Échec 2 — mauvaise assertion** : attends `$40.00` au lieu de `$37.98`. Lis le diff.
- [ ] **Échec 3 — flaky** : lis le total **sans** web-first assertion (`await locator.textContent()`) juste après la navigation vers le checkout.
  Lance `--repeat-each=20` : ça casse toujours, ou seulement parfois ? Pourquoi ? (Indice : `checkout-total` affiche `…` tant que l'API n'a pas répondu.)
- [ ] Ouvre le rapport (`npx playwright show-report`) puis la trace d'un échec. Pour chaque échec, trouve :
  - [ ] l'action qui a échoué dans la **timeline**
  - [ ] le **DOM snapshot** avant/après l'action (onglets Before / After)
  - [ ] l'appel `GET /api/products` dans l'onglet **Network**, avec sa durée
  - [ ] les logs **Console**
- [ ] `npx playwright test --debug` : avance pas à pas avec l'Inspector.
- [ ] `await page.pause()` dans un test, puis lance en `--headed`.
- [ ] Ouvre une trace sur https://trace.playwright.dev (glisser-déposer le `.zip`).
- [ ] Ajoute `test.step('Fill shipping', async () => {...})` dans le parcours checkout : regarde le rapport.

## Terminé quand

Tu sais dire, à partir de la trace seule, pourquoi chacun des 3 tests a échoué. Ensuite, remets-les au vert.
