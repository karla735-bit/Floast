// ============================================================
//  FLOAST — dashboard.js
// ============================================================

import { getProperties, addProperty, updateProperty, deleteProperty } from "./propertyService.js";
import { onAuthChange } from "./auth.js";

// ── Auth ──────────────────────────────────────────────────────
onAuthChange(user => {
  if (!user) { window.location.href = "login.html"; return; }
  const name = user.name || user.displayName || user.email || "Usuario";
  document.getElementById("userName").textContent      = name;
  document.getElementById("avatarInitials").textContent = getInitials(name);
});

// ── DOM ───────────────────────────────────────────────────────
const grid        = document.getElementById("propertiesGrid");
const addCard     = document.getElementById("btnAddCard");
const btnNew      = document.getElementById("btnNewProperty");
const btnEmptyNew = document.getElementById("btnEmptyNew");
const searchInput = document.getElementById("searchInput");

// Modal propiedad
const modalProperty       = document.getElementById("modalProperty");
const modalTitle          = document.getElementById("modalTitle");
const modalClose          = document.getElementById("modalClose");
const modalCancel         = document.getElementById("modalCancel");
const propertyForm        = document.getElementById("propertyForm");
const propIdInput         = document.getElementById("propertyId");
const propStepsIndicator  = document.getElementById("propStepsIndicator");

// Paso 1
const propStep1      = document.getElementById("propStep1");
const typeVivienda   = document.getElementById("typeVivienda");
const typeEdificio   = document.getElementById("typeEdificio");
const buildingTypeRow= document.getElementById("buildingTypeRow");
const buildingNormal = document.getElementById("buildingNormal");
const buildingHibrido= document.getElementById("buildingHibrido");
const step1Next      = document.getElementById("step1Next");

// Paso 2
const propStep2      = document.getElementById("propStep2");
const rentCompleto   = document.getElementById("rentCompleto");
const rentIndividual = document.getElementById("rentIndividual");
const step2Back      = document.getElementById("step2Back");
const step2Next      = document.getElementById("step2Next");

// Paso 3
const propStep3        = document.getElementById("propStep3");
const propName         = document.getElementById("propName");
const propLocation     = document.getElementById("propLocation");
const propPriceGroup   = document.getElementById("propPriceGroup");
const propPrice        = document.getElementById("propPrice");
const propStatus       = document.getElementById("propStatus");
const propDescription  = document.getElementById("propDescription");
const propHabCount     = document.getElementById("propHabCount");
const propHabLabel     = document.getElementById("propHabLabel");
const propLocalGroup   = document.getElementById("propLocalGroup");
const propLocalCount   = document.getElementById("propLocalCount");
const step3Back        = document.getElementById("step3Back");
const modalSubmit      = document.getElementById("modalSubmit");

// Paso edición
const propStepEdit         = document.getElementById("propStepEdit");
const editPropName         = document.getElementById("editPropName");
const editPropLocation     = document.getElementById("editPropLocation");
const editPriceGroup       = document.getElementById("editPriceGroup");
const editPropPrice        = document.getElementById("editPropPrice");
const editPropStatus       = document.getElementById("editPropStatus");
const editPropDescription  = document.getElementById("editPropDescription");
const editPropHabCount     = document.getElementById("editPropHabCount");
const editHabLabel         = document.getElementById("editHabLabel");
const editLocalGroup       = document.getElementById("editLocalGroup");
const editPropLocalCount   = document.getElementById("editPropLocalCount");
const editSubmit           = document.getElementById("editSubmit");

// Modal eliminar
const modalDelete    = document.getElementById("modalDelete");
const deleteClose    = document.getElementById("deleteClose");
const deleteCancel   = document.getElementById("deleteCancel");
const deleteConfirm  = document.getElementById("deleteConfirm");
const deletePropName = document.getElementById("deletePropName");

// ── Estado del formulario de nueva propiedad ──────────────────
let formState = { type: null, buildingType: null, rentMode: null };
let allProperties  = [];
let deleteTargetId = null;

// ── Iconos por tipo ───────────────────────────────────────────
const TYPE_ICONS = { vivienda: "house", edificio: "building-2" };
const TYPE_LABELS = { vivienda: "Vivienda", edificio: "Edificio" };
const RENT_LABELS = { completo: "Completo", individual: "Por unidades" };
const BUILDING_LABELS = { normal: "Normal", hibrido: "Híbrido" };
const STATUS_LABELS = { disponible: "Disponible", rentada: "Rentada", mantenimiento: "Mantenimiento" };

// ── Inicialización ────────────────────────────────────────────
async function init() {
  try {
    allProperties = await getProperties();
    renderGrid(allProperties);
    lucide.createIcons();
  } catch (err) {
    console.error("Error cargando propiedades:", err);
  }
}
init();

