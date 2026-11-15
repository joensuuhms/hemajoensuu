// Writes the GitHub Pages CNAME file when a custom domain is set in src/_data/yllapito.json.
export const data = {
  eleventyExcludeFromCollections: true,
  eleventyAllowMissingExtension: true,
  eleventyComputed: {
    permalink: (data) => (data.yllapito?.domain ? "/CNAME" : false),
  },
};

export function render(data) {
  return String(data.yllapito.domain).trim();
}
