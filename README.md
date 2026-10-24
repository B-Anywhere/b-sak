# 🧰 B-Anywhere SAK

Swiss Army Knifes for the B-Anywhere ecosystem — a tiny, **no-build** static page that lists our tools. ✨

🌐 Live: https://apps.b-anywhere.com/

## 🚀 Features

- 🔎 Instant search (`/` or `Ctrl/⌘+K`) and category filters
- 🖼️ Desktop 16:9 / Mobile 9:16 preview toggle
- ⚡ Quick View dialog with deep links (`#tool-id`, `?category=...`)
- ⌨️ Full keyboard navigation (arrows, Enter, Esc)

## 🗂️ Structure

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `style.css` | Styles (plain CSS) |
| `app.js` | Fetches `tools.json` and renders the UI (vanilla JS) |
| `icons.js` | Inline SVG icons (Lucide) |
| `tools.json` | 📦 The tool catalog — edit this to add/change tools |
| `assets/` | Screenshots, images, fonts |

## ➕ Add a tool

Append an entry to `tools.json` and drop screenshots in `assets/screenshots/`:

```json
{
  "id": "my-tool",
  "title": "My Tool",
  "category": "Creative Tools",
  "description": "Short pitch.",
  "detailedDescription": "Optional longer text.",
  "url": "https://example.com/",
  "desktopImg": "./assets/screenshots/my-tool-h.png",
  "mobileImg": "./assets/screenshots/my-tool-v.png",
  "color": "#6366F1",
  "iconType": "Video"
}
```

`iconType` must be a key exported in `icons.js`.

## 🛠️ Run locally

No install, no build:

```sh
bunx serve .
```

## 📤 Deploy

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) publishes the static files to GitHub Pages. 🎉
