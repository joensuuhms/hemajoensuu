import fs from "node:fs";
import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

// GitHub Actions sets PATH_PREFIX ("/web/" on github.io, "/" with a custom domain).
const pathPrefix = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");

// One Markdown renderer for everything (page bodies and CMS text fields).
// html: false – raw HTML typed into the CMS (e.g. <script>) is shown as text, not executed.
// markdown-it also refuses javascript:/vbscript:/data: links on its own.
const md = markdownIt({ html: false, linkify: true, breaks: true });

// `npm start` (serve/watch) is a local preview: drafts and scheduled posts are shown there.
const isPreview = ["serve", "watch"].includes(process.env.ELEVENTY_RUN_MODE);
const isFuture = (date) => Boolean(date) && new Date(date) > new Date();

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Links entered in the CMS (buttons, menu, social links) may only point to a page on this
// site ("/…" or "#…") or to https/http, mailto: and tel: addresses. Anything else – such as
// javascript: – is replaced with "#" and reported in the build log.
const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
function safeUrl(url) {
  if (url === undefined || url === null || url === "") return "";
  const value = String(url).trim();
  if (SAFE_URL.test(value)) return value;
  console.warn(`[security] Blocked unsafe link "${value}" – only /…, https://, mailto: and tel: are allowed.`);
  return "#";
}

