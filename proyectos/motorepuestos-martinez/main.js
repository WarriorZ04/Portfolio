(function () {
  "use strict";

  var data = window.__BRAND__ || {};

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-nav-mobile]");
    if (!toggle || !menu) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      menu.setAttribute("data-open", "false");
      menu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function open() {
      toggle.setAttribute("aria-expanded", "true");
      menu.setAttribute("data-open", "true");
      menu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) close(); else open();
    });

    $$(".nav-mobile-link", menu).forEach(function (link) {
      link.addEventListener("click", close);
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  function initSmoothAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 76;
      var top = el.getBoundingClientRect().top + window.scrollY - (navH - 4);
      window.scrollTo({
        top: top,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  }

  function initReveals() {
    var els = $$("[data-reveal]");
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
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  function initMarquee() {
    var track = $("[data-marquee]");
    if (!track) return;
    var clone = track.cloneNode(true);
    clone.removeAttribute("data-marquee");
    clone.setAttribute("aria-hidden", "true");
    track.parentNode.appendChild(clone);

    if (window.gsap) {
      var distance = track.scrollWidth;
      var speed = 55; // px/sec
      window.gsap.to([track, clone], {
        x: -distance,
        duration: distance / speed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: window.gsap.utils.unitize(function (x) { return parseFloat(x) % distance; })
        }
      });
    } else {
      track.parentNode.classList.add("marquee--css-fallback");
    }
  }

  function initFooterYear() {
    var el = $("[data-year]");
    if (!el) return;
    el.textContent = new Date().getFullYear();
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMobileMenu, "initMobileMenu");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals, "initReveals");
    safe(initFooterYear, "initFooterYear");
    if (window.gsap && window.ScrollTrigger) {
      try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (_) {}
    }
    safe(initMarquee, "initMarquee");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
