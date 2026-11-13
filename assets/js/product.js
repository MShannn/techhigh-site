// Shared script for product landing pages (/rentacar/, /rotadesk/, ...).
(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Nav: background on scroll + mobile menu
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Screenshot strip arrows
  document.querySelectorAll(".shots").forEach((strip) => {
    const track = strip.querySelector(".shots__track");
    strip.querySelectorAll(".shots__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        track.scrollBy({ left: Number(btn.dataset.dir) * track.clientWidth * 0.8, behavior: "smooth" });
      });
    });
  });

  // Lightbox (arrow keys browse, Esc closes)
  const lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    const img = lb.querySelector("img");
    const cap = lb.querySelector("figcaption");
    let group = [];
    let current = 0;
    const show = (i) => {
      current = (i + group.length) % group.length;
      const shot = group[current];
      img.src = shot.dataset.src;
      img.alt = shot.querySelector("img").alt;
      cap.textContent = `${shot.querySelector("span").textContent} · ${current + 1} / ${group.length}`;
    };
    document.querySelectorAll(".shot").forEach((shot) => {
      shot.addEventListener("click", () => {
        group = [...shot.closest(".shots__track").querySelectorAll(".shot")];
        show(group.indexOf(shot));
        lb.showModal();
      });
    });
    lb.querySelector(".lightbox__close").addEventListener("click", () => lb.close());
    lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
    lb.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });
  }
})();
