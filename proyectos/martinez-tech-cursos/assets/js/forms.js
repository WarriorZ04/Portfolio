/* ============================================================================
   MartinezTech — formularios de registro / login.
   ========================================================================== */
(function () {
  "use strict";

  function showError(message) {
    var errorEl = document.getElementById("form-error");
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var redirect = new URLSearchParams(window.location.search).get("redirect");
    var loginLink = document.getElementById("login-link");
    var registerLink = document.getElementById("register-link");
    if (redirect) {
      if (loginLink) loginLink.href = "login.html?redirect=" + encodeURIComponent(redirect);
      if (registerLink) registerLink.href = "registro.html?redirect=" + encodeURIComponent(redirect);
    }

    var registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("form-error").classList.remove("is-visible");

        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;
        var password2 = document.getElementById("password2").value;

        if (password !== password2) {
          showError("Las contraseñas no coinciden.");
          return;
        }
        var result = window.MT_AUTH.register({ name: name, email: email, password: password });
        if (!result.ok) {
          showError(result.error);
          return;
        }
        window.location.href = redirect || "mi-cuenta.html";
      });
    }

    var loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("form-error").classList.remove("is-visible");

        var email = document.getElementById("email").value;
        var password = document.getElementById("password").value;

        var result = window.MT_AUTH.login(email, password);
        if (!result.ok) {
          showError(result.error);
          return;
        }
        window.location.href = redirect || "mi-cuenta.html";
      });
    }
  });
})();
