(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Motorepuestos Martinez",
    shortName: "MM",
    tagline: "Repuestos y mecánica de motos",
    foundedNote: "Barrio Manuel Alberti",

    contact: {
      phoneDisplay: "11 7600-3545",
      phoneTel: "+541176003545",
      whatsapp: "https://wa.me/5491176003545?text=" + encodeURIComponent("Hola! Quería consultar sobre un repuesto / turno de taller."),
      address: "General Mitre 1311, Manuel Alberti",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("General Mitre 1311, Manuel Alberti, Buenos Aires"),
      mapsEmbed: "https://maps.google.com/maps?q=" + encodeURIComponent("General Mitre 1311, Manuel Alberti, Buenos Aires") + "&z=16&output=embed",
      instagram: "https://www.instagram.com/motorepuestos.martinez",
      instagramHandle: "@motorepuestos.martinez",
      hours: [
        { day: "Lunes a viernes", time: "09:00–13:00 y 15:00–19:00" },
        { day: "Sábados", time: "09:00–13:00" }
      ]
    },

    services: [
      {
        id: "s-service",
        name: "Service y mantenimiento",
        desc: "Afinación general, cambio de aceite y filtros, revisión completa antes de un viaje largo."
      },
      {
        id: "s-motor",
        name: "Motor y carburación",
        desc: "Diagnóstico de fallas, puesta a punto de carburador / inyección, reparación de motor."
      },
      {
        id: "s-frenos",
        name: "Frenos",
        desc: "Cambio de pastillas y cables, purgado de sistema hidráulico, ajuste de freno a tambor."
      },
      {
        id: "s-transmision",
        name: "Transmisión y cadena",
        desc: "Cambio de kit de arrastre, tensado y lubricación de cadena, embrague."
      },
      {
        id: "s-electrico",
        name: "Sistema eléctrico",
        desc: "Batería, luces, tablero, arranque — diagnóstico y reparación de instalación eléctrica."
      },
      {
        id: "s-rodado",
        name: "Cubiertas y ruedas",
        desc: "Cambio de cubiertas, balanceo, rayos y llantas, alineación."
      }
    ],

    catalog: [
      {
        id: "p-001",
        name: "Pastillas de freno",
        category: "Frenos",
        spec: "Delantera / trasera · sinterizadas",
        icon: "brake"
      },
      {
        id: "p-002",
        name: "Cadena de transmisión",
        category: "Transmisión",
        spec: "428H / 520 · reforzada",
        icon: "chain"
      },
      {
        id: "p-003",
        name: "Kit de arrastre",
        category: "Transmisión",
        spec: "Piñón + corona + cadena",
        icon: "sprocket"
      },
      {
        id: "p-004",
        name: "Filtro de aire",
        category: "Motor",
        spec: "Esponja / papel · según modelo",
        icon: "filter"
      },
      {
        id: "p-005",
        name: "Aceite de motor 4T",
        category: "Motor",
        spec: "Semisintético 20W50 · 1L",
        icon: "oil"
      },
      {
        id: "p-006",
        name: "Bujía de encendido",
        category: "Motor",
        spec: "Estándar / iridium",
        icon: "spark"
      },
      {
        id: "p-007",
        name: "Batería 12V sellada",
        category: "Eléctrico",
        spec: "Libre de mantenimiento",
        icon: "battery"
      },
      {
        id: "p-008",
        name: "Cubierta reforzada",
        category: "Rodado",
        spec: "Medidas comunes en stock",
        icon: "tire"
      }
    ]
  };
})();
