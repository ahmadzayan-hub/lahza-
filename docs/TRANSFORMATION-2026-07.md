# Workspace transformation — July 2026

Full-repo audit and fix pass across all four product lines, run under the
Agentic OS (tasks TASK-20260719-001..003). Every finding below carries
file-level evidence from the audit; every fix listed was applied and
validated as described in "Validation".

## Executive summary

The workspace's biggest risks were **honesty and conversion defects**, not
styling: Lahza's checkout showed success without ever transmitting an order,
marketing surfaces carried fabricated stats/reviews and payment methods that
don't exist, the Telegram bot accepted commands from any stranger until
configured, and both the bot and the desktop app could silently destroy the
user's learned data on a corrupt file. All of these are fixed. Visual design
across the products was already intentional and consistent; it was largely
preserved.

## Fixed — by product

### Lahza (root Vite/React app) — bcgt
- **P0** Checkout no-op → `pay()` now builds a real order summary
  (`LAHZA-YYYY-NNNN` ref, package, message, delivery, VAT-inclusive total)
  and opens WhatsApp with it; the success screen honestly says "finish
  sending in WhatsApp" (`Customize.tsx`, `steps.tsx`, i18n en/ar).
- **P1** Fabricated content removed: "12,000+ cups / 340+ events / 4.9★"
  stats, three invented reviews (component archived to
  `agentic-os/_archive/lahza-Reviews.tsx.txt`), "4.9/5" trust chip → factual
  value props (live preview, VAT-transparent pricing).
- **P1** False payment claims removed everywhere: "secure checkout · 3-D
  Secure", card/Tabby/Tamara/Apple Pay lists in the pay step, FAQ, legal
  page, and `public/llms.txt` → honest "arranged via WhatsApp" wording, plus
  the unverified same-day-delivery claim in llms.txt.
- **P2** `/console` (ops dashboard) now only mounts when
  `VITE_ENABLE_CONSOLE=true`; footer link and PWA shortcut removed.
- **P2** Contact form now opens WhatsApp with the composed message instead
  of silently discarding submissions; success copy updated.
- **P3** `BCM-` order refs → `LAHZA-`; localStorage key migrated
  (`lahza.lang` with legacy fallback); SW cache version bumped; 404 page
  translated; duplicate SVG ids fixed with `useId()`; broken `npm run lint`
  script removed (no eslint config/dep existed).

### Beyond Style UAE (landing/) — brand
- Absolute `og:url`/`og:image` (+dimensions) and `rel=canonical` for the
  GitHub Pages URL; `robots.txt` + `sitemap.xml` added inside `landing/` so
  they actually deploy.
- WhatsApp CTAs now carry a baked-in Arabic prefill (JS swaps per language) —
  the prefilled intent survives JS/config failure.
- Language toggle also updates meta description/og:locale and exposes
  `aria-pressed`; `--muted` darkened to meet WCAG AA; Google Fonts made
  non-render-blocking; JSON-LD enriched (url/image); config divergence fixed
  and live-vs-editorial keys documented in `site.config.json`.

### Wisal (personal)
- **Telegram bot**: owner guard now closed-by-default (unset `chatId` denies
  everything except `/start`, which prints the id); per-chat rate limiting
  (`config.rateLimitMs`); atomic store writes + corrupt-file quarantine
  (no more silent learning wipe); message bodies no longer written to PM2
  logs unless `DEBUG=1`; Markdown parse-mode dropped on reports (labels with
  `_*[` used to 400) with `.catch` added; weekly review now records
  `markWeeklyReviewSent`; parser no longer promotes preamble text to a
  suggestion. Tests: 29 → **32**, all passing (new: closed-guard, rate
  limit, single-numbered-line parse).
