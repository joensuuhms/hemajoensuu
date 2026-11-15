#!/usr/bin/env node
// Backup and restore for the HEMAJoensuu site.
//
//   node scripts/backup.mjs backup [--full] [--out <dir>]
//   node scripts/backup.mjs restore <file.zip> [--dry-run] [--keep-workflows] [--summary <file.md>]
//
// A backup is a .zip with a manifest.json (type, date, commit, SHA-256 of every file).
//   content ("sisalto"): pages, news, own pages, settings JSON and images – what editors change.
//   full    ("koko"):    every file tracked by git (content + code).
// Restore validates the whole archive before writing anything, then makes the content
// (or, for a full backup, the whole tracked tree) exactly match the backup.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { unzipSync, zipSync } from "fflate";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FORMAT = "hemajoensuu-backup";
const FORMAT_VERSION = 1;

// Limits that protect against corrupted or malicious archives.
const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const MAX_FILES = 5000;

// What counts as "content". Everything an editor can change in the CMS lives here.
const CONTENT_RULES = [
  /^src\/sivut\/[^/]+\.md$/,
  /^src\/uutiset\/[^/]+\.md$/,
  /^src\/omat-sivut\/[^/]+\.md$/,
  /^src\/_data\/(site|navigation|theme|redirects)\.json$/,
  /^src\/uploads\/.+$/,
];
const CONTENT_DIRS = ["src/sivut", "src/uutiset", "src/omat-sivut", "src/_data", "src/uploads"];
// Never part of a full backup / never touched by a full restore.
const NEVER = [/^\.git\//, /^node_modules\//, /^_site\//, /^backups\//, /^palautus\//];
const WORKFLOWS = /^\.github\/workflows\//;

const isContent = (p) => CONTENT_RULES.some((r) => r.test(p));
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const toPosix = (p) => p.split(path.sep).join("/");
const abs = (p) => path.join(ROOT, ...p.split("/"));

function fail(message) {
  console.error(`\nVIRHE: ${message}\n`);
  process.exit(1);
}

function args(list) {
  const out = { _: [] };
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a === "--full" || a === "--dry-run" || a === "--keep-workflows") out[a.slice(2)] = true;
    else if (a === "--out" || a === "--summary") out[a.slice(2)] = list[++i];
    else out._.push(a);
  }
  return out;
}

function walk(dir) {
  const full = abs(dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => toPosix(path.relative(ROOT, path.join(d.parentPath ?? d.path, d.name))));
}

function git(...a) {
  try {
    return execFileSync("git", a, { cwd: ROOT, encoding: "utf8" });
  } catch {
    return null;
  }
}

function contentFiles() {
  return CONTENT_DIRS.flatMap(walk).filter(isContent).sort();
}

function trackedFiles() {
  const out = git("ls-files", "-z");
  if (out === null) fail("Koko sivuston varmuuskopio vaatii gitin (git ls-files epäonnistui).");
  return out
    .split("\0")
    .filter(Boolean)
    .filter((p) => !NEVER.some((r) => r.test(p)))
    .filter((p) => fs.existsSync(abs(p)))
    .sort();
}

// Rejects anything that could write outside the project or into places we never restore.
function checkPath(p) {
  if (typeof p !== "string" || !p) return "tyhjä polku";
  if (p.includes("\\")) return "kenoviiva polussa";
  if (p.startsWith("/") || /^[a-zA-Z]:/.test(p)) return "absoluuttinen polku";
  if (p.split("/").some((part) => part === ".." || part === "." || part === "")) return "kielletty polun osa";
  if (path.posix.normalize(p) !== p) return "normalisoimaton polku";
  if (NEVER.some((r) => r.test(p))) return "kielletty kansio";
  return null;
}

