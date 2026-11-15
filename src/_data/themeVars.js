// Turns the colours chosen in the CMS (src/_data/theme.json) into CSS custom properties.
// Every colour is checked against WCAG contrast before it is used; a colour that would make
// text hard to read is replaced by the default and a warning is printed in the build log.
import theme from "./theme.json" with { type: "json" };

const DEFAULTS = {
  heading: "#ff6666",
  link: "#ff8080",
  button: "#c93c3c",
  buttonAlt: "#3d6fd1",
  background: "#232323",
  panel: "#353535",
};
const TEXT = "#fafafa";
const WHITE = "#ffffff";

const isHex = (c) => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c.trim());
const normalise = (c) => {
  if (typeof c !== "string") return null;
  const v = c.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(v)) return "#" + [...v.slice(1)].map((x) => x + x).join("");
  return isHex(v) ? v : null;
};
const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

function pick(name, checks) {
  const value = normalise(theme[name]);
  if (!value) {
    if (theme[name]) console.warn(`[theme] "${name}": "${theme[name]}" is not a valid colour – using ${DEFAULTS[name]}.`);
    return DEFAULTS[name];
  }
  for (const [against, min, what] of checks(value)) {
    const ratio = contrast(value, against);
    if (ratio < min) {
      console.warn(`[theme] "${name}" ${value} has contrast ${ratio.toFixed(2)}:1 against ${what} (needs ${min}:1) – using ${DEFAULTS[name]}.`);
      return DEFAULTS[name];
    }
  }
  return value;
}

// Backgrounds first: the other colours are checked against the backgrounds actually used.
const background = pick("background", () => [[TEXT, 4.5, "body text"]]);
const panel = pick("panel", () => [[TEXT, 4.5, "body text"]]);
const heading = pick("heading", () => [[panel, 3, "the panel background"], [background, 3, "the page background"]]);
const link = pick("link", () => [[panel, 4.5, "the panel background"], [background, 4.5, "the page background"]]);
const button = pick("button", () => [[WHITE, 4.5, "white button text"]]);
const buttonAlt = pick("buttonAlt", () => [[WHITE, 4.5, "white button text"]]);

export default {
  css: [
    `--bg:${background}`,
    `--panel:${panel}`,
    `--accent:${heading}`,
    `--link:${link}`,
    `--btn-accent:${button}`,
    `--btn-primary:${buttonAlt}`,
  ].join(";"),
};
