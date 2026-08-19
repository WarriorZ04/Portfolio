/* ============================================================================
   MartinezTech — página de confirmación de inscripción.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_UI) return;
    var slug = new URLSearchParams(window.location.search).get("curso");
    var course = slug ? window.MT_UI.getCourseBySlug(slug) : null;
    if (!course) return;

    document.getElementById("confirm-title").textContent = "¡Listo, ya estás inscripto!";
    document.getElementById("confirm-text").textContent =
      'Confirmamos tu inscripción en "' + course.title + '". Ya podés verlo en Mi cuenta.';
  });
})();
