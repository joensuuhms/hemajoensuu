// Shared settings for the pages in this folder. Keeping layout and permalink here
// (instead of in each file) means the CMS only ever sees editable content fields.
import path from "node:path";

export default {
  layout: "layouts/hero.njk",
  eleventyComputed: {
    // Keep the old Mobirise URLs (readmore.html, faq.html, ...) so existing links keep working.
    permalink: (data) => {
      const name = path.basename(data.page.inputPath, ".md");
      return name === "index" ? "/" : `/${name}.html`;
    },
  },
};