// Images may only come from the site's own uploads folder or from an https address.
// "/uploads/foo.jpg" (as stored by the CMS) -> "src/uploads/foo.jpg"; anything else -> null.
function sourcePath(src) {
  const value = String(src).trim();
  if (/^https:\/\//i.test(value)) return value;
  const rel = value.replace(/^\/+/, "");
  if (rel.startsWith("uploads/") && !rel.split(/[\\/]/).includes("..")) return path.join("src", rel);
  console.warn(`[security] Ignored image "${value}" – images must be in /uploads/ or an https address.`);
  return null;
}

function imageOptions(widths, urlPath = "/img/") {
  return {
    widths,
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    urlPath,
    sharpWebpOptions: { quality: 70 },
    sharpJpegOptions: { quality: 75, progressive: true, mozjpeg: true },
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  // Page bodies use the same safe renderer as the CMS text fields.
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");

  // Drafts ("Luonnos") and posts scheduled for later ("publishAt") are left out of the
  // published site entirely: no page, not in the news list, not in the sitemap.
  // The hourly GitHub Actions build publishes scheduled posts once their time has passed.
  eleventyConfig.addPreprocessor("unpublished", "md", (data) => {
    if (isPreview) return;
    if (data.draft) return false;
    if (isFuture(data.publishAt)) return false;
  });

  // Responsive <picture> for content images.
  // priority: "high" = the page's main (LCP) image, "low" = hidden until interaction
  // (e.g. later gallery slides), "eager" = visible on load, otherwise lazy-loaded.
  async function picture(src, alt = "", sizes = "100vw", widths = [480, 960, 1600], priority = "") {
    const file = src && sourcePath(src);
    if (!file) return "";
    const metadata = await Image(file, imageOptions(widths));
    const attrs = { alt, sizes, decoding: "async" };
    if (priority === "high") attrs.fetchpriority = "high";
    else if (priority === "low") Object.assign(attrs, { loading: "lazy", fetchpriority: "low" });
    else if (priority !== "eager") attrs.loading = "lazy";
    return Image.generateHTML(metadata, attrs);
  }
  eleventyConfig.addShortcode("image", picture);

  // Sections that contain images are JavaScript shortcodes rather than Nunjucks includes:
  // an {% include %} that uses an async shortcode renders nothing when it runs inside a loop,
  // which is exactly how the section builder (layouts/custom-page.njk) uses them.

  // Image carousel (behaviour in src/js/main.js). lcp = true when it is the page's main image.
  eleventyConfig.addShortcode("carousel", async (images = [], heading = "", lcp = false) => {
    if (!images || !images.length) return "";
    const slides = await Promise.all(images.map(async (img, i) => {
      const priority = i === 0 ? (lcp ? "high" : "") : "low";
      const pic = await picture(img.src, img.alt || "", "(min-width: 1140px) 1108px, 100vw", [640, 1108, 1600], priority);
      return `<figure class="carousel__slide" role="group" aria-roledescription="kuva" aria-label="${i + 1} / ${images.length}" data-marker-name="Näytä kuva ${i + 1}">${pic}${img.caption ? `<figcaption>${escapeHtml(img.caption)}</figcaption>` : ""}</figure>`;
    }));
    return `${heading ? `<h2 class="section-heading">${escapeHtml(heading)}</h2>` : ""}
<section class="carousel" aria-roledescription="karuselli" aria-label="${escapeHtml(heading || "Kuvagalleria")}">
  <div class="carousel__controls">
    <button class="carousel__btn carousel__btn--prev" type="button" data-direction="previous" aria-label="Edellinen kuva">&#8249;</button>
    <button class="carousel__btn carousel__btn--next" type="button" data-direction="next" aria-label="Seuraava kuva">&#8250;</button>
  </div>
  <div class="carousel__track" tabindex="0" role="group" aria-label="Kuvat">${slides.join("")}</div>
  <p class="visually-hidden" role="status" aria-live="polite"></p>
  <nav class="carousel__dots" aria-label="Valitse kuva"></nav>
</section>`;
  });

  // Image beside text (stacked on phones). s = { image, alt, heading, body (Markdown), imageSide }.
  eleventyConfig.addShortcode("imageText", async (s = {}) => {
    const pic = await picture(s.image, s.alt || "", "(min-width: 768px) 540px, 100vw", [480, 800, 1100]);
    return `<div class="image-text${s.imageSide === "right" ? " image-text--right" : ""}">
  ${pic ? `<div class="image-text__image">${pic}</div>` : ""}
  <div class="image-text__text">
    ${s.heading ? `<h2 class="section-heading">${escapeHtml(s.heading)}</h2>` : ""}
    ${s.body ? `<div class="prose">${md.render(String(s.body))}</div>` : ""}
  </div>
</div>`;
  });

  // CSS background images are invisible to the browser's preload scanner, so the
  // page's hero background is preloaded from <head> to keep LCP fast.
  eleventyConfig.addShortcode("bgpreload", async (src) => {
    const file = src && sourcePath(src);
    if (!file) return "";
    const metadata = await Image(file, imageOptions([1600]));
    return `<link rel="preload" as="image" href="${metadata.webp[0].url}" type="image/webp" fetchpriority="high">`;
  });

  // Inline style for a full-width background image. The HTML base plugin does not
  // rewrite URLs inside style attributes, so the path prefix is added here.
  eleventyConfig.addShortcode("bgimage", async (src) => {
    const file = src && sourcePath(src);
    if (!file) return "";
    const metadata = await Image(file, imageOptions([1600], `${pathPrefix}img/`));
    const jpeg = metadata.jpeg[0].url;
    const webp = metadata.webp[0].url;
    return `background-image:url('${jpeg}');background-image:image-set(url('${webp}') type('image/webp'),url('${jpeg}') type('image/jpeg'));`;
  });

  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));
  // Render a Markdown file from the project root (used for the CMS help page from OHJEET.md).
  eleventyConfig.addFilter("mdFile", (file) => md.render(fs.readFileSync(file, "utf8")));
  eleventyConfig.addWatchTarget("OHJEET.md");
  eleventyConfig.addFilter("isExternal", (url) => /^https?:\/\//.test(url || ""));
  eleventyConfig.addFilter("safeUrl", safeUrl);
  eleventyConfig.addFilter("fiDate", (date) =>
    new Date(date).toLocaleDateString("fi-FI", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));
  eleventyConfig.addFilter("isFuture", isFuture);
  eleventyConfig.addFilter("fiDateTime", (date) =>
    new Date(date).toLocaleString("fi-FI", {
      day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Helsinki",
    })
  );

  return {
    pathPrefix,
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    // Content written in the CMS is plain Markdown; never run it through a template engine.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
