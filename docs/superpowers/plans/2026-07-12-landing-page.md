# REKT Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the approved landing page design from `rekt-landing-standalone.html` into clean static HTML/CSS in this repo, with all themable values in a design-token layer.

**Architecture:** The standalone file is a self-unpacking bundle: a `__bundler/manifest` script tag holds base64 assets (logo PNG, 6 woff2 fonts, 3 design-tool runtime JS files) and a `__bundler/template` script tag holds the full page HTML with inline styles. We extract the binary assets with a one-off Node script, hand-convert the template's inline styles into class-based CSS consuming tokens, and discard the runtime JS entirely (the page has no real behavior — the only animation is a CSS spinner).

**Tech Stack:** Plain HTML5 + CSS custom properties. No JS, no build step, no dependencies. Deploys as-is to Vercel/Netlify.

## Global Constraints

- Source bundle: `/Users/sammathew/Documents/Projects/REKT Web/rekt-landing-standalone.html` (do not modify it).
- Repo root: `/Users/sammathew/Documents/Projects/REKT Web/web-app`.
- `css/styles.css` must contain **no raw color hex values or font-family names** — every such value comes from a `var(--…)` token defined in `css/tokens.css`.
- Rendered output must be visually identical to the original standalone page at 1440px width before any content tweaks.
- No `js/` directory: the page has no behavioral JS. The form is static markup for now (no backend — spec out-of-scope).
- Commit after each task; push happens only in the final task.

---

### Task 1: Extract binary assets from the bundle

**Files:**
- Create: `assets/rekt-logo.png`
- Create: `assets/fonts/anton-latin.woff2`, `assets/fonts/anton-latin-ext.woff2`, `assets/fonts/anton-vietnamese.woff2`
- Create: `assets/fonts/archivo-latin.woff2`, `assets/fonts/archivo-latin-ext.woff2`, `assets/fonts/archivo-vietnamese.woff2`

**Interfaces:**
- Produces: asset paths above, referenced by Task 2 (`@font-face` in tokens layer is NOT used — fonts are declared in `css/styles.css`, Task 3) and by `index.html` (Task 3) as `assets/rekt-logo.png`.

- [ ] **Step 1: Write the extraction script** (in the session scratchpad, NOT in the repo)

Save as `<scratchpad>/extract-assets.mjs`:

```js
import fs from "node:fs";
import zlib from "node:zlib";

const SRC = "/Users/sammathew/Documents/Projects/REKT Web/rekt-landing-standalone.html";
const OUT = "/Users/sammathew/Documents/Projects/REKT Web/web-app/assets";

// UUID → output name, mapped from the @font-face unicode-range blocks in the
// bundle template. The 3 text/javascript entries are the design-tool runtime
// and are deliberately not extracted.
const names = {
  "450113a7-e164-422d-8d57-d62f0f746c17": "rekt-logo.png",
  "088a1901-b20c-496c-8d8f-ba8c07804d33": "fonts/anton-latin.woff2",
  "314ec458-afea-4d1c-8534-ff89bdcd3e5c": "fonts/anton-latin-ext.woff2",
  "6ddbfdef-de6c-42f9-acd2-6e71cbc4ae93": "fonts/anton-vietnamese.woff2",
  "a8363071-fafa-43eb-82e3-4e0a8364fd21": "fonts/archivo-latin.woff2",
  "360dec4b-8155-4562-b288-45250ee4b715": "fonts/archivo-latin-ext.woff2",
  "d9b1b2f0-973b-4748-9277-23c14608f08e": "fonts/archivo-vietnamese.woff2",
};

const html = fs.readFileSync(SRC, "utf8");
const manifest = JSON.parse(
  html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/)[1]
);
fs.mkdirSync(`${OUT}/fonts`, { recursive: true });
for (const [uuid, name] of Object.entries(names)) {
  let buf = Buffer.from(manifest[uuid].data, "base64");
  if (manifest[uuid].compressed) buf = zlib.gunzipSync(buf);
  fs.writeFileSync(`${OUT}/${name}`, buf);
  console.log(name, buf.length);
}
```

- [ ] **Step 2: Run it and verify byte sizes**