// ── Renderizado grid ──────────────────────────────────────────
function renderGrid(properties) {
  grid.querySelectorAll(".property-card").forEach(c => c.remove());
  properties.forEach((prop, i) => {
    const card = buildCard(prop, i);
    grid.insertBefore(card, addCard);
  });
  lucide.createIcons();
}

function buildCard(prop, index) {
  const card = document.createElement("div");
  card.className = "property-card";
  card.dataset.id = prop.id;
  card.style.animationDelay = `${index * 60}ms`;

  const icon         = TYPE_ICONS[prop.type] || "building";
  const typeLabel    = TYPE_LABELS[prop.type] || prop.type;
  const rentLabel    = RENT_LABELS[prop.rentMode] || "";
  const buildLabel   = prop.buildingType ? ` · ${BUILDING_LABELS[prop.buildingType]}` : "";
  const priceStr     = prop.rentMode === "completo"
    ? `$${Number(prop.price).toLocaleString("es-MX")}<span>/ mes</span>`
    : `<span style="font-size:0.78rem;color:var(--color-text-dim)">Precio por unidad</span>`;

  card.innerHTML = `
    <div class="card-illustration" data-type="${prop.type}">
      <i data-lucide="${icon}" class="prop-icon"></i>
      <span class="status-badge" data-status="${prop.status}">${capitalize(prop.status)}</span>
    </div>
    <div class="card-body">
      <p class="card-type">${typeLabel}${buildLabel} · ${rentLabel}</p>
      <p class="card-name">${prop.name}</p>
      <div class="card-meta">
        <span class="card-meta-item"><i data-lucide="map-pin"></i>${prop.location}</span>
        ${prop.habCount ? `<span class="card-meta-item"><i data-lucide="door-open"></i>${prop.habCount} hab.</span>` : ""}
        ${prop.localCount ? `<span class="card-meta-item"><i data-lucide="store"></i>${prop.localCount} locales</span>` : ""}
      </div>
      ${prop.description ? `<p class="card-desc">${prop.description}</p>` : ""}
      <div class="card-footer">
        <p class="card-price">${priceStr}</p>
        <div class="card-actions">
          <button class="card-btn edit-btn" data-id="${prop.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="card-btn danger delete-btn" data-id="${prop.id}" title="Eliminar"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
    </div>
  `;

  card.addEventListener("click", e => {
    if (e.target.closest(".card-btn")) return;
    window.location.href = `property.html?id=${prop.id}`;
  });
  card.querySelector(".edit-btn").addEventListener("click", e => { e.stopPropagation(); openEditModal(prop); });
  card.querySelector(".delete-btn").addEventListener("click", e => { e.stopPropagation(); openDeleteModal(prop); });
  return card;
}

// ── Búsqueda ──────────────────────────────────────────────────
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  renderGrid(allProperties.filter(p =>
    p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
  ));
});

// ── Modal nueva propiedad — pasos ─────────────────────────────
[btnNew, btnEmptyNew, addCard].forEach(btn => btn?.addEventListener("click", openNewModal));

function openNewModal() {
  propIdInput.value = "";
  propertyForm.reset();
  formState = { type: null, buildingType: null, rentMode: null };

  // Resetear selecciones visuales
  [typeVivienda, typeEdificio, buildingNormal, buildingHibrido, rentCompleto, rentIndividual]
    .forEach(b => b.classList.remove("selected"));
  buildingTypeRow.hidden  = true;
  propLocalGroup.hidden   = true;

  // Asegurar que el paso de edición esté oculto
  propStepEdit.classList.remove("active");

  // Mostrar pasos, ocultar edición
  propStepsIndicator.hidden = false;
  goToStep(1);

  modalTitle.textContent = "Nueva Propiedad";
  showModal(modalProperty);
}

// Paso 1: selección de tipo
[typeVivienda, typeEdificio].forEach(btn => {
  btn.addEventListener("click", () => {
    [typeVivienda, typeEdificio].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    formState.type = btn.dataset.value;
    formState.buildingType = null;
    [buildingNormal, buildingHibrido].forEach(b => b.classList.remove("selected"));

    if (formState.type === "edificio") {
      buildingTypeRow.hidden = false;
    } else {
      buildingTypeRow.hidden = true;
      formState.buildingType = null;
    }
    lucide.createIcons();
  });
});

[buildingNormal, buildingHibrido].forEach(btn => {
  btn.addEventListener("click", () => {
    [buildingNormal, buildingHibrido].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    formState.buildingType = btn.dataset.value;
  });
});

