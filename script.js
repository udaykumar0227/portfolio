/* ============================================================
   Gudla Uday Kumar — portfolio interactions
   Vanilla JS, no dependencies. Everything degrades gracefully.
   ============================================================ */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- footer year + local clock ---------- */

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const tick = () => {
      clock.textContent = formatter.format(new Date());
    };
    tick();
    window.setInterval(tick, 30000);
  }

  /* ---------- mobile menu ---------- */

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- scroll reveal ---------- */

  const revealEls = document.querySelectorAll("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- scroll progress ---------- */

  const progress = document.querySelector(".progress");

  if (progress) {
    let ticking = false;

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = `scaleX(${value})`;
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      },
      { passive: true }
    );

    updateProgress();
  }

  /* ---------- active nav link ---------- */

  const navLinks = Array.from(document.querySelectorAll(".nav a"));

  if (navLinks.length && "IntersectionObserver" in window) {
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- copy email ---------- */

  const copyButton = document.querySelector("[data-copy]");

  if (copyButton) {
    const label = copyButton.querySelector(".copy__label");
    let resetTimer;

    const copyText = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "-1000px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();

        let ok = false;
        try {
          ok = document.execCommand("copy");
        } catch (fallbackError) {
          ok = false;
        }

        field.remove();
        return ok;
      }
    };

    copyButton.addEventListener("click", async () => {
      const text = copyButton.getAttribute("data-copy");
      const ok = await copyText(text);

      window.clearTimeout(resetTimer);
      copyButton.classList.toggle("is-copied", ok);
      if (label) label.textContent = ok ? "Copied" : "Press ⌘C";

      resetTimer = window.setTimeout(() => {
        copyButton.classList.remove("is-copied");
        if (label) label.textContent = "Copy";
      }, 1800);
    });
  }

  /* ---------- custom cursor ---------- */

  if (finePointer && !reduceMotion) {
    const dot = document.querySelector(".cursor");
    const ring = document.querySelector(".cursor-ring");

    if (dot && ring) {
      document.body.classList.add("has-cursor");

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let ringX = mouseX;
      let ringY = mouseY;
      let visible = false;

      window.addEventListener(
        "pointermove",
        (event) => {
          mouseX = event.clientX;
          mouseY = event.clientY;

          dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

          if (!visible) {
            visible = true;
            document.body.classList.add("cursor-active");
          }
        },
        { passive: true }
      );

      document.addEventListener("pointerleave", () => {
        visible = false;
        document.body.classList.remove("cursor-active");
      });

      const render = () => {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        window.requestAnimationFrame(render);
      };
      render();

      const interactive = document.querySelectorAll(
        "a, button, .card, .social, .chips li"
      );

      interactive.forEach((el) => {
        el.addEventListener("pointerenter", () =>
          document.body.classList.add("cursor-hover")
        );
        el.addEventListener("pointerleave", () =>
          document.body.classList.remove("cursor-hover")
        );
      });
    }
  }

  /* ---------- subtle hero parallax ---------- */

  const art = document.querySelector(".hero__art");

  if (art && finePointer && !reduceMotion) {
    let artTick = false;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 16;
        targetY = (event.clientY / window.innerHeight - 0.5) * 16;

        if (artTick) return;
        artTick = true;

        window.requestAnimationFrame(() => {
          art.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
          artTick = false;
        });
      },
      { passive: true }
    );
  }
})();
