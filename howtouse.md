# HEMAJoensuu – how to use and maintain the site

Website of Joensuun historiallisen miekkailun seura ry. It is built with [Eleventy](https://www.11ty.dev/), edited with [Decap CMS](https://decapcms.org/) (`/admin/`) and published to GitHub Pages by GitHub Actions.

Club members' editing guide (in Finnish): [OHJEET.md](OHJEET.md).

## Structure

| Path | Contents |
|---|---|
| `src/sivut/*.md` | Pages: front page, Tietoa lajista, FAQ, contact, gallery, Ajankohtaista. File name = URL (`faq.md` → `/faq.html`). |
| `src/uutiset/*.md` | News articles → `/uutiset/<file-name>/`, listed newest first on `/needtoknow.html` |
| `src/_data/site.json` | Site name, social links, email, footer |
| `src/_data/yllapito.json` | Custom domain (CMS → Ylläpito → Verkkotunnus); used for `CNAME`, sitemap and canonical URLs |
| `src/_data/navigation.json` | Main menu |
| `src/404.njk` | Finnish "page not found" page (GitHub Pages serves `/404.html` automatically) |
| `src/omat-sivut/*.md` | Pages created in the CMS with the section builder → `/<file-name>/` (layout `custom-page.njk`) |
| `src/_data/redirects.json` | Old URLs that redirect to new ones (editable in CMS → Ylläpito → Uudelleenohjaukset) |
| `src/_data/theme.json`, `themeVars.js` | Site colours (CMS → Ylläpito → Värit). `themeVars.js` checks WCAG contrast and falls back to the default colour, printing a `[theme]` warning in the build log, if a colour would be unreadable. |
| `src/_includes/partials/sections/` | Section partials shared by the fixed pages and the section builder. Sections with images (`carousel`, `imageText`) are JS shortcodes in `eleventy.config.js`, because Nunjucks includes that use async shortcodes render nothing inside loops. |
| `src/uploads/` | Images (the CMS uploads here). Resized/converted to WebP automatically at build time. |
| `src/_includes/` | Layouts and partials (Nunjucks) |
| `src/css/style.css`, `src/js/main.js` | All styling and the small script for menu + gallery |
| `src/admin/config.yml` | CMS collections and fields (`locale: fi`) |
| `src/admin/locale-fi.js` | Finnish translation of Decap's interface (same keys as `decap-cms-locales` `en`; missing keys fall back to English). Check for new keys when upgrading Decap. |
| `src/admin/cms.js`, `preview.css` | Registers the locale and preview templates (news, hero pages, gallery, section builder) using the site's own `style.css`, then calls `CMS.init()` (`CMS_MANUAL_INIT` is set in `index.html`). |
| `src/admin-ohje.njk` | `/admin/ohje/`: the editor guide rendered from `OHJEET.md`, opened by the "?" button in the CMS |
| `legacy/` | The old Mobirise export, kept until cutover; not published |

## Local development

```sh
npm install
npm start          # http://localhost:8080
```

To try the CMS locally without GitHub login, run `npm run cms` in a second terminal and open http://localhost:8080/admin/. Changes are written straight to your local files.

### Drafts and scheduled posts

News posts and section-builder pages have two extra front-matter fields:

- `draft: true`: the page is left out of the published build entirely (no page, not in the news list or sitemap).
- `publishAt: 2027-03-01T18:00:00+02:00`: the page is left out until that time.

This is the `unpublished` preprocessor in `eleventy.config.js`. In local preview (`npm start`) both are still shown, with a yellow "LUONNOS" / "AJASTETTU" banner.

## Security measures

**Content from the CMS is treated as untrusted:**
- **Links** in buttons, the menu and social links pass through `safeUrl` (in `eleventy.config.js`), which allows only `/…`, `#…`, `http(s)://`, `mailto:` and `tel:`. Anything else becomes `#`, with a `[security]` warning in the build log. The CMS forms check the same rule.
- **Markdown** is rendered with `html: false`: raw HTML such as `<script>` is shown as text, not executed. markdown-it also refuses `javascript:` and `data:` links.
- **Images** must be in `/uploads/` or be an `https://` address. Any other path is ignored, with a warning.
- **Redirects** are checked in `src/_data/redirectsValid.js`. An invalid, duplicate or clashing entry is skipped with a `[redirects]` warning, so it can never break the build.
- **Site colours** are checked for contrast in `themeVars.js` and only accepted as `#rrggbb`.

**The browser side:**
- Every page has a **Content-Security-Policy** `<meta>` tag allowing only same-origin scripts, styles and fonts. GitHub Pages can't send security headers.
  - Inline styles are allowed because the background images and theme colours use them.
  - The CMS page (`/admin/`) has no CSP. It loads Decap from unpkg with a Subresource Integrity hash, so a changed file is refused.
- The **Jost font is hosted on the site** (`src/fonts/`, SIL OFL 1.1), so visitor IP addresses aren't sent to Google Fonts (GDPR).

**Dependencies:**
- `npm audit` still lists issues in `decap-server`'s sub-dependencies. It's only the local CMS test server: it listens on localhost and is never deployed.
- When upgrading Decap, recompute the integrity hash in `src/admin/index.html`.

## Backup and restore

`scripts/backup.mjs` makes and restores `.zip` backups. Each archive has a `manifest.json` recording the type, date, source commit and a SHA-256 for every file.

| Type | Contains |
|---|---|
| content (`sisalto`) | `src/sivut`, `src/uutiset`, `src/omat-sivut` (`*.md`), `src/_data/{site,navigation,theme,redirects}.json`, `src/uploads/**` |
| full (`koko`) | every git-tracked file (except `backups/`, `palautus/`) |

```sh
npm run backup                         # content backup -> backups/
npm run backup -- --full               # full backup
npm run restore -- file.zip --dry-run  # show what would change
npm run restore -- file.zip            # restore (then review with git diff and commit)
```

**How a restore behaves:**
- It makes the content (or, for a full backup, the whole tracked tree) match the backup exactly. Files missing from the backup are deleted.
- Before writing anything, it checks the manifest, every checksum and the archive size limits. It also rejects paths with `..` or absolute paths, `.git/` paths, and code files inside a content backup.

**GitHub workflows:**
- **`backup.yml` ("Varmuuskopio"):** manual (*Run workflow*, choose `sisalto` or `koko`), plus a content backup every Sunday at 01:23 UTC. The zip is stored as an artifact for 90 days.
- **`restore.yml` ("Palautus"):** starts when a zip is uploaded to `palautus/`, or manually with the run ID of a backup run. It restores on a new branch, deletes the uploaded zip, and opens a **pull request** with a change summary. The live site changes only when the PR is merged.
- Restores in CI use `--keep-workflows`, because the built-in `GITHUB_TOKEN` cannot push changes to `.github/workflows/`.
- **One-time setting:** turn on **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**. Without it, the restore workflow can't open its pull request.

## Deployment

The site lives in the GitHub repo **`joensuuhms/hemajoensuu`** (default branch `main`). Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages. The workflow also runs **every hour** (`cron: "7 * * * *"`) so scheduled posts go live on time.

**Note:** GitHub pauses scheduled workflows in repos with no activity for 60 days. If scheduled posts stop appearing, re-enable the workflow under **Actions → Julkaise sivusto**.

### Launch: replacing the old Mobirise site (one time)

Until launch, hemajoensuu.fi is served by the old Mobirise export on the `gh-pages` branch of `joensuuhms/hemajoensuu`, and the new code lives on the `dev` branch of the same repo. Pushing `dev` does not affect the live site.

1. Put the new code on `main` without deleting the old history:
   - In **Branches**, rename the old `main` to e.g. `vanha-main` (`gh-pages` also keeps the old Mobirise export).
   - Push the new code: `git push origin dev:main`. The deploy run this starts may fail because Pages still uses `gh-pages`; that's expected, and the old site keeps working.
2. In **Settings → Pages**, switch **Source** from "Deploy from a branch (gh-pages)" to **GitHub Actions**. The custom domain `hemajoensuu.fi` stays set; with Actions, GitHub uses this field (not a `CNAME` file).
3. Run **Actions → Julkaise sivusto → Run workflow** (branch `main`). When it is green, check https://hemajoensuu.fi.
4. Tick **Enforce HTTPS** in **Settings → Pages** if it isn't already.
5. **Settings → Actions → General → Workflow permissions:** tick "Allow GitHub Actions to create and approve pull requests" (needed by the Palautus workflow).

The old repo `joensuuhms/web` (an older copy of the Mobirise site at joensuuhms.github.io/web) is no longer needed; archive it under **Settings → Archive this repository**.

### Custom domain: hemajoensuu.fi

The domain is set in `src/_data/yllapito.json` (CMS → Ylläpito → Verkkotunnus). The build generates the `CNAME` file from it, and the sitemap and canonical links use it. The DNS records already point to GitHub Pages:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| CNAME | `www` | `joensuuhms.github.io` |

A domain can be attached to only one GitHub Pages site at a time; it is currently attached to `joensuuhms/hemajoensuu`, which is where this code is deployed.

## CMS login setup (one time)

GitHub Pages cannot do the login handshake that the CMS needs, so a tiny free Cloudflare Worker does it ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)).

