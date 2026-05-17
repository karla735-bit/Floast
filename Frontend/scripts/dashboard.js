// ============================================================
//  FLOAST — dashboard.js
//  Lógica del dashboard. Solo habla con propertyService.js
//  (que a su vez habla con Firestore cuando esté listo).
//
//  FLUJO:
//  dashboard.js → propertyService.js → Firestore (o mock)
// ============================================================

import {
  getProperties,
  addProperty,
  updateProperty,
  deleteProperty,
} from "./propertyService.js";

import { onAuthChange } from "./auth.js";

// ── Lucide seguro ─────────────────────────────────────────────
function createIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    setTimeout(createIcons, 50);
  }
}

// ── Protección de ruta: si no hay sesión → login ──────────────
onAuthChange((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  // Poblar nombre e iniciales del header
  const name     = user.name || user.displayName || user.email || "Usuario";
  const initials = getInitials(name);
  document.getElementById("userName").textContent     = name;
  document.getElementById("avatarInitials").textContent = initials;
});

// ── Referencias DOM ───────────────────────────────────────────
const grid          = document.getElementById("propertiesGrid");
const addCard       = document.getElementById("btnAddCard");
const btnNew        = document.getElementById("btnNewProperty");
const btnEmptyNew   = document.getElementById("btnEmptyNew");
const emptyState    = document.getElementById("emptyState");
const searchInput   = document.getElementById("searchInput");

// Modal propiedad
const modalProperty = document.getElementById("modalProperty");
const modalTitle    = document.getElementById("modalTitle");
const modalClose    = document.getElementById("modalClose");
const modalCancel   = document.getElementById("modalCancel");
const propertyForm  = document.getElementById("propertyForm");
const propIdInput   = document.getElementById("propertyId");
const propName      = document.getElementById("propName");
const propType      = document.getElementById("propType");
const propLocation  = document.getElementById("propLocation");
const propUnits     = document.getElementById("propUnits");
const propPrice     = document.getElementById("propPrice");
const propStatus    = document.getElementById("propStatus");

// Modal eliminar
const modalDelete    = document.getElementById("modalDelete");
const deleteClose    = document.getElementById("deleteClose");
const deleteCancel   = document.getElementById("deleteCancel");
const deleteConfirm  = document.getElementById("deleteConfirm");
const deletePropName = document.getElementById("deletePropName");

// Estado local
let allProperties = [];
let deleteTargetId = null;

// ── Íconos por tipo (Lucide) ──────────────────────────────────
const TYPE_ICONS = {
  casa:         "house",
  condominio:   "building",
  edificio:     "building-2",
  departamento: "layout",
  cuarto:       "door-open",
  local:        "store",
};

const TYPE_LABELS = {
  casa:         "Casa",
  condominio:   "Condominio",
  edificio:     "Edificio",
  departamento: "Departamento",
  cuarto:       "Cuarto / Habitación",
  local:        "Local comercial",
};

// ── Inicialización ────────────────────────────────────────────
async function init() {
  try {
    allProperties = await getProperties();
    renderGrid(allProperties);
  } catch (err) {
    console.error("Error cargando propiedades:", err);
  }
}

init();

// ── Renderizado ───────────────────────────────────────────────
function renderGrid(properties) {
  // Limpiar tarjetas existentes (conservar la tarjeta add)
  grid.querySelectorAll(".property-card").forEach(c => c.remove());

  emptyState.hidden = properties.length > 0 || true; // grid siempre visible

  if (properties.length === 0) {
    addCard.style.display = "flex";
    return;
  }

  addCard.style.display = "flex";

  properties.forEach((prop, index) => {
    const card = buildCard(prop, index);
    // Insertar antes de la tarjeta de agregar
    grid.insertBefore(card, addCard);
  });

  // Re-inicializar íconos de Lucide en las nuevas tarjetas
  lucide.createIcons();
}