step1Next.addEventListener("click", () => {
  if (!formState.type) { alert("Selecciona el tipo de inmueble."); return; }
  if (formState.type === "edificio" && !formState.buildingType) { alert("Selecciona el tipo de edificio."); return; }
  goToStep(2);
});

// Paso 2: modo de renta
[rentCompleto, rentIndividual].forEach(btn => {
  btn.addEventListener("click", () => {
    [rentCompleto, rentIndividual].forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    formState.rentMode = btn.dataset.value;
    lucide.createIcons();
  });
});

step2Back.addEventListener("click", () => goToStep(1));
step2Next.addEventListener("click", () => {
  if (!formState.rentMode) { alert("Selecciona cómo se rentará el inmueble."); return; }

  // Precio solo si completo
  propPriceGroup.hidden = formState.rentMode !== "completo";

  // Etiqueta de habitaciones según tipo
  if (formState.type === "vivienda") {
    propHabLabel.textContent = "Número de habitaciones";
  } else {
    propHabLabel.textContent = "Número de habitaciones / cuartos";
  }

  // Locales solo en edificio híbrido
  propLocalGroup.hidden = !(formState.type === "edificio" && formState.buildingType === "hibrido");

  goToStep(3);
});

// Paso 3: datos
step3Back.addEventListener("click", () => goToStep(2));

function goToStep(n) {
  [propStep1, propStep2, propStep3].forEach((s, i) => s.classList.toggle("active", i === n - 1));

  const dots = [
    document.getElementById("pDot1"),
    document.getElementById("pDot2"),
    document.getElementById("pDot3"),
  ];
  const conns = [
    document.getElementById("pConn1"),
    document.getElementById("pConn2"),
  ];

  dots.forEach((d, i) => {
    d.classList.remove("active", "completed");
    if (i < n - 1)      { d.classList.add("completed"); d.querySelector(".dot").textContent = "✓"; }
    else if (i === n - 1){ d.classList.add("active");    d.querySelector(".dot").textContent = i + 1; }
    else                  {                               d.querySelector(".dot").textContent = i + 1; }
  });
  conns.forEach((c, i) => c.classList.toggle("completed", i < n - 1));
}

// ── Submit nueva propiedad ────────────────────────────────────
propertyForm.addEventListener("submit", async e => {
  e.preventDefault();
  const isEdit = !!propIdInput.value;
  if (isEdit) { await handleEdit(); return; }

  if (!validateStep3()) return;

  modalSubmit.disabled = true;
  modalSubmit.textContent = "Guardando…";

  const data = {
    name:         propName.value.trim(),
    type:         formState.type,
    buildingType: formState.buildingType,
    rentMode:     formState.rentMode,
    location:     propLocation.value.trim(),
    price:        formState.rentMode === "completo" ? Number(propPrice.value) : null,
    status:       propStatus.value,
    description:  propDescription.value.trim(),
    habCount:     Number(propHabCount.value) || 0,
    localCount:   (formState.type === "edificio" && formState.buildingType === "hibrido")
                  ? (Number(propLocalCount.value) || 0)
                  : 0,
  };

  try {
    const newProp = await addProperty(data);
    allProperties.push(newProp);
    renderGrid(allProperties);
    hideModal(modalProperty);
  } catch (err) {
    console.error("Error guardando propiedad:", err);
  } finally {
    modalSubmit.disabled = false;
    modalSubmit.textContent = "Guardar Propiedad";
  }
});

function validateStep3() {
  let valid = true;
  if (!propName.value.trim())     { setErr("propName","propNameError","Obligatorio."); valid=false; } else clearErr("propName","propNameError");
  if (!propLocation.value.trim()) { setErr("propLocation","propLocationError","Obligatorio."); valid=false; } else clearErr("propLocation","propLocationError");
  if (!propHabCount.value || Number(propHabCount.value) < 1) { setErr("propHabCount","propHabCountError","Ingresa al menos 1."); valid=false; } else clearErr("propHabCount","propHabCountError");
  if (formState.type === "edificio" && formState.buildingType === "hibrido" && (!propLocalCount.value || Number(propLocalCount.value) < 0)) {
    setErr("propLocalCount","propLocalCountError","Ingresa el número de locales."); valid=false;
  } else clearErr("propLocalCount","propLocalCountError");
  if (formState.rentMode === "completo" && !propPrice.value) { setErr("propPrice","propPriceError","Ingresa el precio."); valid=false; } else clearErr("propPrice","propPriceError");
  if (!propStatus.value) { setErr("propStatus","propStatusError","Selecciona un estado."); valid=false; } else clearErr("propStatus","propStatusError");
  return valid;
}

