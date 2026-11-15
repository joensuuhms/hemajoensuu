import path from "node:path";
import { HtmlBasePlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import markdownIt from "markdown-it";

// GitHub Actions sets PATH_PREFIX ("/web/" on github.io, "/" with a custom domain).
const pathPrefix = (process.env.PATH_PREFIX || "/").replace(/\/?$/, "/");

const md = markdownIt({ html: true, linkify: true, breaks: true });

// "/uploads/foo.jpg" (as stored by the CMS) -> "src/uploads/foo.jpg"
function sourcePath(src) {
  if (/^https?:\/\//.test(src)) return src;
  return path.join("src", src.replace(/^\/+/, ""));
}

function imageOptions(widths, urlPath = "/img/") {
  return {
    widths,
    formats: ["webp", "jpeg"],
    outputDir: "_site/img/",
    urlPath,
    sharpWebpOptions: { quality: 70 },
    sharpJpegOptions: { quality: 75, progressive: true, mozjpeg: true },
  };
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");

  // Responsive <picture> for content images.
  eleventyConfig.addShortcode("image", async (src, alt = "", sizes = "100vw", widths = [480, 960, 1600]) => {
    if (!src) return "";
    const metadata = await Image(sourcePath(src), imageOptions(widths));
    return Image.generateHTML(metadata, { alt, sizes, loading: "lazy", decoding: "async" });
  });

  // Inline style for a full-width background image. The HTML base plugin does not
  // rewrite URLs inside style attributes, so the path prefix is added here.
  eleventyConfig.addShortcode("bgimage", async (src) => {
    if (!src) return "";
    const metadata = await Image(sourcePath(src), imageOptions([1600], `${pathPrefix}img/`));
    const jpeg = metadata.jpeg[0].url;
    const webp = metadata.webp[0].url;
    return `background-image:url('${jpeg}');background-image:image-set(url('${webp}') type('image/webp'),url('${jpeg}') type('image/jpeg'));`;
  });

  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));
  eleventyConfig.addFilter("isExternal", (url) => /^https?:\/\//.test(url || ""));
  eleventyConfig.addFilter("fiDate", (date) =>
    new Date(date).toLocaleDateString("fi-FI", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (date) => new Date(date).toISOString().slice(0, 10));

  return {
    pathPrefix,
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    // Content written in the CMS is plain Markdown; never run it through a template engine.
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
}
