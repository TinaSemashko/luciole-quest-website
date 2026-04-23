# Luciole Quest — Website

Static site hosted on GitHub Pages, served at `https://luciole.akateria.fr/`.

## Purpose

- **Universal Links / Android App Links**: `/.well-known/assetlinks.json` lets Android route `https://luciole.akateria.fr/*` links directly into the installed app (bypassing the browser). The `apple-app-site-association` file will be added in Stage 5 when the iOS build is ready.
- **Password reset fallback** (`/reset-password`): if the user clicks the email reset link on a device without the app installed, this page handles the flow in-browser via the Supabase JS SDK.
- **Placeholder landing** (`/`): "coming soon" stub until the Stage 4 marketing landing is built.

## Deploy

Push to `main` → GitHub Pages auto-deploys in ~30s.

## Important files

- `CNAME` — binds the site to `luciole.akateria.fr`
- `.nojekyll` — tells GitHub Pages not to run Jekyll (which hides `.well-known/` by default)
- `.well-known/assetlinks.json` — Android App Links; the SHA256 fingerprint is a **placeholder** and must be replaced with the real one after the first EAS development build
