/* ============================================================================
   MartinezTech — home: cursos destacados.
   ========================================================================== */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_COURSES || !window.MT_UI) return;
    var featured = window.MT_COURSES.filter(function (c) { return c.featured; }).slice(0, 3);
    window.MT_UI.renderGrid("featured-courses", featured);
  });
})();
