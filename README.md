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
| `src/_data/redirects.json` | Old URLs that redirect to new ones (`page6.html`, `page7.html`) |
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

## Deployment

Every push to `master` runs `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages.

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
