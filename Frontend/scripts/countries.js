// ============================================================
//  FLOAST — countries.js
//  Genera el selector de códigos de país para el teléfono.
//  Se ejecuta antes que new_user.js (orden en el HTML).
// ============================================================

const COUNTRIES = [
  { name: "México",           code: "MX", dial: "+52"  },
  { name: "Argentina",        code: "AR", dial: "+54"  },
  { name: "Bolivia",          code: "BO", dial: "+591" },
  { name: "Chile",            code: "CL", dial: "+56"  },
  { name: "Colombia",         code: "CO", dial: "+57"  },
  { name: "Costa Rica",       code: "CR", dial: "+506" },
  { name: "Cuba",             code: "CU", dial: "+53"  },
  { name: "Ecuador",          code: "EC", dial: "+593" },
  { name: "El Salvador",      code: "SV", dial: "+503" },
  { name: "España",           code: "ES", dial: "+34"  },
  { name: "Estados Unidos",   code: "US", dial: "+1"   },
  { name: "Guatemala",        code: "GT", dial: "+502" },
  { name: "Honduras",         code: "HN", dial: "+504" },
  { name: "Nicaragua",        code: "NI", dial: "+505" },
  { name: "Panamá",           code: "PA", dial: "+507" },
  { name: "Paraguay",         code: "PY", dial: "+595" },
  { name: "Perú",             code: "PE", dial: "+51"  },
  { name: "República Dom.",   code: "DO", dial: "+1"   },
  { name: "Uruguay",          code: "UY", dial: "+598" },
  { name: "Venezuela",        code: "VE", dial: "+58"  },
];

/**
 * Puebla el <select id="countryCode"> con las opciones de país.
 * Preselecciona México por defecto.
 */
function populateCountrySelect() {
  const select = document.getElementById("countryCode");
  if (!select) return;

  // Opción placeholder
  const placeholder = document.createElement("option");
  placeholder.value    = "";
  placeholder.textContent = "País";
  placeholder.disabled = true;
  select.appendChild(placeholder);

  COUNTRIES.forEach(({ name, code, dial }) => {
    const option = document.createElement("option");
    option.value          = dial;
    option.dataset.code   = code;
    option.textContent    = `${dial} ${name}`;
    select.appendChild(option);
  });

  // Preseleccionar México
  const mexico = Array.from(select.options).find(o => o.dataset.code === "MX");
  if (mexico) mexico.selected = true;
}

// Ejecutar al cargar el DOM
document.addEventListener("DOMContentLoaded", populateCountrySelect);