- **Desktop (Electron)**: Groq key now encrypted at rest via
  `safeStorage` when the OS keychain is available (plaintext no longer
  written; legacy value still readable); atomic JSON writes that **throw**
  so the UI stops showing false "saved ✅"; corrupt store quarantined instead
  of silently reset; `openExternal` restricted to https URLs;
  `setWindowOpenHandler` deny + `will-navigate` guard; 20 s Groq timeout;
  401/429 now show distinct messages instead of "no internet"; feedback
  history capped at 500; duplicate suggestion card dropped; clipboard copy
  awaited with error toast. Core verified by direct Node execution
  (roundtrip, corrupt-quarantine).
- **wisal-web**: real PNG social image (`assets/og-image.png`) replacing the
  SVG no scraper renders (+ card type corrected), `ar_AR`→`ar_EG`, PNG
  apple-touch/manifest icons, decorative emoji `aria-hidden`,
  `Wisal-Portable.exe` download surfaced, calendar feature labelled
  Android-only, `llms.txt` stack claims corrected (Electron desktop; bot is
  in-repo, not a distributed service), privacy policy now covers the
  Windows build's key storage.
- **Android** (CI-verified on push, no local Gradle): `SecureStore` no
  longer silently persists the key in plaintext when Keystore fails (save
  surfaces an error toast instead); `Store` writes atomically and
  quarantines corrupt files instead of wiping learning.

## Assumption register

| Assumption | Evidence | Confidence | Impact if wrong | Decision |
| --- | --- | --- | --- | --- |
| Landing deploys at `ahmadzayan-hub.github.io/desktop-tutorial/` | deploy-landing.yml artifact root; no CNAME | high | canonical/sitemap URLs wrong | proceeded; single constant to change |
| `wisal-app.vercel.app` is the intended wisal-web domain | hardcoded in canonical/sitemap/robots; README says confirm | medium | SEO signals split | kept as-is; flagged for owner |
| Lahza is pre-launch (no live customers) | TODO licence/TRN, placeholder phone | high | success-copy tone | proceeded |
| WhatsApp is Lahza's real ordering channel | brand config, FAB, copy throughout | high | order flow misdirected | proceeded |
| Wisal desktop uses Electron ≥ safeStorage support | package.json electron ^31 | high | encryption call fails | proceeded (guarded) |

## Launch blockers still requiring the owner (not fixable from the repo)

1. ~~Lahza WhatsApp/phone number~~ — RESOLVED 2026-07-24: owner supplied
   `wa.me/971555615509`; `src/lib/brand.ts` updated (phone + whatsapp).
   Remaining from this item: licence no. + TRN TODOs in `brand.ts`.
2. **wisal-web domain** — confirm `wisal-app.vercel.app` or replace in
   `index.html`, `sitemap.xml`, `robots.txt`.
3. Real payment rails for Lahza (Telr/PayTabs etc.) if/when in-app payment
   is wanted; the WhatsApp handoff is the honest interim.
4. A designed 1200×630 og-image for wisal-web (current PNG is the 512² app
   icon — functional, not designed).

## Known limitations

- Android changes compile in CI (`android.yml`), not locally — watch the
  next Actions run.
- Electron app not launched here (no display); main-process code paths were
  exercised in plain Node, renderer changes are syntax-checked only.
- Image moderation in Lahza still fails open when `VITE_AI_ENDPOINT` is
  unset — acceptable now because a human sees every order in WhatsApp
  before printing; make it fail-closed before any automated fulfilment.
- hreflang: both Lahza and the landing use client-side language toggles on
  single URLs, so per-language hreflang was deliberately NOT added (no
  distinct URLs to point at). Adding `/ar` routes is the future fix.

## Validation

- Lahza: `tsc --noEmit` clean; `vite build` succeeds.
- Bot: 32/32 tests pass (`node --test`).
- Desktop: `node --check` on all three files; `core.js` behaviors
  (settings roundtrip, corrupt quarantine, atomic write) exercised in Node.
- Landing/wisal-web: JS syntax-checked, all JSON valid.
- Agentic OS suite unaffected: 108 tests, `doctor` clean.
