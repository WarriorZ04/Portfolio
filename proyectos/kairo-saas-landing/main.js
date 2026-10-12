(function () {
  "use strict";

  var data = window.__KAIRO__ || {};
  var canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  function safe(fn, name) {
    try { fn(); } catch (err) { console.warn("[kairo] " + name + " failed:", err); }
  }

  function escHTML(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- Nav: scrolled state, hide on scroll down, mobile sheet ---------- */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    var burger = nav.querySelector("[data-burger]");
    var lastY = scrollY;

    function onScroll() {
      var y = scrollY;
      nav.classList.toggle("is-scrolled", y > 24);
      if (!nav.classList.contains("is-open")) {
        nav.classList.toggle("is-hidden", y > lastY && y > 600);
      }
      lastY = y;
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function close() {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__sheet a").forEach(function (a) { a.addEventListener("click", close); });
    addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---------- Anchor scroll with nav offset ---------- */
  function initAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = id === "#top" ? document.body : document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = id === "#top" ? 0 : el.getBoundingClientRect().top + scrollY - 80;
      window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ---------- Hero: split headline words ---------- */
  function initSplit() {
    var el = document.querySelector(".hero__title[data-split]");
    if (!el || el.classList.contains("is-split")) return;
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));
    var i = 0;
    function wrap(text) {
      return text.split(/(\s+)/).map(function (w) {
        if (!w) return "";
        if (/^\s+$/.test(w)) return " ";
        return '<span class="split-word" aria-hidden="true" style="--i:' + (i++) + '">' + escHTML(w) + "</span>";
      }).join("");
    }
    var html = Array.prototype.map.call(el.childNodes, function (node) {
      if (node.nodeType === 3) return wrap(node.textContent);
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + wrap(node.textContent) + "</" + tag + ">";
      }
      return "";
    }).join("");
    el.innerHTML = html;
    el.classList.add("is-split");
  }

  /* ---------- Hero: mouse-reactive gradient mesh ---------- */
  function initMesh() {
    var hero = document.querySelector("[data-hero]");
    var mesh = document.querySelector("[data-mesh]");
    if (!hero || !mesh) return;
    var tx = 50, ty = 30, x = 50, y = 30, t = 0, running = true;

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100 * 0.8;
    });

    // Pause when hero leaves the viewport
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
      if (running) requestAnimationFrame(tick);
    }, { threshold: 0 }).observe(hero);

    function tick() {
      if (!running) return;
      t += 0.004;
      // idle drift so touch devices also get movement
      var ix = canHover ? 0 : Math.sin(t * 2) * 18;
      var iy = canHover ? 0 : Math.cos(t * 1.6) * 10;
      x += (tx + ix - x) * 0.06;
      y += (ty + iy - y) * 0.06;
      mesh.style.setProperty("--mx", x.toFixed(2) + "%");
      mesh.style.setProperty("--my", y.toFixed(2) + "%");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Focus ring countdown in the mockup ---------- */
  function initTimer() {
    var out = document.querySelector("[data-timer]");
    var ring = document.querySelector("[data-ring]");
    if (!out || !ring) return;
    var fs = data.focusSession || { totalSeconds: 3600, remainingSeconds: 2538 };
    var total = fs.totalSeconds, left = fs.remainingSeconds;
    var C = 2 * Math.PI * 52;
    function paint() {
      var m = Math.floor(left / 60), s = left % 60;
      out.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
      ring.style.strokeDashoffset = (C * (1 - left / total)).toFixed(1);
    }
    paint();
    setInterval(function () { left = left > 0 ? left - 1 : total; paint(); }, 1000);
  }

  /* ---------- Mockup 3D tilt that flattens on scroll ---------- */
  function initMockTilt() {
    var mock = document.querySelector("[data-mock]");
    if (!mock || !hasGsap) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(mock,
      { rotateX: 22, scale: 0.9, y: 0 },
      {
        rotateX: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: "[data-mock-stage]", start: "top 92%", end: "top 18%", scrub: 0.6 }
      });
    gsap.to(".float--a", { y: -70, ease: "none", scrollTrigger: { trigger: "[data-mock-stage]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.to(".float--b", { y: -130, ease: "none", scrollTrigger: { trigger: "[data-mock-stage]", start: "top bottom", end: "bottom top", scrub: true } });
  }

  /* ---------- Manifesto: word-by-word light-up on scroll ---------- */
  function initWords() {
    var el = document.querySelector("[data-words]");
    if (!el || el.dataset.wordsBound) return;
    el.dataset.wordsBound = "1";
    var text = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map(function (w) {
      var hi = /^(Kairo|sí:|plan)/.test(w) ? " style=\"color:var(--accent)\"" : "";
      return '<span class="w" aria-hidden="true"' + hi + ">" + escHTML(w) + "</span>";
    }).join(" ");
    if (!hasGsap) return; // words stay fully visible
    var words = el.querySelectorAll(".w");
    gsap.fromTo(words, { opacity: 0.14 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.5 }
    });
  }

  /* ---------- Image parallax ---------- */
  function initParallax() {
    if (!hasGsap) return;
    document.querySelectorAll("[data-parallax]").forEach(function (img) {
      var box = img.parentElement;
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- Reveal on scroll (+ 6s safety) ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    // stagger siblings
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.hasAttribute("data-reveal"); });
      var idx = sibs.indexOf(el);
      if (idx > 0) el.style.setProperty("--d", Math.min(idx * 0.08, 0.4) + "s");
    });
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    items.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------- Count-up stats ---------- */
  function initCount() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var fmt = function (n, d) {
      return n.toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: n >= 10000 });
    };
    var run = function (el) {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      var end = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || "0", 10);
      var dur = 1800, t0 = performance.now();
      (function step(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(end * eased, d);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = fmt(end, d);
      })(t0);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Spotlight cards (cursor glow) ---------- */
  function initSpotlight() {
    if (!canHover) return;
    document.querySelectorAll("[data-spot]").forEach(function (card) {
      if (card.dataset.spotBound) return;
      card.dataset.spotBound = "1";
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--x", (e.clientX - r.left) + "px");
        card.style.setProperty("--y", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!canHover) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.28 + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- Contact form (front-end demo) ---------- */
  function initForm() {
    var form = document.querySelector("[data-form]");
    if (!form) return;
    var ok = form.querySelector(".form__ok");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("input[required]").forEach(function (input) {
        var field = input.closest(".field");
        var good = input.value.trim() !== "" && (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
        field.classList.toggle("is-invalid", !good);
        if (!good && valid) { input.focus(); valid = false; }
      });
      if (!valid) return;
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.firstChild.textContent = "Reservando… ";
      setTimeout(function () {
        ok.hidden = false;
        form.reset();
        btn.disabled = false;
        btn.firstChild.textContent = "Reservar mi consulta ";
      }, 900);
    });
    form.addEventListener("input", function (e) {
      var f = e.target.closest(".field");
      if (f) f.classList.remove("is-invalid");
    });
  }

  function boot() {
    safe(initNav, "nav");
    safe(initAnchors, "anchors");
    safe(initSplit, "split");
    safe(initMesh, "mesh");
    safe(initTimer, "timer");
    safe(initReveal, "reveal");
    safe(initCount, "count");
    safe(initSpotlight, "spotlight");
    safe(initMagnetic, "magnetic");
    safe(initForm, "form");
    safe(initMockTilt, "mockTilt");
    safe(initWords, "words");
    safe(initParallax, "parallax");
    if (hasGsap) addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
