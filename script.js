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

  /* ---------- 21st.dev Neural Noise WebGL Background Shader ---------- */

  const initNeuralNoise = () => {
    const canvas = document.getElementById("neural-noise-canvas");
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.0);
        vec2 res = vec2(0.0);
        float scale = 8.0;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.0);
          sine_acc = rotate(sine_acc, 1.0);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }
        return res.x + res.y;
      }
      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0.0, 1.0);
        p = 0.5 * pow(1.0 - p, 2.0);
        float t = u_speed * u_time;
        vec3 col = vec3(0.0);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.0);
        noise += pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= (1.0 - length(vUv - 0.5));
        col = u_color * noise;
        gl_FragColor = vec4(col, noise);
      }
    `;

    const createShader = (source, type) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(program);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Color: [0.85, 1.0, 0.26] matching the portfolio's acid accent (#d9ff43)
    gl.uniform3f(uniforms.u_color, 0.85, 1.0, 0.26);
    gl.uniform1f(uniforms.u_speed, 0.0009);

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      tX: window.innerWidth * 0.5,
      tY: window.innerHeight * 0.5,
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (uniforms.u_ratio) {
        gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    window.addEventListener("pointermove", (e) => {
      pointer.tX = e.clientX;
      pointer.tY = e.clientY;
    });

    window.addEventListener("touchmove", (e) => {
      if (e.targetTouches[0]) {
        pointer.tX = e.targetTouches[0].clientX;
        pointer.tY = e.targetTouches[0].clientY;
      }
    });

    const render = () => {
      pointer.x += (pointer.tX - pointer.x) * 0.15;
      pointer.y += (pointer.tY - pointer.y) * 0.15;

      gl.uniform1f(uniforms.u_time, performance.now());
      if (uniforms.u_pointer_position) {
        gl.uniform2f(
          uniforms.u_pointer_position,
          pointer.x / window.innerWidth,
          1 - pointer.y / window.innerHeight
        );
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    };

    render();
  };

  initNeuralNoise();

  /* ---------- 21st.dev spotlight tracker ---------- */

  const heroSection = document.querySelector(".hero");
  const spotlightEl = document.querySelector(".spotlight");

  if (heroSection && spotlightEl && finePointer && !reduceMotion) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isInside = false;

    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (!isInside) {
        isInside = true;
        currentX = mouseX;
        currentY = mouseY;
        spotlightEl.style.opacity = "1";
      }
    });

    heroSection.addEventListener("mouseleave", () => {
      isInside = false;
      spotlightEl.style.opacity = "0";
    });

    const loop = () => {
      if (isInside) {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
        spotlightEl.style.left = `${currentX}px`;
        spotlightEl.style.top = `${currentY}px`;
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

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

  /* ---------- remove Built with Spline watermark ---------- */

  const cleanSplineLogo = () => {
    const viewer = document.querySelector("spline-viewer");
    if (!viewer) return;

    const checkAndRemove = () => {
      if (viewer.shadowRoot) {
        const logo =
          viewer.shadowRoot.querySelector("#logo") ||
          viewer.shadowRoot.querySelector("a[href*='spline.design']") ||
          viewer.shadowRoot.querySelector("a");
        if (logo) {
          logo.remove();
          return true;
        }
      }
      return false;
    };

    if (!checkAndRemove()) {
      const interval = setInterval(() => {
        if (checkAndRemove()) {
          clearInterval(interval);
        }
      }, 50);

      viewer.addEventListener("load-complete", () => {
        checkAndRemove();
        clearInterval(interval);
      });

      setTimeout(() => clearInterval(interval), 8000);
    }
  };

  cleanSplineLogo();
})();
