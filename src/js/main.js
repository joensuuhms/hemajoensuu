(() => {
  // ---------- Mobile menu ----------
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  if (navbar && toggle) {
    toggle.addEventListener("click", () => {
      const open = navbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Sulje valikko" : "Avaa valikko");
    });
    const onScroll = () => navbar.classList.toggle("is-scrolled", window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Dropdowns ----------
  const dropdowns = [...document.querySelectorAll(".has-dropdown")];
  const closeDropdowns = (except) => {
    dropdowns.forEach((dd) => {
      if (dd === except) return;
      dd.classList.remove("is-open");
      dd.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
    });
  };
  dropdowns.forEach((dd) => {
    const button = dd.querySelector(".dropdown-toggle");
    button.addEventListener("click", () => {
      const open = dd.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
      closeDropdowns(dd);
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-dropdown")) closeDropdowns();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdowns();
  });

  // ---------- Gallery carousel ----------
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const slides = [...track.children];
    const prev = carousel.querySelector(".carousel__btn--prev");
    const next = carousel.querySelector(".carousel__btn--next");
    if (slides.length < 2) {
      prev.hidden = next.hidden = true;
      return;
    }

    let index = 0;
    const dots = slides.map((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Näytä kuva ${i + 1}`);
      dot.addEventListener("click", () => { go(i); restart(); });
      carousel.querySelector(".carousel__dots").append(dot);
      return dot;
    });
    const updateDots = () => dots.forEach((d, i) => d.setAttribute("aria-current", String(i === index)));
    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: index * track.clientWidth });
      updateDots();
    };

    let scrollTimer;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        index = Math.round(track.scrollLeft / track.clientWidth);
        updateDots();
      }, 100);
    });
    prev.addEventListener("click", () => { go(index - 1); restart(); });
    next.addEventListener("click", () => { go(index + 1); restart(); });
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); restart(); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); restart(); }
    });

    // Auto-advance every 5 s, paused while the pointer or focus is inside.
    let timer;
    let paused = false;
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => { if (!paused) go(index + 1); }, 5000);
    };
    carousel.addEventListener("mouseenter", () => { paused = true; });
    carousel.addEventListener("mouseleave", () => { paused = false; });
    carousel.addEventListener("focusin", () => { paused = true; });
    carousel.addEventListener("focusout", () => { paused = false; });

    updateDots();
    restart();
  });
})();
