# Module 9 — Multi-navigateurs & mobile

**Objectif** : une matrice de tests, en parallèle.

## TODO

- [ ] `npx playwright install` (Firefox + WebKit).
- [ ] Projets `chromium`, `firefox`, `webkit` (avec `storageState` + `dependencies: ['setup']`).
- [ ] Projet `mobile` : `devices['iPhone 13']`.
- [ ] Lance tout et compare les durées : `npx playwright test` vs `--workers=1` vs `--project=firefox`.
- [ ] Sur mobile, la nav est cachée derrière le burger « Open menu ». Ton test « ouvrir le panier » casse :
  - [ ] Fais évoluer `Header.openCart()` pour ouvrir le burger si besoin (`isMobile` de la fixture, ou visibilité du burger).
  - [ ] Ou sépare les tests mobiles avec `testMatch` / `grep` / tags (`@mobile`).
- [ ] Test qui ne tourne **que** sur mobile : le burger passe `aria-expanded` de `false` à `true`.
- [ ] `test.skip(browserName === 'webkit', 'raison')` : quand est-ce légitime ?
- [ ] `fullyParallel: true` : tes tests sont-ils vraiment indépendants ? Lance `--repeat-each=5`.
- [ ] Tags : `test('…', { tag: '@smoke' }, …)` puis `npx playwright test --grep @smoke`.

## Terminé quand

Toute la suite est verte sur les 4 projets, sans `if (browserName)` dans les tests eux-mêmes.
