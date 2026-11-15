# HEMAJoensuu – website

Website of Joensuun historiallisen miekkailun seura ry. It is built with [Eleventy](https://www.11ty.dev/), edited with [Decap CMS](https://decapcms.org/) (`/admin/`) and published to GitHub Pages by GitHub Actions.

Club members' editing guide (in Finnish): [OHJEET.md](OHJEET.md).

## Structure

| Path | Contents |
|---|---|
| `src/sivut/*.md` | Pages: front page, Tietoa lajista, FAQ, contact, gallery, Ajankohtaista. File name = URL (`faq.md` → `/faq.html`). |
| `src/uutiset/*.md` | News articles → `/uutiset/<file-name>/`, listed newest first on `/needtoknow.html` |
| `src/_data/site.json` | Site name, social links, email, footer, custom domain |
| `src/_data/navigation.json` | Main menu |
| `src/404.njk` | Finnish "page not found" page (GitHub Pages serves `/404.html` automatically) |
| `src/omat-sivut/*.md` | Pages created in the CMS with the section builder → `/<file-name>/` (layout `custom-page.njk`) |
| `src/_data/redirects.json` | Old URLs that redirect to new ones (editable in CMS → Asetukset → Uudelleenohjaukset) |
| `src/_data/theme.json`, `themeVars.js` | Site colours (CMS → Asetukset → Värit). `themeVars.js` checks WCAG contrast and falls back to the default colour, printing a `[theme]` warning in the build log, if a colour would be unreadable. |
| `src/_includes/partials/sections/` | Section partials shared by the fixed pages and the section builder. Sections with images (`carousel`, `imageText`) are JS shortcodes in `eleventy.config.js`, because Nunjucks includes that use async shortcodes render nothing inside loops. |
| `src/uploads/` | Images (the CMS uploads here). Resized/converted to WebP automatically at build time. |
| `src/_includes/` | Layouts and partials (Nunjucks) |
| `src/css/style.css`, `src/js/main.js` | All styling and the small script for menu + gallery |
| `src/admin/config.yml` | CMS collections and fields |
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

Every push to `master` runs `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages. The workflow also runs **every hour** (`cron: "7 * * * *"`) so scheduled posts go live on time.

**Note:** GitHub pauses scheduled workflows in repos with no activity for 60 days. If scheduled posts stop appearing, re-enable the workflow under **Actions → Julkaise sivusto**.

One-time setup: **Repo → Settings → Pages → Build and deployment → Source: GitHub Actions.**

### Custom domain: hemajoensuu.fi

The domain is set in `src/_data/site.json` (`"domain"`). The build generates the `CNAME` file from it, and the sitemap, canonical links and `site_url` in `src/admin/config.yml` all use it.

DNS at the domain registrar ([GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)):

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `joensuuhms.github.io` |

Then, under **Repo → Settings → Pages**, enter `hemajoensuu.fi` as the custom domain and tick **Enforce HTTPS** once the certificate is issued. With an Actions deployment, the Settings field is what GitHub actually uses; the generated `CNAME` file only keeps the repo self-documenting.

## CMS login setup (one time)

GitHub Pages cannot do the OAuth handshake that the CMS needs, so a tiny free Cloudflare Worker does it.

1. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to Cloudflare Workers (free account; the README has a one-click deploy button). Note the worker URL, e.g. `https://sveltia-cms-auth.<you>.workers.dev`.
2. On GitHub, under **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - Homepage URL: the site URL
   - Authorization callback URL: `<worker URL>/callback`
3. In the Cloudflare worker settings, add these variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET` (as a secret)
   - `ALLOWED_DOMAINS` = `hemajoensuu.fi, www.hemajoensuu.fi`
4. Put the worker URL in `base_url` in `src/admin/config.yml` and push.

### Giving club members access

Each editor needs a free GitHub account. Invite them under **Repo → Settings → Collaborators** with the *Write* role.

`publish_mode: editorial_workflow` is on, so their edits are saved as drafts (pull requests). They appear live only when someone moves them to *Ready* and clicks *Publish* in the CMS *Workflow* view. Branch protection on `master` can enforce that drafts get reviewed.
