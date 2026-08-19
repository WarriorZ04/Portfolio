/* ==========================================================
   Datos del sitio — editá este archivo para actualizar textos,
   proyectos y juegos sin tocar el HTML ni el JS.
   ========================================================== */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Ivan Martinez",
    role: "Desarrollador web · Game developer",

    heroLines: ["Hola, soy", "Ivan Martinez."],
    heroSub:
      "Diseñador de páginas web y videojuegos. Este es el índice de lo que voy haciendo.",

    // Editá este texto por tu propia presentación.
    about:
      "Diseño y desarrollo sitios web para negocios, profesionales y empresas. En paralelo, desarrollo videojuegos de forma independiente — por eso en esta página vas a encontrar un poco de todo mi trabajo.",

    contact: {
      email: "agusmartinez76@gmail.com",
    },

    // Páginas web que fuiste creando. "url" apunta a la copia
    // incluida dentro de esta misma carpeta (proyectos/...).
    projects: [
      {
        id: "aranda-vega-abogados",
        title: "Aranda & Vega Abogados",
        tag: "Estudio jurídico",
        description:
          "Sitio para un estudio jurídico en Buenos Aires con 16 años de trayectoria en derecho civil, laboral, familia, penal, comercial e inmobiliario. Primera consulta sin cargo.",
        url: "proyectos/aranda-vega-abogados/index.html",
        year: "2026",
      },
      {
        id: "motorepuestos-martinez",
        title: "Motorepuestos Martinez",
        tag: "Negocio local",
        description:
          "Repuestos de moto y taller de mecánica en Manuel Alberti. Service, frenos, transmisión, motor y contacto directo por WhatsApp.",
        url: "proyectos/motorepuestos-martinez/index.html",
        year: "2026",
      },
      {
        id: "martinez-tech-cursos",
        title: "MartinezTech — Cursos",
        tag: "Plataforma de cursos",
        description:
          "Cursos online y presenciales de reparación de computadoras: diagnóstico, notebooks, fuentes, microsoldadura y más.",
        url: "proyectos/martinez-tech-cursos/index.html",
        year: "2026",
      },
    ],

    // Minijuegos. status: "live" (jugable ahora) o "soon" (próximamente).
    games: [
      {
        id: "prairie-blaster",
        title: "Prairie Blaster",
        tag: "Arcade · Shooter",
        description:
          "Top-down shooter infinito. Sobrevivís oleadas de enemigos, cada 500 puntos aparece un jefe.",
        url: "proyectos/motorepuestos-martinez/juego/index.html",
        status: "live",
      },
      {
        id: "soon-1",
        title: "Próximo juego",
        tag: "En desarrollo",
        description: "Todavía se está cocinando. Volvé pronto.",
        url: "",
        status: "soon",
      },
      {
        id: "soon-2",
        title: "Próximo juego",
        tag: "En desarrollo",
        description: "Hay otra idea en camino para esta casilla.",
        url: "",
        status: "soon",
      },
    ],
  };
})();
