/* ============================================================================
   MartinezTech — cuentas e inscripciones (MAQUETA).
   Todo se guarda en localStorage, en el navegador del propio usuario.
   Esto NO es un sistema de autenticación real: no hay servidor, ni cifrado
   serio, ni recuperación de contraseña. Sirve para mostrar el flujo completo
   (registro → login → compra → "mis cursos") mientras se define el backend
   definitivo (base de datos + pasarela de pago real).
   ========================================================================== */
window.MT_AUTH = (function () {
  var USERS_KEY = "mt_users";
  var SESSION_KEY = "mt_session";
  var ENROLL_KEY = "mt_enrollments";

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return readJSON(USERS_KEY, []);
  }

  function findUser(email) {
    var users = getUsers();
    var normalized = String(email || "").trim().toLowerCase();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === normalized) return users[i];
    }
    return null;
  }

  function register(data) {
    var name = String(data.name || "").trim();
    var email = String(data.email || "").trim().toLowerCase();
    var password = String(data.password || "");

    if (!name) return { ok: false, error: "Ingresá tu nombre." };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Ingresá un email válido." };
    if (password.length < 6) return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
    if (findUser(email)) return { ok: false, error: "Ya existe una cuenta con ese email." };

    var users = getUsers();
    users.push({ name: name, email: email, password: password, createdAt: new Date().toISOString() });
    writeJSON(USERS_KEY, users);
    localStorage.setItem(SESSION_KEY, email);
    return { ok: true };
  }

  function login(email, password) {
    var user = findUser(email);
    if (!user || user.password !== String(password || "")) {
      return { ok: false, error: "Email o contraseña incorrectos." };
    }
    localStorage.setItem(SESSION_KEY, user.email);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getCurrentUser() {
    var email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    return findUser(email);
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function getEnrollments(email) {
    var all = readJSON(ENROLL_KEY, {});
    return all[email.toLowerCase()] || [];
  }

  function enroll(email, slug) {
    var normalized = email.toLowerCase();
    var all = readJSON(ENROLL_KEY, {});
    if (!all[normalized]) all[normalized] = [];
    if (all[normalized].indexOf(slug) === -1) all[normalized].push(slug);
    writeJSON(ENROLL_KEY, all);
  }

  function isEnrolled(email, slug) {
    return getEnrollments(email).indexOf(slug) !== -1;
  }

  return {
    register: register,
    login: login,
    logout: logout,
    getCurrentUser: getCurrentUser,
    isLoggedIn: isLoggedIn,
    enroll: enroll,
    getEnrollments: getEnrollments,
    isEnrolled: isEnrolled,
  };
})();
