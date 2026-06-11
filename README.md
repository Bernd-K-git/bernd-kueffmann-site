# Bernd Küffmann — transion.org

Personal site for Senior Project Manager Bernd Küffmann.
Apple-discipline aesthetic, Eleventy-rendered, Decap-editable, Vercel-hosted.

---

## Read first

- 🛠 **[SETUP.md](./SETUP.md)** — Paul: bringing this from git clone to a live `transion.org` with Bernd-editable admin (~30 min).
- ✍️ **[EDITING.md](./EDITING.md)** — Bernd: how to edit text, swap photos, add projects.

---

## Stack

- **[Eleventy 3](https://www.11ty.dev/)** — static site generator. Renders `src/` → `_site/`.
- **[Decap CMS](https://decapcms.org/)** — Git-based admin UI at `/admin/` for Bernd.
- **[Vercel](https://vercel.com/)** — host + two serverless functions:
  - `api/chat.js` — Claude chat widget (uses `ANTHROPIC_API_KEY`)
  - `api/oauth.js` — GitHub OAuth proxy for Decap (uses `GITHUB_OAUTH_CLIENT_ID`/`SECRET`)
- **[Inter](https://rsms.me/inter/)** — typography
- No frontend framework. Vanilla JS. Pure CSS.

---

## Run locally

```bash
npm install         # one-time
npm run dev         # http://localhost:8000
```

`npm run dev` runs two processes side-by-side:
- `eleventy --watch` rebuilds `_site/` on every change to `src/`
- `node dev.js` serves `_site/` + handles `/api/chat`

Hot-reload: save a `.yml` / `.njk` / `.md` / `.css`, refresh the browser.

> The chat widget needs `ANTHROPIC_API_KEY` set in `.env` to actually answer. Otherwise it shows "currently unavailable".

---

## Project layout

```
bernd-kueffmann-site/
├── _site/                  # Eleventy output (git-ignored)
├── .eleventy.js            # Eleventy config (YAML loader, collections, passthroughs)
├── package.json
├── vercel.json             # Build command + function timeouts
├── dev.js                  # Local dev server (static + /api/chat + /api/oauth)
├── .env / .env.example     # ANTHROPIC_API_KEY + GitHub OAuth creds
│
├── api/                    # Vercel Functions (deploy from project root)
│   ├── chat.js             # POST /api/chat → Claude
│   └── oauth.js            # GET  /api/oauth → GitHub OAuth proxy for Decap
│
└── src/                    # Eleventy input
    ├── _data/              # Content YAML (Bernd edits via Decap)
    │   ├── site.yml        #   Global: name, email, address, footer
    │   ├── nav.yml         #   Navigation
    │   ├── home.yml        #   Homepage content
    │   ├── profile.yml     #   Profile page content
    │   ├── projects.yml    #   Projects page hero only
    │   ├── training.yml    #   Training & Mentoring page
    │   └── contact.yml     #   Contact page
    │
    ├── _engagements/       # One markdown per project (15 entries today)
    │   ├── 01-telco-transition.md
    │   ├── 02-engineering-uae.md
    │   └── ...
    │
    ├── _includes/
    │   ├── layouts/base.njk          # Shared HTML shell
    │   └── partials/                  # head, nav, footer, chat-widget
    │
    ├── admin/              # Decap CMS UI
    │   ├── index.html      #   Loads Decap from CDN
    │   └── config.yml      #   Collections + fields
    │
    ├── assets/             # Images, OG image, project SVGs
    ├── css/                # Apple-discipline stylesheet
    ├── js/                 # Vanilla JS: nav, scroll-reveal, cookies, chat
    │
    ├── index.njk           # Homepage template
    ├── profile.njk
    ├── projects.njk
    ├── training.njk
    ├── contact.njk
    ├── imprint.njk
    ├── privacy.njk
    ├── cookies.njk
    ├── 404.njk
    ├── sitemap.xml.njk
    └── robots.txt
```

---

## Design discipline

The aesthetic is "Italian-elegant": calm, restrained, confident without raising its voice. When making changes, please honor the same principles.

- Display headlines use **negative letter-spacing** (`--tracking-tight`, -0.022em).
- Body text is **17 px** (`--t-body`). Resist shrinking.
- Sections are big (`var(--s-16)` vertical padding desktop). Don't crowd.
- Buttons are pill-shaped (`border-radius: 980px`) or square. Never rounded-md.
- Animations: 0.7 s fade-up on scroll, the homepage mesh-drift (24 s), the hero accent-rule (1.2 s in), the chat-button pulse. That's it.
- The two deliberate cinematic moments are the homepage hero (mesh + scroll cue) and the chat widget. Don't add a third.
- One H1 per page. Eyebrow → H1 → lede → CTA is the standard hero rhythm.
- Cards never have text-shadows or glassmorphism.

---

## What's NOT in the admin

Decap exposes content. It does NOT expose:
- CSS / layout / page templates
- The Claude system prompt (`api/chat.js`)
- The legal-page wording (Imprint / Privacy / Cookies)
- The Formspree backend

These remain code changes — Paul's territory. This is by design: Bernd should never accidentally break the layout while writing copy.

---

## Lighthouse targets

- Performance ≥ 95 (no framework, minimal CSS, lazy images)
- Accessibility ≥ 95 (skip link, semantic landmarks, `:focus-visible` outlines)
- Best Practices ≥ 95
- SEO ≥ 95 (canonical, OG, JSON-LD Person schema on profile)

If a score drops below 95 after a change, that change usually shouldn't merge.

---

## License

© Bernd Küffmann. All rights reserved.
Content (bio, project descriptions, photography) is not for redistribution.
