// Writes the GitHub Pages CNAME file when a custom domain is set in src/_data/site.json.
export const data = {
  eleventyExcludeFromCollections: true,
  eleventyAllowMissingExtension: true,
  eleventyComputed: {
    permalink: (data) => (data.site.domain ? "/CNAME" : false),
  },
};

export function render(data) {
  return data.site.domain;
}
