/* ============================================================================
   MartinezTech — checkout (pago simulado).
   ========================================================================== */
(function () {
  "use strict";

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function showError(message) {
    var el = document.getElementById("form-error");
    el.textContent = message;
    el.classList.add("is-visible");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.MT_AUTH || !window.MT_UI) return;
    var slug = getParam("curso");
    var course = slug ? window.MT_UI.getCourseBySlug(slug) : null;
    var user = window.MT_AUTH.getCurrentUser();

    if (!user) {
      window.location.href = "login.html?redirect=" + encodeURIComponent("pago.html?curso=" + slug);
      return;
    }
    if (!course) {
      window.location.href = "cursos.html";
      return;
    }
    if (window.MT_AUTH.isEnrolled(user.email, course.slug)) {
      window.location.href = "mi-cuenta.html";
      return;
    }

    document.getElementById("pago-redirecting").style.display = "none";
    document.getElementById("pago-content").style.display = "block";
    document.getElementById("summary-title").textContent = course.title;
    document.getElementById("summary-price").textContent = window.MT_UI.formatPrice(course.price);
    document.getElementById("summary-total").textContent = window.MT_UI.formatPrice(course.price);

    document.getElementById("payment-form").addEventListener("submit", function (e) {
      e.preventDefault();
      document.getElementById("form-error").classList.remove("is-visible");

      var name = document.getElementById("card-name").value.trim();
      var number = document.getElementById("card-number").value.replace(/\s/g, "");
      var exp = document.getElementById("card-exp").value.trim();
      var cvv = document.getElementById("card-cvv").value.trim();

      if (!name) return showError("Ingresá el nombre que figura en la tarjeta.");
      if (!/^\d{13,19}$/.test(number)) return showError("Ingresá un número de tarjeta válido.");
      if (!/^\d{2}\/\d{2}$/.test(exp)) return showError("Ingresá el vencimiento en formato MM/AA.");
      if (!/^\d{3,4}$/.test(cvv)) return showError("Ingresá un CVV válido.");

      window.MT_AUTH.enroll(user.email, course.slug);
      window.location.href = "confirmacion.html?curso=" + encodeURIComponent(course.slug);
    });
  });
})();
