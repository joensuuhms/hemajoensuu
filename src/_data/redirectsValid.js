// Validates the redirects edited in the CMS (src/_data/redirects.json) before they are built.
// An invalid entry is skipped with a warning instead of breaking the whole build, so one
// typo in the CMS can never stop the site from being published.
import fs from "node:fs";
import path from "node:path";
import data from "./redirects.json" with { type: "json" };

// Old address: a site path ending in ".html" or "/" (e.g. /page6.html, /vanha-sivu/).
const FROM = /^\/(?!\/)[A-Za-z0-9._~%\-/]*(\.html?|\/)$/;
// New address: a site path or an https address. No protocol-relative (//…) or javascript: targets.
const TO = /^(\/(?!\/)|https:\/\/)[^\s"'<>]*$/;

// Addresses already used by real pages – a redirect there would clash with the page.
function existingUrls() {
  const urls = new Set(["/", "/index.html", "/404.html", "/sitemap.xml", "/robots.txt"]);
  const names = (dir) =>
    fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => path.basename(f, ".md")) : [];
  for (const n of names("src/sivut")) urls.add(n === "index" ? "/" : `/${n}.html`);
  for (const n of names("src/uutiset")) urls.add(`/uutiset/${n}/`);
  for (const n of names("src/omat-sivut")) urls.add(`/${n}/`);
  return urls;
}

export default function () {
  const taken = existingUrls();
  const seen = new Set();
  const valid = [];
  for (const r of data.redirects || []) {
    const from = String(r?.from ?? "").trim();
    const to = String(r?.to ?? "").trim();
    let problem = null;
    if (!FROM.test(from) || from.split("/").includes("..")) problem = "old address must start with / and end with .html or /";
    else if (!TO.test(to) || to.split("/").includes("..")) problem = "new address must start with / or https://";
    else if (taken.has(from)) problem = "old address is an existing page";
    else if (seen.has(from)) problem = "old address is listed twice";
    if (problem) {
      console.warn(`[redirects] Skipped "${from}" → "${to}": ${problem}.`);
      continue;
    }
    seen.add(from);
    valid.push({ from, to });
  }
  return valid;
}