// ---------------------------------------------------------------- backup
function backup(opts) {
  const type = opts.full ? "full" : "content";
  const files = type === "full" ? trackedFiles() : contentFiles();
  if (!files.length) fail("Ei varmuuskopioitavia tiedostoja.");

  const entries = {};
  const list = [];
  for (const p of files) {
    const data = fs.readFileSync(abs(p));
    entries[p] = [data, { level: /\.(jpe?g|png|webp|gif|zip)$/i.test(p) ? 0 : 6 }];
    list.push({ path: p, size: data.length, sha256: sha256(data) });
  }
  const now = new Date();
  const manifest = {
    format: FORMAT,
    version: FORMAT_VERSION,
    type,
    createdAt: now.toISOString(),
    commit: (git("rev-parse", "HEAD") || "").trim() || null,
    files: list,
  };
  entries["manifest.json"] = [Buffer.from(JSON.stringify(manifest, null, 2)), { level: 6 }];

  const stamp = now.toISOString().slice(0, 16).replace("T", "-").replace(":", "");
  const name = `hemajoensuu-${type === "full" ? "koko" : "sisalto"}-${stamp}.zip`;
  const outDir = path.resolve(ROOT, opts.out || "backups");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, name);
  fs.writeFileSync(outFile, zipSync(entries));

  const total = list.reduce((s, f) => s + f.size, 0);
  console.log(`Varmuuskopio valmis: ${path.relative(process.cwd(), outFile) || outFile}`);
  console.log(`  tyyppi: ${type === "full" ? "koko sivusto" : "sisältö"}, ${list.length} tiedostoa, ${(total / 1048576).toFixed(1)} Mt`);
  return outFile;
}

// ---------------------------------------------------------------- restore
function readArchive(file) {
  if (!file) fail("Anna palautettava tiedosto: npm run restore -- <tiedosto.zip>");
  if (!fs.existsSync(file)) fail(`Tiedostoa ei löydy: ${file}`);
  const stat = fs.statSync(file);
  if (stat.size > MAX_ARCHIVE_BYTES) fail(`Tiedosto on liian suuri (${(stat.size / 1048576).toFixed(0)} Mt).`);

  let count = 0;
  let total = 0;
  let files;
  try {
    files = unzipSync(fs.readFileSync(file), {
      // Checked before anything is decompressed (guards against zip bombs).
      filter(f) {
        count += 1;
        total += f.originalSize;
        if (count > MAX_FILES) throw new Error("liikaa tiedostoja");
        if (total > MAX_TOTAL_BYTES) throw new Error("purettu koko on liian suuri");
        return true;
      },
    });
  } catch (e) {
    fail(`Tiedosto ei ole kelvollinen zip-varmuuskopio (${e.message}).`);
  }

  const raw = files["manifest.json"];
  if (!raw) fail("manifest.json puuttuu – tämä ei ole sivuston varmuuskopio.");
  let manifest;
  try {
    manifest = JSON.parse(Buffer.from(raw).toString("utf8"));
  } catch {
    fail("manifest.json on rikki.");
  }
  if (manifest.format !== FORMAT) fail("Tuntematon varmuuskopion muoto.");
  if (manifest.version !== FORMAT_VERSION) fail(`Varmuuskopion versio ${manifest.version} ei ole tuettu.`);
  if (!["content", "full"].includes(manifest.type)) fail("Tuntematon varmuuskopion tyyppi.");
  if (!Array.isArray(manifest.files) || !manifest.files.length) fail("Varmuuskopiossa ei ole tiedostoja.");

  const listed = new Set();
  for (const f of manifest.files) {
    const problem = checkPath(f.path);
    if (problem) fail(`Kielletty tiedostopolku "${f.path}" (${problem}).`);
    if (manifest.type === "content" && !isContent(f.path)) fail(`Sisältövarmuuskopiossa on muu kuin sisältötiedosto: ${f.path}`);
    if (listed.has(f.path)) fail(`Sama tiedosto kahdesti: ${f.path}`);
    listed.add(f.path);
    const data = files[f.path];
    if (!data) fail(`Tiedosto puuttuu arkistosta: ${f.path}`);
    if (data.length !== f.size || sha256(data) !== f.sha256) fail(`Tarkistussumma ei täsmää – tiedosto on vioittunut tai muokattu: ${f.path}`);
  }
  for (const name of Object.keys(files)) {
    if (name === "manifest.json" || name.endsWith("/")) continue;
    if (!listed.has(name)) fail(`Arkistossa on ylimääräinen tiedosto, jota manifest ei mainitse: ${name}`);
  }
  return { manifest, files };
}

