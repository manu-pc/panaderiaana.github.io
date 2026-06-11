/* Panadería Ana — vanilla front-end (no jQuery / no framework). */
(() => {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const drawer = document.querySelector(".nav__drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const open = drawer.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    drawer.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => drawer.classList.remove("is-open"))
    );
  }

  /* ---------- Hero carousel (CSS scroll-snap + controls) ---------- */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const track = root.querySelector(".hero__track");
    const slides = [...track.children];
    const dotsWrap = root.querySelector(".hero__dots");
    if (slides.length < 2) {
      root.querySelectorAll(".hero__btn, .hero__dots").forEach((el) => el.remove());
      return;
    }

    let index = 0;
    let timer;
    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: track.clientWidth * index, behavior: "smooth" });
      sync();
    };

    // dots
    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Slide ${i + 1}`);
      b.addEventListener("click", () => { go(i); restart(); });
      dotsWrap.appendChild(b);
      return b;
    });
    const sync = () => dots.forEach((d, i) => d.classList.toggle("is-active", i === index));

    root.querySelector(".hero__btn--prev")?.addEventListener("click", () => { go(index - 1); restart(); });
    root.querySelector(".hero__btn--next")?.addEventListener("click", () => { go(index + 1); restart(); });

    // keep dots in sync when the user swipes
    let scrollDebounce;
    track.addEventListener("scroll", () => {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(() => {
        index = Math.round(track.scrollLeft / track.clientWidth);
        sync();
      }, 80);
    });

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = () => { if (!reduced) timer = setInterval(() => go(index + 1), 6000); };
    const restart = () => { clearInterval(timer); start(); };
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", start);

    sync();
    start();
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) ||
        matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveals.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Lightbox (native <dialog>) ---------- */
  const triggers = document.querySelectorAll("[data-lightbox]");
  if (triggers.length) {
    const dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML =
      '<button class="lightbox__close" aria-label="Cerrar">&times;</button>' +
      '<img alt=""><p class="lightbox__caption"></p>';
    document.body.appendChild(dlg);
    const img = dlg.querySelector("img");
    const cap = dlg.querySelector(".lightbox__caption");

    triggers.forEach((t) => {
      t.classList.add("zoomable");
      t.addEventListener("click", (ev) => {
        ev.preventDefault();
        img.src = t.getAttribute("href") || t.dataset.src;
        const title = t.dataset.title || "";
        img.alt = title;
        cap.textContent = title;
        cap.style.display = title ? "" : "none";
        if (typeof dlg.showModal === "function") dlg.showModal();
      });
    });
    const close = () => dlg.close();
    dlg.querySelector(".lightbox__close").addEventListener("click", close);
    dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  }

  /* ---------- Back to top ---------- */
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const onScroll = () => toTop.classList.toggle("is-visible", window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }
})();
