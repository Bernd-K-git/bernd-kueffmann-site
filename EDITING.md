# Editing the site — for Bernd

A short guide to changing anything on **transion.org** without writing code.

---

## Signing in

1. Open **<https://transion.org/admin/>**
2. Click **Login with GitHub**.
3. Authorize the app (one-time).

You'll see three sections in the left sidebar:

- **Site Settings** — your name, role, email, address, footer
- **Pages** — the text on each individual page
- **Engagements** — the chronological project list

---

## How the editor works

Every field has a clear label. You type, the form shows a live preview underneath, you click **Publish → Publish now**, the site rebuilds, your change is live in about a minute.

Behind the scenes, every save writes a small record to GitHub. If anything ever goes wrong, Paul can undo any change in a few seconds.

---

## Changing text on a page

**Example: changing the homepage headline.**

1. Sidebar → **Pages** → **Home page**.
2. Find **Hero (top of homepage)** → **Main headline**.
3. Edit the text. A blank line inside the field creates a line break on the page.
4. **Publish → Publish now**.
5. Wait 30–60 seconds, refresh the homepage.

Same idea for every other text field across the site.

---

## Adding a new project (engagement)

1. Sidebar → **Engagements** → **New Engagement** (top right).
2. Fill in the fields:
   - **Slug**: a short URL anchor like `acme-recovery` (lowercase, no spaces). This is what people link to.
   - **Order**: where it appears in the list. **1** is at the top (newest). If your latest project is becoming number 1, shift the old number 1 to 2, and so on. *(Paul can bulk-renumber if needed.)*
   - **Year, Industry, Location, Project title, Role, Client** — appear in the row.
   - **Show this as a featured card on the homepage?** — if **yes**, three more fields appear (card tag, card title, card description, card image). Only three engagements should be featured at a time. Untick an old one before featuring a new one.
3. **Publish → Publish now**.

That's it. The row appears on `/projects.html` automatically, sorted by Order.

### If you forget which order numbers are taken
Sidebar → **Engagements** shows all entries with their Order. Click any one to renumber it.

---

## Replacing a photo or logo

1. Wherever you see an **image field** (Portrait photo, Card image, Client logo image), click it.
2. **Upload new** → pick a file.
3. **Choose**.

Image guidance:
- **Portrait**: a real photo in a 4:5 portrait crop, calm background, around 1000 × 1250 px or larger.
- **Project card images**: simple, abstract, monochrome. The site comes with three SVGs already in `/assets/img/`: `pi-telco.svg`, `pi-engineering.svg`, `pi-automotive.svg`. You can also upload your own.
- **Client logos**: only with explicit client permission. PNG with transparent background, around 400 × 200 px.
- **Share image (Open Graph)**: 1200 × 630 px. Used when someone shares the site on LinkedIn, Twitter, etc.

---

## Changing your email / address / phone

Sidebar → **Site Settings** → **Identity & Contact**. Edit any field. The email, address, and phone appear automatically in:
- the footer of every page
- the contact page
- the imprint (`/imprint.html`)
- the privacy policy (`/privacy.html`)

You don't need to edit each one separately.

---

## Updating the navigation

Sidebar → **Site Settings** → **Navigation menu**.

To reorder: drag a row.
To rename: edit the **Label** field.
To add: click **Add menu items** at the bottom.
To remove: click the trash icon.

Don't add menu items that point to pages that don't exist — they'll 404.

---

## What you should NOT change here

The admin only shows you content (text, images, project entries). It does not show:

- Page layout / design (CSS)
- The chat-widget guardrails (Anthropic system prompt)
- The contact form backend (Formspree)
- The legal pages' wording (Imprint, Privacy, Cookies)

Those are Paul's territory. If you want any of them changed, tell him — it's a 2-minute change for him.

---

## If something looks broken after a save

Don't panic. Every save is a separate commit on GitHub. Paul can revert to the previous version in 30 seconds.

Common things and what to check:

- **A new project doesn't show up on `/projects.html`** → check the **Order** number. If it's the same as another project's Order, one of them hides the other.
- **The card on the homepage points to the wrong project** → check the **Slug** field. The homepage card URL uses the slug.
- **A photo looks stretched** → the upload was probably too small. Use at least 1000 px on the long edge.

---

## Style notes — keep it calm

When you write or edit copy:

- Short sentences. Three-line paragraphs maximum.
- No "passionate", "leveraging", "synergies", "ecosystem", "world-class". They flatten the message.
- Verbs over adjectives. "Delivered" beats "delivery-oriented".
- Don't say what you do — show what was done. The reader fills in the conclusion.
- Italian-elegant, not American-loud. Confident without raising the voice.

When in doubt, cut a sentence. The site is built on whitespace.