function buildCard(prop, index) {
  const card = document.createElement("div");
  card.className = "property-card";
  card.dataset.id = prop.id;
  card.style.animationDelay = `${index * 60}ms`;

  const icon    = TYPE_ICONS[prop.type]  || "building";
  const typeLabel = TYPE_LABELS[prop.type] || prop.type;
  const unitsLabel = getUnitsLabel(prop.type, prop.units);
  const priceFormatted = Number(prop.price).toLocaleString("es-MX");

  card.innerHTML = `
    <div class="card-illustration" data-type="${prop.type}">
      <i data-lucide="${icon}" class="prop-icon"></i>
      <span class="status-badge" data-status="${prop.status}">${capitalize(prop.status)}</span>
    </div>
    <div class="card-body">
      <p class="card-type">${typeLabel}</p>
      <p class="card-name">${prop.name}</p>
      <div class="card-meta">
        <span class="card-meta-item">
          <i data-lucide="map-pin"></i>
          ${prop.location}
        </span>
        <span class="card-meta-item">
          <i data-lucide="${icon}"></i>
          ${prop.units} ${unitsLabel}
        </span>
      </div>
      <div class="card-footer">
        <p class="card-price">$${priceFormatted}<span>/ mes</span></p>
        <div class="card-actions">
          <button class="card-btn edit-btn" data-id="${prop.id}" aria-label="Editar propiedad" title="Editar">
            <i data-lucide="pencil"></i>
          </button>
          <button class="card-btn danger delete-btn" data-id="${prop.id}" aria-label="Eliminar propiedad" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Clic en la tarjeta → ir a la vista de propiedad
  card.addEventListener("click", (e) => {
    // No navegar si hizo clic en editar o eliminar
    if (e.target.closest(".card-btn")) return;
    window.location.href = `property.html?id=${prop.id}`;
  });

  // Botón editar
  card.querySelector(".edit-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    openEditModal(prop);
  });

  // Botón eliminar
  card.querySelector(".delete-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    openDeleteModal(prop);
  });

  return card;
}

// ── Búsqueda ──────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = allProperties.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q) ||
    p.type.toLowerCase().includes(q)
  );
  renderGrid(filtered);
});

// ── Modal: Nueva propiedad ────────────────────────────────────
[btnNew, btnEmptyNew, addCard, btnAddCard].forEach(btn => {
  btn?.addEventListener("click", openNewModal);
});

function openNewModal() {
  propIdInput.value = "";
  propertyForm.reset();
  clearFormErrors();
  modalTitle.textContent = "Nueva Propiedad";
  document.getElementById("modalSubmit").textContent = "Guardar Propiedad";
  showModal(modalProperty);
}

function openEditModal(prop) {
  propIdInput.value    = prop.id;
  propName.value       = prop.name;
  propType.value       = prop.type;
  propLocation.value   = prop.location;
  propUnits.value      = prop.units;
  propPrice.value      = prop.price;
  propStatus.value     = prop.status;
  clearFormErrors();
  modalTitle.textContent = "Editar Propiedad";
  document.getElementById("modalSubmit").textContent = "Guardar Cambios";
  showModal(modalProperty);
}

[modalClose, modalCancel].forEach(btn => {
  btn.addEventListener("click", () => hideModal(modalProperty));
});

modalProperty.addEventListener("click", (e) => {
  if (e.target === modalProperty) hideModal(modalProperty);
});

// Submit del formulario
propertyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validatePropertyForm()) return;

  const submitBtn = document.getElementById("modalSubmit");
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando…";

  const data = {
    name:     propName.value.trim(),
    type:     propType.value,
    location: propLocation.value.trim(),
    units:    Number(propUnits.value),
    price:    Number(propPrice.value),
    status:   propStatus.value,
  };

  try {
    const id = propIdInput.value;
    if (id) {
      // Editar
      await updateProperty(id, data);
      const idx = allProperties.findIndex(p => p.id === id);
      if (idx !== -1) allProperties[idx] = { id, ...data };
    } else {
      // Nueva
      const newProp = await addProperty(data);
      allProperties.push(newProp);
    }
    renderGrid(allProperties);
    lucide.createIcons();
    hideModal(modalProperty);
  } catch (err) {
    console.error("Error guardando propiedad:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = propIdInput.value ? "Guardar Cambios" : "Guardar Propiedad";
  }
});

// ── Modal: Eliminar ───────────────────────────────────────────
function openDeleteModal(prop) {
  deleteTargetId = prop.id;
  deletePropName.textContent = prop.name;
  showModal(modalDelete);
}

[deleteClose, deleteCancel].forEach(btn => {
  btn.addEventListener("click", () => {
    deleteTargetId = null;
    hideModal(modalDelete);
  });
});

modalDelete.addEventListener("click", (e) => {
  if (e.target === modalDelete) hideModal(modalDelete);
});

deleteConfirm.addEventListener("click", async () => {
  if (!deleteTargetId) return;
  deleteConfirm.disabled = true;
  deleteConfirm.textContent = "Eliminando…";

  try {
    await deleteProperty(deleteTargetId);
    allProperties = allProperties.filter(p => p.id !== deleteTargetId);
    renderGrid(allProperties);
    lucide.createIcons();
    hideModal(modalDelete);
  } catch (err) {
    console.error("Error eliminando propiedad:", err);
  } finally {
    deleteConfirm.disabled = false;
    deleteConfirm.textContent = "Sí, eliminar";
    deleteTargetId = null;
  }
});

// ── Validación ────────────────────────────────────────────────
function validatePropertyForm() {
  let valid = true;

  if (!propName.value.trim()) {
    setFieldError("propName", "propNameError", "El nombre es obligatorio.");
    valid = false;
  } else clearFieldError("propName", "propNameError");

  if (!propType.value) {
    setFieldError("propType", "propTypeError", "Selecciona un tipo.");
    valid = false;
  } else clearFieldError("propType", "propTypeError");

  if (!propLocation.value.trim()) {
    setFieldError("propLocation", "propLocationError", "La ubicación es obligatoria.");
    valid = false;
  } else clearFieldError("propLocation", "propLocationError");

  if (!propUnits.value || Number(propUnits.value) < 1) {
    setFieldError("propUnits", "propUnitsError", "Ingresa al menos 1 unidad.");
    valid = false;
  } else clearFieldError("propUnits", "propUnitsError");

  if (!propPrice.value || Number(propPrice.value) < 0) {
    setFieldError("propPrice", "propPriceError", "Ingresa un precio válido.");
    valid = false;
  } else clearFieldError("propPrice", "propPriceError");

  if (!propStatus.value) {
    setFieldError("propStatus", "propStatusError", "Selecciona un estado.");
    valid = false;
  } else clearFieldError("propStatus", "propStatusError");

  return valid;
}

function setFieldError(inputId, errorId, msg) {
  document.getElementById(inputId)?.closest(".form-group")?.classList.add("has-error");
  const err = document.getElementById(errorId);
  if (err) err.textContent = msg;
}

function clearFieldError(inputId, errorId) {
  document.getElementById(inputId)?.closest(".form-group")?.classList.remove("has-error");
  const err = document.getElementById(errorId);
  if (err) err.textContent = "";
}

function clearFormErrors() {
  propertyForm.querySelectorAll(".form-group").forEach(g => g.classList.remove("has-error"));
  propertyForm.querySelectorAll(".error-message").forEach(e => e.textContent = "");
}

// ── Utilidades ────────────────────────────────────────────────
function showModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  // Foco al primer input
  setTimeout(() => modal.querySelector("input, select, button")?.focus(), 50);
}

function hideModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUnitsLabel(type, units) {
  if (type === "casa" || type === "departamento" || type === "cuarto") return units === 1 ? "hab." : "hab.";
  if (type === "local") return units === 1 ? "local" : "locales";
  return units === 1 ? "unidad" : "unidades";
}

// Cerrar modales con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!modalProperty.hidden) hideModal(modalProperty);
    if (!modalDelete.hidden)   hideModal(modalDelete);
  }
});