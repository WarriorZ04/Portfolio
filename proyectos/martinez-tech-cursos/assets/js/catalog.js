/* ============================================================================
   MartinezTech — catálogo con filtro por nivel.
   ========================================================================== */
(function () {
  "use strict";

  function renderList(courses) {
    var el = document.getElementById("all-courses");
    if (!el) return;
    if (!courses.length) {
      el.innerHTML = '<p class="empty-state">No hay cursos que coincidan con este filtro.</p>';
      return;
    }
    el.innerHTML = courses.map(window.MT_UI.courseCardHTML).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_COURSES || !window.MT_UI) return;
    var all = window.MT_COURSES;
    var chips = document.querySelectorAll("[data-filter]");

    renderList(all);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var level = chip.getAttribute("data-filter");
        var filtered = level === "Todos" ? all : all.filter(function (c) { return c.level === level; });
        renderList(filtered);
      });
    });
  });
})();