function restore(opts) {
  const file = opts._[1] && path.resolve(process.cwd(), opts._[1]);
  const { manifest, files } = readArchive(file);
  const full = manifest.type === "full";
  const keep = (p) => opts["keep-workflows"] && WORKFLOWS.test(p);

  const wanted = manifest.files.filter((f) => !keep(f.path));
  const current = full ? trackedFiles() : contentFiles();
  const wantedSet = new Set(wanted.map((f) => f.path));

  const added = [];
  const changed = [];
  const unchanged = [];
  for (const f of wanted) {
    const target = abs(f.path);
    if (!fs.existsSync(target)) added.push(f.path);
    else if (sha256(fs.readFileSync(target)) !== f.sha256) changed.push(f.path);
    else unchanged.push(f.path);
  }
  const removed = current.filter((p) => !wantedSet.has(p) && !keep(p));
  const skipped = manifest.files.filter((f) => keep(f.path)).map((f) => f.path);

  const created = new Date(manifest.createdAt);
  const when = isNaN(created) ? manifest.createdAt : created.toLocaleString("fi-FI", { timeZone: "Europe/Helsinki" });
  const lines = [
    `Varmuuskopio: **${full ? "koko sivusto" : "sisältö"}**, tehty ${when}${manifest.commit ? ` (commit \`${manifest.commit.slice(0, 7)}\`)` : ""}.`,
    "",
    `- Lisätään: ${added.length}`,
    `- Muutetaan: ${changed.length}`,
    `- Poistetaan: ${removed.length}`,
    `- Ennallaan: ${unchanged.length}`,
  ];
  const section = (title, list) => {
    if (!list.length) return;
    lines.push("", `### ${title}`, ...list.slice(0, 200).map((p) => `- \`${p}\``));
    if (list.length > 200) lines.push(`- … ja ${list.length - 200} muuta`);
  };
  section("Lisätään", added);
  section("Muutetaan", changed);
  section("Poistetaan (eivät ole varmuuskopiossa)", removed);
  if (skipped.length) {
    lines.push("", "### Ohitettu", "GitHub Actions ei voi muuttaa työnkulkutiedostoja, joten nämä jätettiin ennalleen:");
    lines.push(...skipped.map((p) => `- \`${p}\``));
  }
  const summary = lines.join("\n");
  console.log("\n" + summary.replace(/\*\*|`/g, "") + "\n");
  if (opts.summary) fs.writeFileSync(path.resolve(process.cwd(), opts.summary), summary + "\n");

  if (opts["dry-run"]) {
    console.log("Kuivaharjoitus: mitään ei muutettu.");
    return;
  }
  for (const p of [...added, ...changed]) {
    fs.mkdirSync(path.dirname(abs(p)), { recursive: true });
    fs.writeFileSync(abs(p), files[p]);
  }
  for (const p of removed) fs.rmSync(abs(p), { force: true });
  console.log(added.length + changed.length + removed.length ? "Palautus tehty." : "Ei muutettavaa – sivusto on jo varmuuskopion mukainen.");
}

// ---------------------------------------------------------------- main
const opts = args(process.argv.slice(2));
const command = opts._[0];
if (command === "backup") backup(opts);
else if (command === "restore") restore(opts);
else {
  console.log(`Käyttö:
  node scripts/backup.mjs backup [--full] [--out <kansio>]
  node scripts/backup.mjs restore <tiedosto.zip> [--dry-run] [--keep-workflows] [--summary <tiedosto.md>]`);
  process.exit(command ? 1 : 0);
}
