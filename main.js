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

  /* ---------- Scene: snow (canvas) + scroll-driven scrim ---------- */

  // Nieve generada por código: no tiene loop ni corte, cada copo cae, sale por
  // abajo y reaparece arriba a su propio ritmo. Tres capas de profundidad.
  function initSnow() {
    var canvas = $("[data-snow]");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cantidad por capa para una pantalla de 1920x1080 (se escala por área)
    var LAYERS = [
      { n: 150, size: [0.7, 1.4],  speed: [22, 42],   alpha: 0.42, sway: 6,  z: 0.35 }, // lejos
      { n: 90,  size: [1.4, 2.6],  speed: [48, 84],   alpha: 0.66, sway: 12, z: 0.7  }, // medio
      { n: 26,  size: [3.2, 6.5],  speed: [110, 190], alpha: 0.85, sway: 22, z: 1.15 }  // cerca (desenfocado)
    ];
    var density = reduced ? 0.45 : 1;   // con "reducir movimiento": menos y más lenta
    var speedScale = reduced ? 0.45 : 1;

    // Sprite de un copo suave (círculo con borde difuso), reutilizado por todos
    var sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    var sctx = sprite.getContext("2d");
    var g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(240,247,255,0.85)");
    g.addColorStop(1, "rgba(235,244,255,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    var W = 0, H = 0, dpr = 1, flakes = [];
    var rand = function (a, b) { return a + Math.random() * (b - a); };

    function spawn(layer, anywhere) {
      return {
        x: rand(0, W),
        y: anywhere ? rand(0, H) : rand(-30, -4),
        r: rand(layer.size[0], layer.size[1]),
        vy: rand(layer.speed[0], layer.speed[1]) * speedScale,
        a: layer.alpha * rand(0.65, 1),
        ph: rand(0, Math.PI * 2),
        sf: rand(0.4, 1.1),
        layer: layer
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var areaScale = (W * H) / (1920 * 1080);
      flakes = [];
      LAYERS.forEach(function (layer) {
        var count = Math.max(8, Math.round(layer.n * areaScale * density));
        for (var i = 0; i < count; i++) flakes.push(spawn(layer, true));
      });
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      var t = now / 1000;
      // Viento: brisa constante que se va y viene, con ráfagas lentas
      var wind = (30 + 22 * Math.sin(t * 0.23) + 14 * Math.sin(t * 0.71 + 1.3)) * speedScale;

      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i], L = f.layer;
        f.y += f.vy * dt;
        f.x += (wind * L.z + Math.sin(t * f.sf + f.ph) * L.sway) * dt;
        if (f.y - f.r > H) { flakes[i] = f = spawn(L, false); }
        if (f.x - f.r > W) f.x = -f.r;
        else if (f.x + f.r < 0) f.x = W + f.r;
        var s = f.r * 2;
        ctx.globalAlpha = f.a;
        ctx.drawImage(sprite, f.x - f.r, f.y - f.r, s, s);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize();
    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });
    requestAnimationFrame(frame);
  }

  // Velo del fondo: 0 arriba de todo (se ve la montaña) → 1 al bajar al contenido
  function initScrim() {
    var root = document.documentElement;
    var ticking = false;
    var update = function () {
      var p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.85)));
      root.style.setProperty("--scrim", p.toFixed(3));
      ticking = false;
    };
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
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
    safe(initSnow, "initSnow");
    safe(initScrim, "initScrim");
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
