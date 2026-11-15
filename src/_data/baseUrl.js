// Absolute site URL (no trailing slash), used in the sitemap, robots.txt and social meta tags.
import site from "./site.json" with { type: "json" };

export default site.domain ? `https://${site.domain}` : "https://joensuuhms.github.io/web";
