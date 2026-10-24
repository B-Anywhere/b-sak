# AGENTS.md

Static, **no-build, zero-dependency** site: vanilla JS + plain CSS, deployed to GitHub Pages.

## Rules

- Do NOT add a bundler, framework, npm/bun dependencies, `package.json`, or a build step. Use Bun (not Node) if a runtime is ever needed.
- Use **relative paths** (`./...`) everywhere; the site may be served from a sub-path.
- Content lives in `tools.json`. UI changes go in `app.js` / `style.css` / `index.html`.
- Escape all data inserted into HTML (use the `esc()` helper in `app.js`).
- New icons: add the Lucide SVG inner markup to `ICONS` in `icons.js`; `iconType` in `tools.json` must match a key.
- Keep the keyboard UX working (`/`, arrows, Enter, Esc) and deep links (`#id`, `?category=`).
- `sw.js` only unregisters the legacy service worker; don't turn it into a caching worker without discussion.

## Files

`index.html`, `style.css`, `app.js`, `icons.js`, `tools.json`, `manifest.webmanifest`, `sw.js`, `assets/`, icons at root.

## Test

Serve with `bunx serve .` (or `python3 -m http.server`) and check the browser console for errors. No test suite or linter.

## Deploy

Push to `main`; `.github/workflows/deploy.yml` copies the files listed in its "Stage site files" step into `_site` and publishes. **Add any new top-level file to that `cp` list.** Keep actions on Node 24-ready versions.
