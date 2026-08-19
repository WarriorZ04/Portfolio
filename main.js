(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---------- Mounts (idempotent) ---------- */

  function mountProjects() {
    var target = $("[data-projects]");
    if (!target || target.children.length > 0 || !data.projects) return;
    target.innerHTML = data.projects.map(function (p, i) {
      var num = String(i + 1).padStart(2, "0");
      return (
        '<a class="project-row" href="' + escHTML(p.url) + '" target="_blank" rel="noopener">' +
          '<span class="project-num">' + num + "</span>" +
          '<div class="project-main">' +
            '<h3 class="project-title">' + escHTML(p.title) + '<span class="project-tag">' + escHTML(p.tag) + "</span></h3>" +
            '<p class="project-desc">' + escHTML(p.description) + "</p>" +
          "</div>" +
          '<div class="project-meta">' +
            "<span>" + escHTML(p.year) + "</span>" +
            '<span class="project-link">Ver sitio ' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
            "</span>" +
          "</div>" +
        "</a>"
      );
    }).join("");
  }

  function mountGames() {
    var target = $("[data-games]");
    if (!target || target.children.length > 0 || !data.games) return;
    target.innerHTML = data.games.map(function (g) {
      var isLive = g.status === "live";
      var tag = isLive ? "article" : "article";
      var cls = "game-card " + (isLive ? "is-live" : "is-soon");
      var statusLabel = isLive ? "Disponible ahora" : "Próximamente";
      var cta = isLive ? "Jugar ahora →" : "Todavía no";
      return (
        "<" + tag + ' class="' + cls + '"' + (isLive ? ' data-game-open="' + escHTML(g.id) + '" tabindex="0" role="button" aria-label="Jugar ' + escHTML(g.title) + '"' : "") + ">" +
          '<span class="game-status' + (isLive ? " is-live" : "") + '">' + statusLabel + "</span>" +
          '<h3 class="game-title">' + escHTML(g.title) + "</h3>" +
          '<p class="game-tag">' + escHTML(g.tag) + "</p>" +
          '<p class="game-desc">' + escHTML(g.description) + "</p>" +
          '<span class="game-cta">' + cta + "</span>" +
        "</" + tag + ">"
      );
    }).join("");

    $$("[data-game-open]", target).forEach(function (card) {
      card.addEventListener("click", function () { openGameModal(card.dataset.gameOpen); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGameModal(card.dataset.gameOpen); }
      });
    });
  }

  /* ---------- Nav ---------- */

  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Smooth anchor scroll (native, offset for fixed nav) ---------- */

  function setupSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 72;
      var top = el.getBoundingClientRect().top + window.scrollY - navH + 1;
      window.scrollTo({
        top: top,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  }

  /* ---------- Mouse-reactive hero gradient ---------- */

  function initMouseGradient() {
    var hero = $("[data-mouse-gradient]");
    if (!hero || !fineHover) return;
    var raf = null;
    var section = hero.closest(".hero");
    section.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var rect = section.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--mx", x + "%");
        hero.style.setProperty("--my", y + "%");
        raf = null;
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    items.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---------- Game modal ---------- */

  function openGameModal(id) {
    var game = (data.games || []).find(function (g) { return g.id === id; });
    var modal = $("[data-game-modal]");
    if (!game || !modal || !game.url) return;
    var frame = $("[data-game-modal-frame]", modal);
    var title = $("[data-game-modal-title]", modal);
    var openLink = $("[data-game-modal-open]", modal);
    frame.src = game.url;
    title.textContent = game.title;
    openLink.href = game.url;
    if (typeof modal.showModal === "function") modal.showModal();
  }

  function initGameModal() {
    var modal = $("[data-game-modal]");
    if (!modal) return;
    var frame = $("[data-game-modal-frame]", modal);
    var closeBtn = $("[data-game-modal-close]", modal);
    var close = function () {
      modal.close();
      frame.src = "about:blank";
    };
    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      var rect = modal.getBoundingClientRect();
      var inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) close();
    });
    modal.addEventListener("cancel", function () { frame.src = "about:blank"; });
  }

  /* ---------- Boot ---------- */

  function boot() {
    safe(mountProjects, "mountProjects");
    safe(mountGames, "mountGames");
    safe(initNav, "initNav");
    safe(setupSmoothScroll, "setupSmoothScroll");
    safe(initMouseGradient, "initMouseGradient");
    safe(initReveals, "initReveals");
    safe(initGameModal, "initGameModal");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
