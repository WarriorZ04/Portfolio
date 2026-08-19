/* ============================================================================
   MartinezTech — panel de cuenta (requiere sesión iniciada).
   ========================================================================== */
(function () {
  "use strict";

  function enrolledCardHTML(course) {
    return (
      '<article class="glass-card course-card">' +
        window.MT_UI.placeholder("", course.icon, "Imagen del curso") +
        '<div class="course-card-top">' +
          '<span class="badge badge-ok">Comprado</span>' +
          '<span class="badge ' + window.MT_UI.levelBadgeClass(course.level) + '">' + course.level + "</span>" +
        "</div>" +
        "<h3>" + course.title + "</h3>" +
        '<p class="tagline">' + course.tagline + "</p>" +
        '<a href="curso.html?curso=' + course.slug + '" class="btn btn-outline">Ver curso</a>' +
      "</article>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_AUTH) return;
    var user = window.MT_AUTH.getCurrentUser();

    if (!user) {
      document.getElementById("account-guest").style.display = "block";
      return;
    }

    document.getElementById("account-content").style.display = "block";
    document.getElementById("account-name").textContent = user.name;
    document.getElementById("account-email").textContent = user.email;
    document.getElementById("account-initials").textContent = user.name.trim().charAt(0).toUpperCase();

    var slugs = window.MT_AUTH.getEnrollments(user.email);
    var courses = slugs.map(window.MT_UI.getCourseBySlug).filter(Boolean);
    var grid = document.getElementById("enrolled-courses");

    if (!courses.length) {
      document.getElementById("enrolled-empty").style.display = "block";
      return;
    }
    grid.innerHTML = courses.map(enrolledCardHTML).join("");
  });
})();
