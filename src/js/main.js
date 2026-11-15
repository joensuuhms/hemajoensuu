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
  // Native scroll-snap does the scrolling (touch, trackpad, arrow keys on the focused
  // track). This script only wires the buttons and dots and announces the current image.
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel__track");
    const slides = [...track.children];
    const buttons = carousel.querySelectorAll(".carousel__btn");
    const status = carousel.querySelector("[role=status]");
    if (slides.length < 2) {
      buttons.forEach((b) => { b.hidden = true; });
      return;
    }

    // Nearest slide to the track's centre, measured from the real scroll position.
    const nearest = () => {
      const centre = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - track.offsetLeft + s.offsetWidth / 2 - centre);
        const bd = Math.abs(slides[best].offsetLeft - track.offsetLeft + slides[best].offsetWidth / 2 - centre);
        if (d < bd) best = i;
      });
      return best;
    };

    let current = 0;   // slide shown by the markers
    let settled = 0;   // last slide announced after scrolling stopped
    let pending = null; // slide a click is scrolling to

    const dots = slides.map((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", slide.dataset.markerName || `${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      carousel.querySelector(".carousel__dots").append(dot);
      return dot;
    });
    const mark = (i) => {
      if (i === current && dots[i].getAttribute("aria-current") === "true") return;
      current = i;
      dots.forEach((d, j) => d.setAttribute("aria-current", String(j === i)));
    };

    function goTo(i) {
      const target = (i + slides.length) % slides.length;
      pending = target;
      mark(target);
      const s = slides[target];
      track.scrollTo({ left: s.offsetLeft - track.offsetLeft - (track.clientWidth - s.offsetWidth) / 2 });
    }

    buttons.forEach((b) => {
      b.addEventListener("click", () => {
        const from = pending ?? nearest(); // rapid clicks build on the slide already targeted
        goTo(from + (b.dataset.direction === "next" ? 1 : -1));
      });
    });

    // Keep the dots in step while scrolling (one update per frame).
    let frame = 0;
    track.addEventListener("scroll", () => {
      if (pending !== null || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; mark(nearest()); });
    }, { passive: true });

    // Once scrolling stops: sync state and announce the image for screen readers.
    const onSettle = () => {
      pending = null;
      const i = nearest();
      mark(i);
      if (i !== settled) {
        settled = i;
        status.textContent = `Kuva ${i + 1} / ${slides.length}`;
      }
    };
    if ("onscrollend" in window) {
      track.addEventListener("scrollend", onSettle);
    } else {
      let timer;
      track.addEventListener("scroll", () => { clearTimeout(timer); timer = setTimeout(onSettle, 120); }, { passive: true });
    }

    mark(0);
  });
})();
