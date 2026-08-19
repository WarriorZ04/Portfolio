(function () {
  "use strict";

  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* ---------------- Nav ---------------- */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNav() {
    var toggle = $("[data-nav-toggle]");
    var panel = $("[data-nav-mobile]");
    if (!toggle || !panel) return;
    function close() {
      toggle.setAttribute("aria-expanded", "false");
      panel.setAttribute("data-open", "false");
    }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      panel.setAttribute("data-open", String(!open));
    });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", close); });
  }

  /* ---------------- Smooth anchors (native scroll) ---------------- */
  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = 76;
      var top = el.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({
        top: top,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }

  /* ---------------- Reveal on scroll ---------------- */
  function initReveals() {
    var els = $$("[data-reveal], [data-reveal-stagger]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed), [data-reveal-stagger]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* ---------------- Tilt + halo on practice cards ---------------- */
  function initTilt() {
    if (!fineHover) return;
    var MAX = 6;
    $$(".p-card").forEach(function (card) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      card.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      function loop() {
        cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ---------------- Count-up stats ---------------- */
  function initCountUp() {
    var els = $$("[data-count-to]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        var el = entry.target;
        var target = parseFloat(el.dataset.countTo);
        var suffix = el.dataset.suffix || "";
        var duration = 1400;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min(1, (ts - start) / duration);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------- Contact form (simulated submit) ---------------- */
  function initContactForm() {
    var form = $("[data-contact-form]");
    var success = $("[data-contact-success]");
    if (!form || !success) return;
    var submitBtn = $("[type=submit]", form);
    var msg = $("[data-contact-success-msg]", success);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending") || form.classList.contains("is-sent")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      if (submitBtn) submitBtn.disabled = true;

      setTimeout(function () {
        var nameVal = (form.elements.nombre && form.elements.nombre.value.trim()) || "";
        var firstName = nameVal.split(/\s+/)[0] || "Hola";
        if (msg) msg.textContent = firstName + ", recibimos tu consulta. Te contactaremos a la brevedad, dentro del horario de atención.";
        form.classList.remove("is-sending");
        form.classList.add("is-sent");
        success.classList.add("is-visible");
        success.setAttribute("aria-hidden", "false");
      }, 900);
    });
  }

  /* ---------------- Select "touched" state for floating label ---------------- */
  function initSelectLabels() {
    $$(".field select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        sel.classList.toggle("touched", !!sel.value);
        sel.closest(".field").classList.toggle("has-value", !!sel.value);
      });
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMobileNav, "initMobileNav");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initTilt, "initTilt");
    safe(initCountUp, "initCountUp");
    safe(initContactForm, "initContactForm");
    safe(initSelectLabels, "initSelectLabels");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
