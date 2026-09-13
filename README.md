# Forkalope web

The deployable HTML is generated from page content and route metadata.

```sh
npm run build
```

Edit page copy in `site/content/`. Edit titles, descriptions, paths, shared
navigation, and asset lists in `site/site-routes.js` and
`scripts/build-site-pages.js`. The generated site is written to `dist/`, which
is what `deploy.sh` publishes.

`npm run build:pages` writes only the generated pages to `.generated/` for a
quick page-generation check.
