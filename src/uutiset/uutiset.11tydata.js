// Shared settings for news articles. Every .md file in this folder becomes /uutiset/<file-name>/
export default {
  layout: "layouts/article.njk",
  tags: ["news"],
  eleventyComputed: {
    permalink: (data) => `/uutiset/${data.page.fileSlug}/`,
  },
};
