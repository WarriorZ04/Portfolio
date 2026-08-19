/* ============================================================================
   MartinezTech — helpers de UI para renderizar cursos (cards, precios, iconos).
   ========================================================================== */
window.MT_UI = (function () {
  var ICONS = {
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="7" y="7" width="10" height="10" rx="1.5"/><rect x="3" y="10" width="2" height="4"/><rect x="19" y="10" width="2" height="4"/><rect x="10" y="3" width="4" height="2"/><rect x="10" y="19" width="4" height="2"/></svg>',
    laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="5" width="16" height="10" rx="1"/><path d="M2 19h20"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8z"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/></svg>',
    network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2v4M9.7 15.8 12 11.5l2.3 4.3"/></svg>',
    graduation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m2 8 10-5 10 5-10 5-10-5Z"/><path d="M6 10.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5-9 9"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.6-4 5-6 8-6s6.4 2 8 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 13l4 4L19 7"/></svg>',
  };

  function formatPrice(value) {
    try {
      return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
    } catch (e) {
      return "$" + value;
    }
  }

  function levelBadgeClass(level) {
    if (level === "Inicial") return "badge-ok";
    if (level === "Intermedio") return "badge-warn";
    if (level === "Avanzado") return "badge-danger";
    return "badge-neutral";
  }

  function placeholder(className, iconKey, label) {
    return (
      '<div class="img-placeholder ' + (className || "") + '">' +
      (ICONS[iconKey] || ICONS.image) +
      "<span>" + label + "</span>" +
      "</div>"
    );
  }

  function courseCardHTML(course) {
    var oldPrice = course.priceOld
      ? '<span class="course-price-old">' + formatPrice(course.priceOld) + "</span>"
      : "";
    return (
      '<article class="glass-card course-card reveal">' +
        placeholder("", course.icon, "Imagen del curso") +
        '<div class="course-card-top">' +
          '<span class="badge ' + levelBadgeClass(course.level) + '">' + course.level + "</span>" +
          (course.bundle ? '<span class="badge badge-warn">Programa completo</span>' : "") +
        "</div>" +
        "<h3>" + course.title + "</h3>" +
        '<p class="tagline">' + course.tagline + "</p>" +
        '<div class="course-meta">' +
          "<span>" + ICONS.clock + course.durationWeeks + " semanas · " + course.durationHours + " hs</span>" +
          "<span>" + ICONS.monitor + course.modality + "</span>" +
        "</div>" +
        '<div class="course-price-row"><div>' + oldPrice + '<span class="course-price">' + formatPrice(course.price) + "</span></div></div>" +
        '<a href="curso.html?curso=' + course.slug + '" class="btn btn-primary">Ver curso</a>' +
      "</article>"
    );
  }

  function renderGrid(containerId, courses) {
    var el = document.getElementById(containerId);
    if (!el || el.children.length > 0) return;
    if (!courses.length) {
      el.innerHTML = '<p class="empty-state">No hay cursos que coincidan con este filtro.</p>';
      return;
    }
    el.innerHTML = courses.map(courseCardHTML).join("");
  }

  function getCourseBySlug(slug) {
    return (window.MT_COURSES || []).find(function (c) { return c.slug === slug; }) || null;
  }

  return {
    ICONS: ICONS,
    formatPrice: formatPrice,
    levelBadgeClass: levelBadgeClass,
    placeholder: placeholder,
    courseCardHTML: courseCardHTML,
    renderGrid: renderGrid,
    getCourseBySlug: getCourseBySlug,
  };
})();
