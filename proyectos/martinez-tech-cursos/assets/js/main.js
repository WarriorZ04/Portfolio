/* ============================================================================
   MartinezTech — interacciones globales (nav, reveal, estado de sesión).
   ========================================================================== */
(function () {
  "use strict";

  function safe(fn, name) {
    try {
      fn();
    } catch (err) {
      console.error("[MartinezTech] fallo en " + name, err);
    }
  }

  function initNavToggle() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("is-open", !expanded);
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      });
    });
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    document.documentElement.classList.add("js-reveal-ready");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (item) { observer.observe(item); });

    // Red de seguridad: si algo falla, todo queda visible igual.
    setTimeout(function () {
      items.forEach(function (item) { item.classList.add("is-visible"); });
    }, 6000);
  }

  function initFooterYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  function initAuthState() {
    if (!window.MT_AUTH) return;
    var user = window.MT_AUTH.getCurrentUser();
    var guestEls = document.querySelectorAll("[data-auth-guest]");
    var userEls = document.querySelectorAll("[data-auth-user]");
    var nameEls = document.querySelectorAll("[data-auth-name]");

    guestEls.forEach(function (el) { el.style.display = user ? "none" : ""; });
    userEls.forEach(function (el) { el.style.display = user ? "" : "none"; });
    if (user) {
      nameEls.forEach(function (el) { el.textContent = user.name.split(" ")[0]; });
    }

    var logoutBtns = document.querySelectorAll("[data-logout]");
    logoutBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        window.MT_AUTH.logout();
        window.location.href = "index.html";
      });
    });
  }

  function initMeshFollow() {
    var hero = document.querySelector("[data-mesh]");
    if (!hero || window.matchMedia("(max-width: 720px)").matches) return;
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty("--mx", x + "%");
      hero.style.setProperty("--my", y + "%");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initNavToggle, "initNavToggle");
    safe(initReveal, "initReveal");
    safe(initFooterYear, "initFooterYear");
    safe(initAuthState, "initAuthState");
    safe(initMeshFollow, "initMeshFollow");
  });
})();
