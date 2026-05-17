# ZAIan Studio — Desktop

Electron 31 wrapper that ships **ZAIan Studio** as a native macOS / Windows
/ Linux app. The renderer loads the deployed Prompt Orchestrator URL
(or `NEXT_PUBLIC_APP_URL` for local development); this directory only
contains the native shell.

## Files

| File | Purpose |
|------|---------|
| `main.js` | Electron main-process entry point |
| `preload.js` | Renderer preload bridge |
| `package.json` | Electron + electron-builder config |

## Local development

```bash
cd zaian-studio-desktop
npm install
npm start        # launches the Electron window against the live app
```

## Producing release builds

```bash
npm run build         # all platforms (uses electron-builder)
npm run build:mac     # .dmg
npm run build:win     # NSIS installer
npm run build:linux   # AppImage + .deb
```

Artifacts are written to `dist/` (gitignored). This project does **not**
deploy to Vercel — release artifacts are uploaded to GitHub Releases or
distributed directly.