// ── Editar propiedad ──────────────────────────────────────────
function openEditModal(prop) {
  propIdInput.value = prop.id;
  // Modo edición: limpiar pasos y mostrar solo el de edición
  propStepsIndicator.hidden = true;
  [propStep1, propStep2, propStep3].forEach(s => s.classList.remove("active"));
  propStepEdit.classList.remove("active"); // asegurar limpio antes de activar
  propStepEdit.classList.add("active");

  editPropName.value        = prop.name;
  editPropLocation.value    = prop.location;
  editPropStatus.value      = prop.status;
  editPropDescription.value = prop.description || "";
  editPriceGroup.hidden     = prop.rentMode !== "completo";
  editPropPrice.value       = prop.price || "";

  // Unidades
  editPropHabCount.value  = prop.habCount || "";
  editHabLabel.textContent = prop.type === "vivienda" ? "Número de habitaciones" : "Número de habitaciones / cuartos";
  const isHibrido = prop.type === "edificio" && prop.buildingType === "hibrido";
  editLocalGroup.hidden    = !isHibrido;
  editPropLocalCount.value = isHibrido ? (prop.localCount || "") : "";

  modalTitle.textContent = "Editar Propiedad";
  showModal(modalProperty);
}

async function handleEdit() {
  editSubmit.disabled = true;
  editSubmit.textContent = "Guardando…";

  const id   = propIdInput.value;
  const prop = allProperties.find(p => p.id === id);

  const isHibrido = prop?.type === "edificio" && prop?.buildingType === "hibrido";
  const data = {
    name:        editPropName.value.trim(),
    location:    editPropLocation.value.trim(),
    status:      editPropStatus.value,
    description: editPropDescription.value.trim(),
    price:       prop?.rentMode === "completo" ? Number(editPropPrice.value) : null,
    habCount:    Number(editPropHabCount.value) || 0,
    localCount:  isHibrido ? (Number(editPropLocalCount.value) || 0) : 0,
  };

  try {
    await updateProperty(id, data);
    const idx = allProperties.findIndex(p => p.id === id);
    if (idx !== -1) allProperties[idx] = { ...allProperties[idx], ...data };
    renderGrid(allProperties);
    hideModal(modalProperty);
  } catch (err) {
    console.error("Error editando propiedad:", err);
  } finally {
    editSubmit.disabled = false;
    editSubmit.textContent = "Guardar Cambios";
  }
}

[modalClose, modalCancel].forEach(btn => btn?.addEventListener("click", () => {
  propStepEdit.classList.remove("active");
  [propStep1, propStep2, propStep3].forEach(s => s.classList.remove("active"));
  propStepsIndicator.hidden = false;
  hideModal(modalProperty);
}));
modalProperty.addEventListener("click", e => { if (e.target === modalProperty) hideModal(modalProperty); });

// ── Modal eliminar ────────────────────────────────────────────
function openDeleteModal(prop) {
  deleteTargetId = prop.id;
  deletePropName.textContent = prop.name;
  showModal(modalDelete);
}

[deleteClose, deleteCancel].forEach(btn => btn.addEventListener("click", () => { deleteTargetId = null; hideModal(modalDelete); }));
modalDelete.addEventListener("click", e => { if (e.target === modalDelete) hideModal(modalDelete); });

deleteConfirm.addEventListener("click", async () => {
  if (!deleteTargetId) return;
  deleteConfirm.disabled = true;
  deleteConfirm.textContent = "Eliminando…";
  try {
    await deleteProperty(deleteTargetId);
    allProperties = allProperties.filter(p => p.id !== deleteTargetId);
    renderGrid(allProperties);
    hideModal(modalDelete);
  } catch (err) {
    console.error("Error eliminando:", err);
  } finally {
    deleteConfirm.disabled = false;
    deleteConfirm.textContent = "Sí, eliminar";
    deleteTargetId = null;
  }
});

// ── Escape ────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!modalProperty.hidden) hideModal(modalProperty);
    if (!modalDelete.hidden)   hideModal(modalDelete);
  }
});

// ── Helpers ───────────────────────────────────────────────────
function showModal(m) { m.hidden = false; document.body.style.overflow = "hidden"; setTimeout(() => m.querySelector("input,select,button")?.focus(), 50); }
function hideModal(m) { m.hidden = true;  document.body.style.overflow = ""; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
function getInitials(name) { return (name||"").split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join(""); }
function setErr(inputId, errorId, msg) { document.getElementById(inputId)?.closest(".form-group")?.classList.add("has-error"); const e=document.getElementById(errorId); if(e) e.textContent=msg; }
function clearErr(inputId, errorId)    { document.getElementById(inputId)?.closest(".form-group")?.classList.remove("has-error"); const e=document.getElementById(errorId); if(e) e.textContent=""; }