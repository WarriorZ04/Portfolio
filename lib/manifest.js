/* ==========================================================
   Datos del sitio — editá este archivo para actualizar textos,
   proyectos y juegos sin tocar el HTML ni el JS.
   ========================================================== */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Ivan Martinez",
    role: "Desarrollador web · Game developer",

    heroLines: ["Hola! soy", "Ivan Martinez."],
    heroSub:
      "Desarrollador de webs, software y videojuegos. Acá vas a poder ver algunos de mis proyectos.",

    // Editá este texto por tu propia presentación.
    about:
      "Diseño y desarrollo sitios web para negocios, profesionales y empresas. También desarrollo aplicaciones y videojuegos, aunque no estén todas acá, podés consultarme para que desarrolle la app que necesites.",

    contact: {
      email: "agusmartinez76@gmail.com",
    },

    // Páginas web que fuiste creando. "url" apunta a la copia
    // incluida dentro de esta misma carpeta (proyectos/...).
    projects: [
      {
        id: "kairo-saas-landing",
        title: "Kairo",
        tag: "Landing SaaS",
        description:
          "Landing para un SaaS de planificación del tiempo: protege las horas de foco, ordena los rituales del equipo y permite agendar una consulta de 30 minutos.",
        url: "proyectos/kairo-saas-landing/index.html",
        year: "2026",
      },
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
        url: "games/prairie-blaster/index.html",
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
