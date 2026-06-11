# Setup — for Paul

Walks through getting from a local checkout to a working `transion.org` with Bernd-editable admin. Plan ~30 minutes once you have a GitHub account.

---

## Overview

The site is built with:

- **Eleventy** (`@11ty/eleventy`) — static site generator. Content lives in `src/_data/*.yml` and `src/_engagements/*.md`. Run `npm run build` to render `_site/`.
- **Decap CMS** — admin UI at `/admin/`. Bernd signs in with GitHub, edits in a form UI, saves a commit, Vercel auto-redeploys.
- **Vercel** — host. Two serverless functions in `api/`:
  - `api/chat.js` → Claude chat widget (uses `ANTHROPIC_API_KEY`)
  - `api/oauth.js` → GitHub OAuth proxy for Decap (uses `GITHUB_OAUTH_CLIENT_ID` + `_SECRET`)
- **IONOS** — domain registrar. DNS points `transion.org` at Vercel.

---

## 1. Push to GitHub

Create a new GitHub repo (private is fine — Decap can read private repos as long as the editor has access).

```bash
cd /Users/Paul/bernd-kueffmann-site
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> The `.gitignore` already excludes `.env`, `node_modules/`, `_site/`, and `.vercel`.

### Open `src/admin/config.yml` and set your repo

Around line 9:

```yaml
backend:
  name: github
  repo: <your-username>/<your-repo>    # change this
```

Commit that change.

---

## 2. Create a GitHub OAuth App

1. Go to <https://github.com/settings/developers> → **New OAuth App**.
2. Fill in:
   - **Application name**: `Bernd Küffmann CMS`
   - **Homepage URL**: `https://transion.org`
   - **Authorization callback URL**: `https://transion.org/api/oauth?action=callback`
3. Click **Register application**.
4. On the next page, copy:
   - **Client ID** → save as `GITHUB_OAUTH_CLIENT_ID`
   - Click **Generate a new client secret**, copy → save as `GITHUB_OAUTH_CLIENT_SECRET`

You'll paste these into Vercel in step 4.

---

## 3. Connect Vercel to the repo

```bash
npm i -g vercel        # if not already
vercel link            # follow prompts; create new project
```

This adds a `.vercel/` folder (git-ignored). The first push to `main` will now trigger a build.

---

## 4. Set environment variables on Vercel

In Vercel → Project → **Settings → Environment Variables**, add three:

| Name | Value | Environments |
|------|-------|--------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (same one in your local `.env`) | Production, Preview |
| `GITHUB_OAUTH_CLIENT_ID` | from step 2 | Production |
| `GITHUB_OAUTH_CLIENT_SECRET` | from step 2 | Production |

You can also use the CLI:

```bash
vercel env add ANTHROPIC_API_KEY production
vercel env add GITHUB_OAUTH_CLIENT_ID production
vercel env add GITHUB_OAUTH_CLIENT_SECRET production
```

---

## 5. Deploy

```bash
vercel --prod
```

Vercel will:
1. Run `npm install`
2. Run `npm run build` (= `npx @11ty/eleventy`) → renders `_site/`
3. Serve `_site/` as the static site
4. Deploy `api/chat.js` + `api/oauth.js` as functions

First deploy gives you a `*.vercel.app` URL. Open it. Everything should look like `http://localhost:8000` does locally.

---

## 6. Connect IONOS DNS to Vercel

In Vercel → Project → **Settings → Domains**, click **Add** → enter `transion.org`. Vercel will show you two records.

In IONOS → Domains → `transion.org` → **DNS**:

- **A record**: `@` → `76.76.21.21` (Vercel)
- **CNAME**: `www` → `cname.vercel-dns.com`

Save. DNS propagation usually 5–60 minutes.

Once Vercel detects the records, it issues a Let's Encrypt cert automatically. `https://transion.org` works.

---

## 7. Test the admin

1. Open `https://transion.org/admin/`.
2. Click **Login with GitHub**.
3. A popup → authorize the OAuth app.
4. You land in the Decap editor with three sections: **Site Settings**, **Pages**, **Engagements**.

If login fails:
- Check the OAuth App callback URL is exactly `https://transion.org/api/oauth?action=callback`.
- Check Vercel env vars are set (and you redeployed after adding them — Vercel does **not** auto-redeploy on env-var change; trigger a redeploy via the dashboard or `vercel --prod --force`).

---

## 8. Give Bernd access

Two options:

**Option A — Add Bernd as a collaborator on the GitHub repo.**
This gives him push access and lets Decap commit on his behalf.

**Option B — Create a "Bernd" GitHub account** (if he doesn't have one), and add it as a collaborator. Simpler for him long-term.

Then send him `EDITING.md`.

---

## Common changes

- **Edit text yourself**: change the `.yml` / `.md` file, commit, push, Vercel auto-deploys.
- **Add a new engagement**: drop a new `.md` file into `src/_engagements/` (any name), set frontmatter fields. Eleventy picks it up on next build.
- **Restart the local dev server**: `Ctrl-C`, then `npm run dev`.
- **Update the chat system prompt**: `api/chat.js` (top of the file).
- **Tweak the design**: `src/css/*.css`. Bernd does NOT see CSS in the admin — design changes are yours alone.

---

## Local development

```bash
npm install         # one-time
npm run dev         # → http://localhost:8000
```

`npm run dev` runs two things concurrently:
1. `eleventy --watch` — rebuilds `_site/` on every source change
2. `node dev.js` — serves `_site/` + `/api/chat` + `/api/oauth`

Hot reload: edit a `.yml` / `.njk` / `.md` → save → refresh browser.

> Note: the admin UI works at `localhost:8000/admin/`, but GitHub OAuth requires a real domain. Use the admin against the deployed site.
