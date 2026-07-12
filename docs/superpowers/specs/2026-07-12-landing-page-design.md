# REKT Landing Page — Design Spec

**Date:** 2026-07-12
**Repo:** rektbae/web-app (empty; this is the first feature)
**Status:** Draft for review

## Goal

Turn the approved landing page design (`rekt-landing-standalone.html`, a self-unpacking
bundled export living in `/Users/sammathew/Documents/Projects/REKT Web/`) into clean,
maintainable static code in this repo, restructured around a design-token layer so
future tweaks are single-line edits.

## Constraints & Decisions

- **Stack:** Plain HTML/CSS/JS. No framework, no build step. What's in the repo is what deploys.
- **Hosting:** Vercel or Netlify (static). Zero config needed beyond the file layout.
- **Fidelity:** The unpacked page must render visually identical to the standalone
  original before any tweaks begin.
- **Design tokens:** All themable values (color, typography, spacing, radius, shadows)
  live as CSS custom properties in one file; component styles reference tokens only.

## Repo Structure

```
web-app/
├── index.html          # full page markup, semantic, real <title> + meta tags
├── css/
│   ├── tokens.css      # design tokens only (:root custom properties)
│   └── styles.css      # all component/layout styles, consuming tokens
├── js/
│   └── main.js         # only if the page has real behavior (menus, scroll effects)
├── assets/             # logo, images extracted from the bundle
└── docs/superpowers/specs/  # this spec
```

## Design Tokens (`css/tokens.css`)

Token values are extracted from the Rekt Design System palette:

- **Color — neutrals:** `--color-bg` (#0A0A0A family), surface steps (#111111, #161616,
  #1C1C1C, #1E1E1E, #242424, #2E2E2E), `--color-text` (#FAFAF7), muted text
  (#9A9A9A, #6E6E6E).
- **Color — brand:** gold scale `--color-gold` (#C9A24B), `--color-gold-light` (#E8C97A),
  `--color-gold-dark` (#8C6D2B); accent `--color-coral` (#D96A5B).
- **Typography:** `--font-display` (Anton), `--font-body` (Archivo), `--font-mono`
  (ui-monospace stack); a type-size scale derived from the actual sizes used in the page.
- **Spacing / radius / shadow:** scales derived from values found in the unpacked CSS.

Exact token names and the full scale are finalized during extraction, when we can see
every value the page actually uses. Rule: any hex color, font-family, or repeated
size in `styles.css` must be replaced by a `var(--…)` reference — `styles.css`
contains no raw brand values.

## Extraction Process (one-off, not committed)

1. Node script (in the session scratchpad) parses the bundle's
   `script[type="__bundler/manifest"]` and `script[type="__bundler/template"]` tags,
   base64-decodes (and gunzips where flagged) every asset, and writes files out.
2. De-inline styles and scripts into `css/` and `js/`; rewrite asset references to
   `assets/…` paths.
3. Tokenize: sweep the extracted CSS for colors/fonts/repeated values, define tokens,
   replace literals with `var()` references.
4. Replace bundler artifacts: real `<title>`, description meta, favicon from the Rekt
   logo; delete the loader/unpacker scaffolding.

## Verification

- Serve locally (`python3 -m http.server`) and visually compare against the standalone
  original side by side (screenshots at desktop and mobile widths).
- Check the browser console for 404s or JS errors.

## Out of Scope

- Content or visual changes ("tweaks" come after the faithful port lands).
- Analytics, forms/backend, CI, custom domain setup.
