// Pages created in the CMS ("Omat sivut"). Each file becomes /<file-name>/,
// e.g. src/omat-sivut/kesaleiri.md -> /kesaleiri/
export default {
  layout: "layouts/custom-page.njk",
  eleventyComputed: {
    permalink: (data) => `/${data.page.fileSlug}/`,
  },
};