1. **Cloudflare:** deploy the worker with the one-click link https://deploy.workers.cloudflare.com/?url=https://github.com/sveltia/sveltia-cms-auth and note its URL, e.g. `https://sveltia-cms-auth.<you>.workers.dev`.
2. **GitHub App** (logged in as `joensuuhms`): https://github.com/settings/apps/new
   - Homepage URL: `https://hemajoensuu.fi`; Callback URL: `<worker URL>/callback`
   - ✅ Expire user authorization tokens; ☐ Request user authorization during installation; ☐ Device Flow; ☐ Webhook active
   - Repository permissions: **Contents** read & write, **Pull requests** read & write (Metadata read-only is automatic)
   - Create the app, copy the **Client ID**, generate a **client secret**, then **Install App** on the `joensuuhms/hemajoensuu` repository only.
3. **Cloudflare worker → Settings → Variables and Secrets:**
   - `GITHUB_CLIENT_ID` (text)
   - `GITHUB_CLIENT_SECRET` (**secret**)
   - `ALLOWED_DOMAINS` = `hemajoensuu.fi, www.hemajoensuu.fi, localhost`
4. Put the worker URL in `base_url` in `src/admin/config.yml` and push.

The worker is built for Sveltia CMS and uses the same login protocol as Decap; test the login once after setup. GitHub App logins expire after about 8 hours, after which editors log in again.

### Giving club members access

Each editor needs a free GitHub account. Invite them under **Repo → Settings → Collaborators → Add people**. The repo is owned by a personal account (`joensuuhms`), so collaborators always get write access: there are no roles to pick. Step-by-step instructions in Finnish are in `OHJEET.md` ("Ylläpitäjälle").

`publish_mode: editorial_workflow` is on, so their edits are saved as drafts (pull requests). They appear live only when someone moves them to *Ready* and clicks *Publish* in the CMS *Workflow* view. Branch protection on `main` can enforce that drafts get reviewed.
