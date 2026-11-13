(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

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

  // Rotating hero word
  const rotator = document.getElementById("rotator");
  const words = ["higher", "faster", "safer", "smarter"];
  if (!reduceMotion) {
    let i = 0;
    setInterval(() => {
      rotator.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        rotator.textContent = words[i];
        rotator.classList.remove("is-out");
      }, 350);
    }, 2600);
  }

  // Scroll reveal + stat counters
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      const counter = entry.target.querySelector("[data-count]");
      if (counter) countUp(counter);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Card spotlight follows the cursor
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // Hero dashboard tilt
  const tilt = document.querySelector(".tilt");
  const hero = document.querySelector(".hero");
  if (tilt && !reduceMotion && window.matchMedia("(hover: hover) and (min-width: 761px)").matches) {
    hero.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tilt.style.transform = `rotateY(${-10 + x * 12}deg) rotateX(${6 - y * 10}deg)`;
    });
    hero.addEventListener("pointerleave", () => { tilt.style.transform = ""; });
  }

  // Product tabs (with arrow-key support)
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(idx + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next);
      next.focus();
    });
  });

  // Feature lists start short; "Show all" expands them
  const openFeats = (feats, open) => {
    feats.classList.toggle("is-open", open);
    const btn = feats.querySelector(".feats__more");
    if (!btn) return;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Show fewer features" : `Show all ${feats.querySelectorAll(".feat").length} features`;
  };
  document.querySelectorAll(".feats__more").forEach((btn) => {
    btn.addEventListener("click", () => {
      const feats = btn.closest(".feats");
      const open = !feats.classList.contains("is-open");
      openFeats(feats, open);
      if (!open) feats.scrollIntoView({ block: "start" });
    });
  });
  document.querySelectorAll('a[href$="-features"]').forEach((link) => {
    link.addEventListener("click", () => {
      const feats = document.querySelector(link.getAttribute("href"));
      if (feats) openFeats(feats, true);
    });
  });

  // Footer links that open a specific product tab
  document.querySelectorAll("[data-tab]").forEach((link) => {
    link.addEventListener("click", () => {
      const tab = document.getElementById(`t-${link.dataset.tab}`);
      if (tab) selectTab(tab);
    });
  });

  // Screenshot strips: arrow buttons scroll one "page"
  document.querySelectorAll(".shots").forEach((strip) => {
    const track = strip.querySelector(".shots__track");
    strip.querySelectorAll(".shots__btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        track.scrollBy({ left: Number(btn.dataset.dir) * track.clientWidth * 0.8, behavior: "smooth" });
      });
    });
  });

  // Lightbox for screenshots (per product gallery, arrow keys to browse)
  const lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    const lbImg = lb.querySelector("img");
    const lbCap = lb.querySelector("figcaption");
    let group = [];
    let current = 0;
    const show = (i) => {
      current = (i + group.length) % group.length;
      const shot = group[current];
      lbImg.src = shot.dataset.src;
      lbImg.alt = shot.querySelector("img").alt;
      lbCap.textContent = `${shot.querySelector("span").textContent} · ${current + 1} / ${group.length}`;
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

  // Interactive diamond network background
  const canvas = document.getElementById("net");
  const ctx = canvas.getContext("2d");
  const COLORS = [[124, 92, 255], [34, 211, 238], [167, 139, 250], [244, 114, 182]];
  const LINK = 130 * 130;   // particle-to-particle link distance²
  const REACH = 190;        // cursor influence radius
  const mouse = { x: 0, y: 0, active: false };
  let pts = [], ripples = [], w = 0, h = 0, raf = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Keep existing particles so mobile toolbar resizes don't reshuffle them
    const n = Math.min(Math.floor((w * h) / 14000), 110);
    while (pts.length < n) {
      const bvx = (Math.random() - 0.5) * 0.4, bvy = (Math.random() - 0.5) * 0.4;
      pts.push({
        x: Math.random() * w, y: Math.random() * h, vx: bvx, vy: bvy, bvx, bvy,
        size: 2 + Math.random() * 3.5, rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.03,
        c: COLORS[Math.floor(Math.random() * COLORS.length)], glow: 0,
      });
    }
    pts.length = n;
  };

  const diamond = (p, alpha) => {
    const s = p.size * (1 + p.glow * 1.2);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (p.glow > 0.05) {
      ctx.fillStyle = `rgba(${p.c}, ${0.18 * p.glow})`;
      ctx.beginPath(); ctx.arc(0, 0, s * 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = `rgba(${p.c}, ${alpha})`;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.7, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.7, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    for (const p of pts) {
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) || 1;
        if (d < REACH) {
          const f = (1 - d / REACH) * 0.9;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          // Swirl slightly around the cursor
          p.vx += (-dy / d) * f * 0.35; p.vy += (dx / d) * f * 0.35;
        }
        p.glow += ((d < REACH ? 1 - d / REACH : 0) - p.glow) * 0.12;
      } else {
        p.glow *= 0.9;
      }
      // Ease back to the drift velocity
      p.vx += (p.bvx - p.vx) * 0.04; p.vy += (p.bvy - p.vy) * 0.04;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.spin + p.glow * 0.08;
      if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = dx * dx + dy * dy;
        if (d < LINK) {
          const boost = Math.max(pts[i].glow, pts[j].glow);
          ctx.strokeStyle = `rgba(124, 140, 255, ${(0.18 + boost * 0.5) * (1 - d / LINK)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }

    // Glowing threads from the cursor to nearby diamonds
    if (mouse.active) {
      for (const p of pts) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < REACH * 1.2) {
          const g = ctx.createLinearGradient(mouse.x, mouse.y, p.x, p.y);
          g.addColorStop(0, `rgba(34, 211, 238, ${0.55 * (1 - d / (REACH * 1.2))})`);
          g.addColorStop(1, `rgba(${p.c}, 0)`);
          ctx.strokeStyle = g;
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
      }
      const halo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      halo.addColorStop(0, "rgba(124, 92, 255, .22)");
      halo.addColorStop(1, "rgba(124, 92, 255, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2); ctx.fill();
    }

    for (const p of pts) diamond(p, 0.55 + p.glow * 0.45);

    // Click ripples
    ripples = ripples.filter((r) => r.life > 0);
    for (const r of ripples) {
      r.r += 6; r.life -= 0.025;
      ctx.strokeStyle = `rgba(34, 211, 238, ${r.life * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    }

    raf = requestAnimationFrame(draw);
  };

  if (!reduceMotion) {
    // The canvas is fixed to the viewport, so client coordinates map directly
    const toCanvas = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("pointermove", (e) => { toCanvas(e); mouse.active = true; }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { mouse.active = false; });
    window.addEventListener("blur", () => { mouse.active = false; });
    window.addEventListener("pointerup", (e) => { if (e.pointerType === "touch") mouse.active = false; });
    window.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button, input, select, textarea, label, [role=tab]")) return;
      toCanvas(e);
      ripples.push({ x: mouse.x, y: mouse.y, r: 0, life: 1 });
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy) || 1;
        if (d < 320) { const f = (1 - d / 320) * 14; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
    });

    // Floating notification cards drift with the cursor for depth
    const floats = document.querySelectorAll(".float");
    hero.addEventListener("pointermove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      floats.forEach((f, i) => {
        const depth = i ? -28 : 36;
        f.style.translate = `${x * depth}px ${y * depth}px`;
      });
    });
    hero.addEventListener("pointerleave", () => floats.forEach((f) => { f.style.translate = ""; }));
  }
  resize();
  window.addEventListener("resize", resize);
  draw();
  if (reduceMotion) cancelAnimationFrame(raf);

  // Contact form
  // Set the form's action attribute to a form endpoint (e.g. Formspree) to submit
  // directly. Without one, the enquiry opens in the visitor's email app instead.
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form__status";
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      const ok = field.type === "checkbox" ? field.checked : field.checkValidity() && field.value.trim() !== "";
      field.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      status.textContent = "Please complete the highlighted fields.";
      status.classList.add("err");
      return;
    }

    const data = new FormData(form);
    const endpoint = form.getAttribute("action");
    if (!endpoint) {
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nCompany: ${data.get("company")}\nInterest: ${data.get("interest")}\n\n${data.get("message")}`;
      window.location.href = `mailto:hello@techhigh.co.uk?subject=${encodeURIComponent("Website enquiry: " + data.get("interest"))}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app to send the enquiry…";
      status.classList.add("ok");
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = "Thanks, your enquiry has been sent. We'll be in touch within one working day.";
      status.classList.add("ok");
    } catch {
      status.textContent = "Sorry, something went wrong. Please email hello@techhigh.co.uk instead.";
      status.classList.add("err");
    } finally {
      btn.disabled = false;
    }
  });
})();
