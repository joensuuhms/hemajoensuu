/* Starts Decap CMS with the Finnish interface and previews that look like the real site.
   Loaded after decap-cms.js; index.html sets window.CMS_MANUAL_INIT = true so that the
   locale and preview templates are registered before the CMS starts. */
(function () {
  const CMS = window.CMS;
  const h = window.h;
  const createClass = window.createClass;

  // ---------------------------------------------------------------- Finnish UI
  CMS.registerLocale("fi", window.DECAP_LOCALE_FI);

  // ---------------------------------------------------------------- Preview styles
  // Absolute URLs: the preview iframe must load the site's own stylesheet and fonts.
  CMS.registerPreviewStyle(new URL("../css/style.css", location.href).href);
  CMS.registerPreviewStyle(new URL("preview.css", location.href).href);

  // ---------------------------------------------------------------- Helpers
  const get = (entry, key) => entry.getIn(["data", key]);
  const toJS = (v) => (v && typeof v.toJS === "function" ? v.toJS() : v);
  const assetUrl = (getAsset, path) => {
    if (!path) return "";
    const asset = getAsset(path);
    return asset ? asset.toString() : "";
  };
  const fiDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d) ? String(value) : d.toLocaleDateString("fi-FI");
  };
  const note = (text) => h("p", { className: "preview-note" }, text);

  function buttons(list) {
    const real = (list || []).filter((b) => b && b.text);
    if (!real.length) return null;
    return h("p", { className: "actions" },
      real.map((b, i) => h("a", { key: i, className: "btn btn--" + (b.style || "accent"), href: "#" }, b.text)));
  }

  function faqList(items, widgets) {
    if (!items || !items.length) return null;
    return h("div", { className: "faq" }, items.map((item, i) =>
      h("details", { key: i, className: "faq__item", open: i === 0 },
        h("summary", { className: "faq__q" }, item.question || "(kysymys puuttuu)"),
        h("div", { className: "faq__a prose" }, widgets ? widgets.getIn([i, "widgets", "answer"]) : item.answer))));
  }

  function infoBox(title, textWidget) {
    if (!textWidget && !title) return null;
    return h("aside", { className: "info-box" },
      title ? h("h2", { className: "info-box__title" }, title) : null,
      h("div", { className: "prose" }, textWidget));
  }

  // ---------------------------------------------------------------- News article
  const NewsPreview = createClass({
    render() {
      const { entry, widgetFor, getAsset } = this.props;
      const title = get(entry, "title") || "Uutisen otsikko";
      const image = assetUrl(getAsset, get(entry, "image"));
      const card = assetUrl(getAsset, get(entry, "cardImage"));
      const bg = assetUrl(getAsset, get(entry, "background"));
      const meta = [get(entry, "author"), fiDate(get(entry, "date"))].filter(Boolean).join(" · ");
      const draft = get(entry, "draft");
      return h("div", null,
        draft ? h("p", { className: "preview-banner" }, "LUONNOS – ei näy sivustolla") : null,
        h("article", {
          className: "section" + (bg && !image ? " section--bg" : ""),
          style: bg && !image ? { backgroundImage: `url("${bg}")` } : null,
        },
          bg && !image ? h("div", { className: "overlay", style: { opacity: 0.7 } }) : null,
          h("div", { className: "container article" + (image ? " article--split" : "") },
            image ? h("div", { className: "article__image" }, h("img", { src: image, alt: get(entry, "imageAlt") || "" })) : null,
            h("div", { className: "article__text" },
              h("h1", { className: "article__title" }, title),
              meta ? h("p", { className: "article__meta" }, meta) : null,
              h("div", { className: "prose" }, widgetFor("body"))))),
        h("section", { className: "section preview-cards" },
          h("div", { className: "container" },
            note("Näin uutinen näkyy Ajankohtaista-sivun uutiskortissa:"),
            h("div", { className: "cards" },
              h("article", { className: "card" },
                card ? h("div", { className: "card__img" }, h("img", { src: card, alt: "" })) : null,
                h("div", { className: "card__body" },
                  h("h2", { className: "card__title" }, h("a", { href: "#" }, title)),
                  h("p", { className: "card__meta" }, meta),
                  get(entry, "summary") ? h("p", null, get(entry, "summary")) : null,
                  h("p", { className: "card__more" }, h("a", { href: "#" }, "Lue lisää"))))))));
    },
  });
  CMS.registerPreviewTemplate("uutiset", NewsPreview);

  // ---------------------------------------------------------------- Pages with a photo hero
  const HeroPagePreview = createClass({
    render() {
      const { entry, widgetFor, widgetsFor, getAsset } = this.props;
      const bg = assetUrl(getAsset, get(entry, "heroImage"));
      const overlay = Number(get(entry, "overlay")) || 0;
      const box = toJS(get(entry, "infoBox")) || {};
      const faq = toJS(get(entry, "faq")) || [];
      return h("section", { className: "hero", style: bg ? { backgroundImage: `url("${bg}")` } : null },
        overlay ? h("div", { className: "overlay", style: { opacity: overlay } }) : null,
        h("div", { className: "container hero__inner" },
          h("div", { className: "hero__content" + (get(entry, "wide") ? " hero__content--wide" : "") },
            h("h1", { className: "page-title title--" + (get(entry, "titleColor") || "light") }, get(entry, "heroTitle") || get(entry, "title")),
            h("div", { className: "prose" }, widgetFor("body")),
            faqList(faq, faq.length ? widgetsFor("faq") : null),
            buttons([toJS(get(entry, "button")), toJS(get(entry, "button2"))]),
            box.text ? infoBox(box.title, widgetsFor("infoBox").getIn(["widgets", "text"])) : null)));
    },
  });
  ["etusivu", "tietoa", "yhteystiedot", "ukk", "ajankohtaista"].forEach((name) =>
    CMS.registerPreviewTemplate(name, HeroPagePreview));

  // ---------------------------------------------------------------- Gallery page
  const GalleryPreview = createClass({
    render() {
      const { entry, getAsset } = this.props;
      const images = toJS(get(entry, "images")) || [];
      return h("section", { className: "section" },
        h("div", { className: "container" },
          h("h1", { className: "page-title title--" + (get(entry, "titleColor") || "light") }, get(entry, "heroTitle") || get(entry, "title")),
          note("Sivustolla kuvat näkyvät karusellina yksi kerrallaan. Esikatselussa ne näytetään ruudukkona."),
          h("div", { className: "preview-grid" }, images.map((img, i) =>
            h("figure", { key: i },
              img.src ? h("img", { src: assetUrl(getAsset, img.src), alt: img.alt || "" }) : null,
              h("figcaption", null, (img.alt || "(kuvaus puuttuu)") + (img.caption ? " – " + img.caption : "")))))));
    },
  });
  CMS.registerPreviewTemplate("galleria", GalleryPreview);

  // ---------------------------------------------------------------- Own pages (section builder)
  const CustomPagePreview = createClass({
    render() {
      const { entry, widgetFor, widgetsFor, getAsset } = this.props;
      const isHero = get(entry, "pageStyle") === "hero";
      const bg = isHero ? assetUrl(getAsset, get(entry, "heroImage")) : "";
      const overlay = Number(get(entry, "overlay")) || 0;
      const sections = toJS(get(entry, "sections")) || [];
      const sectionWidgets = widgetsFor("sections");
      const renderSection = (s, i) => {
        const w = (name) => sectionWidgets.getIn([i, "widgets", name]);
        const heading = s.heading ? h("h2", { className: "section-heading" }, s.heading) : null;
        switch (s.type) {
          case "text":
            return [heading, h("div", { className: "prose", key: "b" }, w("body"))];
          case "imageText":
            return h("div", { className: "image-text" + (s.imageSide === "right" ? " image-text--right" : "") },
              s.image ? h("div", { className: "image-text__image" }, h("img", { src: assetUrl(getAsset, s.image), alt: s.alt || "" })) : null,
              h("div", { className: "image-text__text" }, heading, h("div", { className: "prose" }, w("body"))));
          case "buttons":
            return buttons(s.buttons);
          case "gallery":
            return [heading, h("div", { className: "preview-grid", key: "g" }, (s.images || []).map((img, j) =>
              h("figure", { key: j }, img.src ? h("img", { src: assetUrl(getAsset, img.src), alt: img.alt || "" }) : null)))];
          case "faq":
            return [heading, h("div", { className: "faq", key: "f" }, (s.items || []).map((item, j) =>
              h("details", { key: j, className: "faq__item", open: j === 0 },
                h("summary", { className: "faq__q" }, item.question || "(kysymys puuttuu)"),
                h("div", { className: "faq__a prose" }, item.answer))))];
          case "infoBox":
            return infoBox(s.title, w("text"));
          default:
            return null;
        }
      };
      return h("div", null,
        get(entry, "draft") ? h("p", { className: "preview-banner" }, "LUONNOS – ei näy sivustolla") : null,
        h("section", { className: isHero ? "hero" : "section", style: bg ? { backgroundImage: `url("${bg}")` } : null },
          bg && overlay ? h("div", { className: "overlay", style: { opacity: overlay } }) : null,
          h("div", { className: "container" + (isHero ? " hero__inner" : "") },
            h("div", { className: "custom-page" },
              h("h1", { className: "page-title title--" + (get(entry, "titleColor") || "light") }, get(entry, "heroTitle") || get(entry, "title") || "Sivun otsikko"),
              h("div", { className: "prose" }, widgetFor("body")),
              sections.length ? null : note("Lisää sivulle osioita vasemmalta kohdasta ”Osiot”."),
              sections.map((s, i) => h("div", { key: i, className: "page-section page-section--" + s.type }, renderSection(s, i)))))));
    },
  });
  CMS.registerPreviewTemplate("omat-sivut", CustomPagePreview);

  // ---------------------------------------------------------------- Start
  CMS.init();
})();
