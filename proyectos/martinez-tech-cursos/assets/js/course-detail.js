/* ============================================================================
   MartinezTech — detalle de curso (?curso=slug).
   ========================================================================== */
(function () {
  "use strict";

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function listItems(containerId, items) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items
      .map(function (text) {
        return "<li>" + window.MT_UI.ICONS.check + "<span>" + text + "</span></li>";
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_UI || !window.MT_COURSES) return;
    var slug = getParam("curso");
    var course = slug ? window.MT_UI.getCourseBySlug(slug) : null;

    if (!course) {
      document.getElementById("course-content").style.display = "none";
      document.getElementById("course-not-found").style.display = "block";
      return;
    }

    document.getElementById("page-title").textContent = course.title + " — MartinezTech";
    document.getElementById("course-breadcrumb").textContent = course.title;
    document.getElementById("course-title").textContent = course.title;
    document.getElementById("course-tagline").textContent = course.tagline;

    document.getElementById("course-image").innerHTML =
      (window.MT_UI.ICONS[course.icon] || window.MT_UI.ICONS.image) + "<span>Imagen del curso</span>";

    document.getElementById("course-badges").innerHTML =
      '<span class="badge ' + window.MT_UI.levelBadgeClass(course.level) + '">' + course.level + "</span>" +
      '<span class="badge badge-neutral">' + course.modality + "</span>" +
      (course.bundle ? '<span class="badge badge-warn">Programa completo</span>' : "");

    document.getElementById("course-meta").innerHTML =
      "<span>" + window.MT_UI.ICONS.clock + course.durationWeeks + " semanas · " + course.durationHours + " horas totales</span>" +
      "<span>" + window.MT_UI.ICONS.monitor + course.modality + "</span>";

    listItems("course-syllabus", course.syllabus);
    listItems("course-requirements", course.requirements);
    listItems("course-includes", course.includes);

    document.getElementById("buy-price").textContent = window.MT_UI.formatPrice(course.price);
    document.getElementById("buy-old-price").innerHTML = course.priceOld
      ? '<span class="course-price-old">' + window.MT_UI.formatPrice(course.priceOld) + "</span>"
      : "";

    var buyCta = document.getElementById("buy-cta");
    var buyNote = document.getElementById("buy-note");
    var user = window.MT_AUTH ? window.MT_AUTH.getCurrentUser() : null;

    if (user && window.MT_AUTH.isEnrolled(user.email, course.slug)) {
      buyCta.textContent = "Ya estás inscripto — Ir a mi cuenta";
      buyCta.href = "mi-cuenta.html";
      buyNote.textContent = "";
    } else if (user) {
      buyCta.textContent = "Inscribirme ahora";
      buyCta.href = "pago.html?curso=" + encodeURIComponent(course.slug);
      buyNote.textContent = "Vas a completar el pago en el siguiente paso.";
    } else {
      buyCta.textContent = "Iniciar sesión para inscribirme";
      buyCta.href = "login.html?redirect=" + encodeURIComponent("pago.html?curso=" + course.slug);
      buyNote.textContent = "Necesitás una cuenta para inscribirte — es gratis crearla.";
    }
  });
})();