Run: `node <scratchpad>/extract-assets.mjs`
Expected output (exact sizes):

```
rekt-logo.png 215679
fonts/anton-latin.woff2 12004
fonts/anton-latin-ext.woff2 21296
fonts/anton-vietnamese.woff2 5188
fonts/archivo-latin.woff2 34940
fonts/archivo-latin-ext.woff2 32672
fonts/archivo-vietnamese.woff2 13216
```

Also verify the logo is a valid image: `file web-app/assets/rekt-logo.png` → `PNG image data`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/sammathew/Documents/Projects/REKT Web/web-app"
git add assets
git commit -m "feat: add logo and self-hosted font assets extracted from design bundle"
```

---

### Task 2: Design tokens

**Files:**
- Create: `css/tokens.css`

**Interfaces:**
- Produces: the CSS custom properties below, consumed by `css/styles.css` (Task 3). Names are final — Task 3 references them verbatim.

- [ ] **Step 1: Write `css/tokens.css`**

```css
/* REKT design tokens — the only place raw brand values may appear.
   Values sourced from the Rekt Design System. */
:root {
  /* color — neutrals */
  --color-bg: #0A0A0A;
  --color-black: #000000;
  --color-surface: #111111;
  --color-surface-raised: #1A1A1A;
  --color-border-subtle: #1E1E1E;
  --color-ring: #2A2A2A;
  --color-border: #2E2E2E;
  --color-homebar: #3A3A3A;
  --color-text: #FAFAF7;
  --color-text-muted: #9A9A9A;
  --color-text-faint: #6E6E6E;

  /* color — brand */
  --color-gold: #C9A24B;
  --color-gold-light: #E8C97A;
  --color-gold-dark: #8C6D2B;   /* design-system reserve; unused on this page */
  --color-coral: #D96A5B;       /* design-system reserve; unused on this page */
  --color-on-gold: #0A0A0A;
  --color-glow: #1C1710;        /* phone-screen radial gradient inner stop */

  /* typography */
  --font-display: 'Anton', sans-serif;
  --font-body: 'Archivo', sans-serif;
  --font-mono: ui-monospace, Menlo, monospace; /* design-system reserve */

  /* radius */
  --radius-chip: 10px;
  --radius-input: 12px;
  --radius-pill: 999px;

  /* layout */
  --container-max: 1120px;
  --container-pad: 80px;
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/sammathew/Documents/Projects/REKT Web/web-app"
git add css/tokens.css
git commit -m "feat: add design token layer"
```

---

### Task 3: Page markup and styles

**Files:**
- Create: `index.html`
- Create: `css/styles.css`

**Interfaces:**
- Consumes: every `var(--…)` from Task 2's `tokens.css`; asset paths from Task 1.
- Produces: the complete deployable site.

- [ ] **Step 1: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>REKT — Only the experiences you love</title>
  <meta name="description" content="We build SaaS for nightclubs. Join the REKT waiting list.">
  <link rel="icon" type="image/png" href="assets/rekt-logo.png">
  <link rel="stylesheet" href="css/tokens.css">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <header class="site-header">
    <img src="assets/rekt-logo.png" alt="REKT" class="site-logo">
  </header>

  <main>
    <section class="hero container">
      <div class="hero-copy">
        <h1>Only the experiences you&nbsp;love</h1>
        <p class="lede">We build SaaS for nightclubs.</p>
        <div class="hero-cta">
          <a href="#work-with-us" class="btn">Join waiting list</a>
        </div>
        <div class="store-chips">
          <div class="chip">
            <span class="chip-label">Coming soon</span>
            <span class="chip-value">App Store</span>
          </div>
          <div class="chip">
            <span class="chip-label">Coming soon</span>
            <span class="chip-value">Google Play</span>
          </div>
        </div>
      </div>
      <div class="hero-phone">
        <div class="phone">
          <div class="phone-screen">
            <div class="phone-notch"></div>
            <div class="spinner"></div>
            <img src="assets/rekt-logo.png" alt="REKT" class="phone-logo">
            <div class="phone-title">Building your night</div>
            <div class="phone-sub">Sit tight while we work our magic.</div>
            <div class="phone-homebar"></div>
          </div>
        </div>
      </div>
    </section>

    <section id="work-with-us" class="work-section">
      <div class="container work-grid">
        <div class="work-copy">
          <h2>Work with&nbsp;us</h2>
          <p>Ready to be the talk of the town? Fill out the form and let’s get this party started together.</p>
        </div>
        <form class="work-form">
          <input type="text" name="organizer" placeholder="Organizer name*" required>
          <input type="email" name="email" placeholder="Email address*" required>
          <input type="tel" name="phone" placeholder="Phone*" required>
          <input type="text" name="instagram" placeholder="Instagram handle">
          <textarea name="message" placeholder="Message" rows="4"></textarea>
          <button type="submit" class="btn">Submit</button>
        </form>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-row">
      <img src="assets/rekt-logo.png" alt="REKT" class="footer-logo">
      <span class="copyright">© 2026 Rekt. All rights reserved.</span>
    </div>
  </footer>
</body>
</html>
```

- [ ] **Step 2: Write `css/styles.css`**

Note: the `@font-face` blocks keep the original per-script subsets. Archivo is a
variable font — one file serves weights 400–700 (`font-weight: 400 700`), which is
why the bundle repeated the same three files for weights 400/500/600/700.

```css
/* Fonts — self-hosted subsets extracted from the design bundle */
@font-face {
  font-family: 'Anton';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/anton-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Anton';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/anton-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Anton';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('../assets/fonts/anton-vietnamese.woff2') format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 400 700;
  font-stretch: 100%;
  font-display: swap;
  src: url('../assets/fonts/archivo-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 400 700;
  font-stretch: 100%;
  font-display: swap;
  src: url('../assets/fonts/archivo-latin-ext.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Archivo';
  font-style: normal;
  font-weight: 400 700;
  font-stretch: 100%;
  font-display: swap;
  src: url('../assets/fonts/archivo-vietnamese.woff2') format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}

/* Base */
* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--color-bg);
  font-family: var(--font-body);
  color: var(--color-text);
}

a { color: var(--color-gold); text-decoration: none; }
a:hover { color: var(--color-gold-light); }

input::placeholder,
textarea::placeholder { color: var(--color-text-faint); opacity: 1; }

.container { max-width: var(--container-max); margin: 0 auto; }

/* Header */
.site-header { display: flex; justify-content: center; padding: 28px 0 8px; }
.site-logo { height: 44px; width: auto; }

/* Hero */
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: center;
  padding: 56px var(--container-pad) 88px;
}
.hero-copy { display: flex; flex-direction: column; gap: 26px; }

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 72px;
  line-height: 1.0;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-text);
}

.lede {
  margin: 0;
  font-size: 19px;
  line-height: 1.55;
  color: var(--color-text-muted);
  max-width: 420px;
}

.hero-cta { display: flex; align-items: center; gap: 16px; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 17px 34px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--color-gold);
  color: var(--color-on-gold);
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.btn:hover { background: var(--color-gold-light); color: var(--color-on-gold); }

.store-chips { display: flex; gap: 12px; margin-top: 4px; }
.chip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-chip);
}
.chip-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-faint);
}
.chip-value { font-size: 15px; font-weight: 600; color: var(--color-text); }

/* Phone mock (splash screen) */
.hero-phone { display: flex; justify-content: center; }
.phone {
  width: 300px;
  height: 620px;
  border-radius: 48px;
  background: var(--color-surface-raised);
  padding: 10px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--color-ring);
}
.phone-screen {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 38px;
  background: radial-gradient(120% 90% at 50% 0%, var(--color-glow) 0%, var(--color-bg) 60%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}
.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 96px;
  height: 26px;
  border-radius: 14px;
  background: var(--color-black);
}
.spinner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  border-top-color: var(--color-gold);
  animation: spin 1s linear infinite;
}
.phone-logo { width: 150px; height: auto; }
.phone-title {
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text);
  text-align: center;
  line-height: 1.3;
}
.phone-sub { font-size: 13px; color: var(--color-text-muted); margin-top: -18px; }
.phone-homebar {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-homebar);
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

/* Work with us */
.work-section { border-top: 1px solid var(--color-border-subtle); }
.work-grid {
  padding: 72px var(--container-pad);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: start;
}
.work-copy { display: flex; flex-direction: column; gap: 18px; }

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 44px;
  line-height: 1.05;
  text-transform: uppercase;
  color: var(--color-text);
}

.work-copy p {
  margin: 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-text-muted);
  max-width: 400px;
}

.work-form { display: flex; flex-direction: column; gap: 14px; }
.work-form input,
.work-form textarea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  padding: 15px 18px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--color-text);
  outline: none;
}
.work-form textarea { resize: none; }
.work-form input:focus,
.work-form textarea:focus { border-color: var(--color-gold); }
.work-form .btn { padding: 17px; }

/* Footer */
.site-footer { border-top: 1px solid var(--color-border-subtle); }
.footer-row {
  padding: 28px var(--container-pad);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-logo { height: 26px; width: auto; opacity: 0.9; }
.copyright { font-size: 13px; color: var(--color-text-faint); }
```

- [ ] **Step 3: Token-rule check**

Run: `grep -nE '#[0-9A-Fa-f]{3,8}|font-family:\s*['"'"'"]?(Anton|Archivo)' css/styles.css | grep -v '@font-face' | grep -v "font-family: '"`
Simpler equivalent: `grep -nE '#[0-9A-Fa-f]{3,8}' css/styles.css`
Expected: **no matches** (the `@font-face` `font-family` declarations are the one
allowed exception — they *define* the fonts the tokens point at; `rgba(0,0,0,…)`
shadow values are permitted since they are transparency, not brand color).

- [ ] **Step 4: Serve and smoke-test**

```bash
cd "/Users/sammathew/Documents/Projects/REKT Web/web-app"
python3 -m http.server 8321
```

Open `http://localhost:8321` in a browser. Expected: dark page, centered logo,
72px Anton hero headline, gold pill CTA, phone mockup with spinning gold arc,
form section, footer. Browser console: zero errors; Network tab: zero 404s
(9 requests: page, 2 css, logo ×1 cached ×3 uses, latin woff2 ×2 — the
-ext/vietnamese subsets load only if such glyphs render, which they don't).

- [ ] **Step 5: Commit**

```bash
cd "/Users/sammathew/Documents/Projects/REKT Web/web-app"
git add index.html css/styles.css
git commit -m "feat: add landing page markup and token-based styles"
```

---

### Task 4: Visual verification against the original, then push

**Files:**
- None created; verification + push only.

**Interfaces:**
- Consumes: the served site from Task 3; the original `rekt-landing-standalone.html`.

- [ ] **Step 1: Render both pages and capture screenshots**

With the Task 3 server still running, capture both at 1440px width — use the
available browser automation, or if none, open both side by side manually:

- `http://localhost:8321` (new build)
- `file:///Users/sammathew/Documents/Projects/REKT Web/rekt-landing-standalone.html`
  (wait for it to finish "Unpacking…")

- [ ] **Step 2: Compare**

Check section by section: header logo size, hero headline wrap ("you love" kept
together by `&nbsp;`), CTA pill, chips, phone mock (notch, spinner color/motion,
logo width, copy), form field styling and focus ring (gold border on focus),
footer. Expected: no visible differences. If any are found, fix `styles.css` /
`index.html`, re-check, and amend the Task 3 commit reasoning in a new commit.

- [ ] **Step 3: Push**

```bash
cd "/Users/sammathew/Documents/Projects/REKT Web/web-app"
git push -u origin main
```

Expected: branch `main` pushed to `github.com/rektbae/web-app`.

---

## Known follow-ups (out of scope, per spec)

- **Responsive layout:** the design is desktop-fixed (two-column grids, 72px h1).
  A mobile collapse is the natural first "tweak" after the faithful port lands.
- **Form backend:** the Work-with-us form is static markup; wiring it to a
  service (Formspree/Netlify Forms/own API) is a separate task.
- **Vercel/Netlify hookup:** connect the repo in the hosting dashboard; no config
  file is needed for a static root deploy.
