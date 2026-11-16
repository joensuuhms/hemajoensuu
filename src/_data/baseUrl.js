// Absolute site URL (no trailing slash), used in the sitemap, robots.txt and social meta tags.
// The custom domain is set in src/_data/yllapito.json (CMS → Ylläpito → Verkkotunnus).
import yllapito from "./yllapito.json" with { type: "json" };

const domain = String(yllapito.domain || "").trim();
export default domain ? `https://${domain}` : "https://joensuuhms.github.io/hemajoensuu";
