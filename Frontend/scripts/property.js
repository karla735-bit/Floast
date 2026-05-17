// ============================================================
//  FLOAST — property.js
//  Vista de detalle de propiedad.
//  Habla con propertyService.js y unitService.js
// ============================================================

import { getPropertyById, updateProperty } from "./propertyService.js";
import { getUnits, updateUnit }             from "./unitService.js";
import { onAuthChange }                     from "./auth.js";

// ── Protección de ruta ────────────────────────────────────────
// onAuthChange devuelve el usuario mock durante desarrollo,
// así que esto nunca redirige mientras no haya Firebase real.
onAuthChange(user => { if (!user) window.location.href = "login.html"; });

// ── Leer el id de la URL ──────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const propId = params.get("id");

if (!propId) window.location.href = "dashboard.html";

// ── Referencias DOM ───────────────────────────────────────────
const loadingScreen   = document.getElementById("loadingScreen");
const propMain        = document.getElementById("propMain");
const headerName      = document.getElementById("headerPropName");
const headerMeta      = document.getElementById("headerMeta");
const propStatusBadge = document.getElementById("propStatusBadge");
const multiView       = document.getElementById("multiView");
const singleView      = document.getElementById("singleView");
const unitsBar        = document.getElementById("unitsBar");
const unitDetail      = document.getElementById("unitDetail");
const singleDetail    = document.getElementById("singleDetail");

// Modales propiedad
const modalEditProp   = document.getElementById("modalEditProp");
const editPropForm    = document.getElementById("editPropForm");
const editPropClose   = document.getElementById("editPropClose");
const editPropCancel  = document.getElementById("editPropCancel");
const editPropSubmit  = document.getElementById("editPropSubmit");

// Modales unidad
const modalEditUnit   = document.getElementById("modalEditUnit");
const editUnitForm    = document.getElementById("editUnitForm");
const editUnitClose   = document.getElementById("editUnitClose");
const editUnitCancel  = document.getElementById("editUnitCancel");
const editUnitTitle   = document.getElementById("editUnitTitle");

// Estado local
let currentProp   = null;
let currentUnits  = [];
let activeUnitId  = null;

const TYPE_LABELS = {
  casa: "Casa", condominio: "Condominio", edificio: "Edificio",
  departamento: "Departamento", cuarto: "Cuarto / Habitación", local: "Local comercial",
};

const SINGLE_TYPES = ["casa", "departamento", "cuarto", "local"];

// ── Inicialización ────────────────────────────────────────────
// ── Lucide seguro — espera a que el CDN cargue ───────────────
function createIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    // Reintenta hasta que lucide esté disponible
    setTimeout(createIcons, 50);
  }
}

async function init() {
  try {
    const [prop, units] = await Promise.all([
      getPropertyById(propId),
      getUnits(propId),
    ]);

    if (!prop) { window.location.href = "dashboard.html"; return; }

    currentProp  = prop;
    currentUnits = units;

    renderHeader(prop);
    renderContent(prop, units);

    loadingScreen.hidden = true;
    propMain.hidden      = false;
    lucide.createIcons();

  } catch (err) {
    console.error("Error cargando propiedad:", err);
    loadingScreen.hidden = true;
    propMain.hidden      = false;
  }
}

init();

// ── Header ────────────────────────────────────────────────────
function renderHeader(prop) {
  document.title = `Floast — ${prop.name}`;
  headerName.textContent = prop.name;

  const typeLabel  = TYPE_LABELS[prop.type] || prop.type;
  const unitsLabel = prop.units === 1 ? "1 unidad" : `${prop.units} unidades`;

  headerMeta.innerHTML = `
    <span class="header-meta-item">
      <i data-lucide="tag"></i>${typeLabel}
    </span>
    <span class="header-meta-item">
      <i data-lucide="map-pin"></i>${prop.location}
    </span>
    <span class="header-meta-item">
      <i data-lucide="layers"></i>${unitsLabel}
    </span>
  `;

  propStatusBadge.textContent        = capitalize(prop.status);
  propStatusBadge.dataset.status     = prop.status;
}

// ── Contenido principal ───────────────────────────────────────
function renderContent(prop, units) {
  const isSingle = SINGLE_TYPES.includes(prop.type) && prop.units <= 1;

  if (isSingle) {
    multiView.hidden  = true;
    singleView.hidden = false;
    // Usa la primera (y única) unidad o sintetiza una desde la prop
    const unit = units[0] || synthUnit(prop);
    singleDetail.innerHTML = buildDetailHTML(unit, prop);
    bindDetailActions(singleDetail, unit);
  } else {
    multiView.hidden  = false;
    singleView.hidden = true;
    renderUnitsBar(units);
    // Seleccionar la primera unidad por defecto
    if (units.length > 0) selectUnit(units[0].id);
  }
}

// ── Barra de pestañas ─────────────────────────────────────────
function renderUnitsBar(units) {
  unitsBar.innerHTML = `<span class="units-bar-label">Unidades</span>`;

  units.forEach(unit => {
    const tab = document.createElement("button");
    tab.className        = "unit-tab";
    tab.dataset.id       = unit.id;
    tab.dataset.status   = unit.status;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", "false");
    tab.innerHTML = `<span class="tab-dot"></span>${unit.label}`;

    tab.addEventListener("click", () => selectUnit(unit.id));
    unitsBar.appendChild(tab);
  });
}

function selectUnit(unitId) {
  activeUnitId = unitId;

  // Actualizar tabs
  unitsBar.querySelectorAll(".unit-tab").forEach(tab => {
    const isActive = tab.dataset.id === unitId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive);
  });

  // Renderizar detalle
  const unit = currentUnits.find(u => u.id === unitId);
  if (!unit) return;

  unitDetail.innerHTML = "";
  unitDetail.insertAdjacentHTML("beforeend", buildDetailHTML(unit, currentProp));
  bindDetailActions(unitDetail, unit);
  lucide.createIcons();
}

// ── HTML del panel de detalle ─────────────────────────────────
function buildDetailHTML(unit, prop) {
  const priceFormatted = Number(unit.price || prop.price).toLocaleString("es-MX");
  const hasTenant      = unit.tenant?.name;
  const leaseWarning   = unit.tenant?.leaseEnd ? isLeaseClose(unit.tenant.leaseEnd) : false;

  return `
    <div class="detail-grid">

      <!-- Tarjeta: Resumen -->
      <div class="detail-card">
        <div class="detail-card-header">
          <span class="detail-card-title">
            <i data-lucide="home"></i>Resumen
          </span>
          <button class="card-edit-btn" data-action="edit-unit" data-id="${unit.id}">
            <i data-lucide="pencil"></i> Editar
          </button>
        </div>
        <div class="summary-row">
          <span class="summary-price">$${priceFormatted}</span>
          <span class="summary-price-sub">/ mes</span>
        </div>
        <span class="unit-status-badge" data-status="${unit.status}">
          <span class="dot"></span>${capitalize(unit.status)}
        </span>
        <div class="detail-data-list" style="margin-top:1rem">
          ${unit.area ? `
          <div class="detail-data-row">
            <span class="detail-data-label"><i data-lucide="square"></i>Área</span>
            <span class="detail-data-value">${unit.area} m²</span>
          </div>` : ""}
          <div class="detail-data-row">
            <span class="detail-data-label"><i data-lucide="hash"></i>Identificador</span>
            <span class="detail-data-value">${unit.label}</span>
          </div>
        </div>
      </div>

      <!-- Tarjeta: Inquilino -->
      <div class="detail-card">
        <div class="detail-card-header">
          <span class="detail-card-title">
            <i data-lucide="user"></i>Inquilino
          </span>
          <button class="card-edit-btn" data-action="edit-unit" data-id="${unit.id}">
            <i data-lucide="pencil"></i> Editar
          </button>
        </div>
        ${hasTenant ? `
          <div class="tenant-header-row">
            <div class="tenant-avatar">${getInitials(unit.tenant.name)}</div>
            <div>
              <p class="tenant-name">${unit.tenant.name}</p>
              ${unit.tenant.leaseEnd ? `<p class="tenant-since">Contrato hasta: ${formatDate(unit.tenant.leaseEnd)}</p>` : ""}
            </div>
          </div>
          <div class="detail-data-list">
            ${unit.tenant.phone ? `
            <div class="detail-data-row">
              <span class="detail-data-label"><i data-lucide="phone"></i>Teléfono</span>
              <span class="detail-data-value">${unit.tenant.phone}</span>
            </div>` : ""}
            ${unit.tenant.email ? `
            <div class="detail-data-row">
              <span class="detail-data-label"><i data-lucide="mail"></i>Correo</span>
              <span class="detail-data-value">${unit.tenant.email}</span>
            </div>` : ""}
          </div>
          ${leaseWarning ? `
          <div class="lease-alert">
            <i data-lucide="alert-triangle"></i>
            El contrato vence en menos de 30 días.
          </div>` : ""}
        ` : `
          <div class="tenant-empty">
            <i data-lucide="user-x"></i>
            <p>Sin inquilino asignado</p>
          </div>
        `}
      </div>

      <!-- Tarjeta: Notas (ancho completo) -->
      ${unit.notes ? `
      <div class="detail-card full-width">
        <div class="detail-card-header">
          <span class="detail-card-title">
            <i data-lucide="file-text"></i>Notas
          </span>
        </div>
        <p class="notes-text">${unit.notes}</p>
      </div>` : ""}

    </div>
  `;
}

// ── Listeners del panel de detalle ────────────────────────────
function bindDetailActions(container, unit) {
  container.querySelectorAll("[data-action='edit-unit']").forEach(btn => {
    btn.addEventListener("click", () => openEditUnitModal(unit));
  });
}

// ── Modal: editar propiedad ───────────────────────────────────
document.getElementById("btnEditProp").addEventListener("click", () => {
  document.getElementById("ePropName").value     = currentProp.name;
  document.getElementById("ePropType").value     = currentProp.type;
  document.getElementById("ePropLocation").value = currentProp.location;
  document.getElementById("ePropUnits").value    = currentProp.units;
  document.getElementById("ePropPrice").value    = currentProp.price;
  document.getElementById("ePropStatus").value   = currentProp.status;
  showModal(modalEditProp);
});

[editPropClose, editPropCancel].forEach(b => b.addEventListener("click", () => hideModal(modalEditProp)));
modalEditProp.addEventListener("click", e => { if (e.target === modalEditProp) hideModal(modalEditProp); });

editPropForm.addEventListener("submit", async e => {
  e.preventDefault();
  editPropSubmit.disabled = true;
  editPropSubmit.textContent = "Guardando…";

  const data = {
    name:     document.getElementById("ePropName").value.trim(),
    type:     document.getElementById("ePropType").value,
    location: document.getElementById("ePropLocation").value.trim(),
    units:    Number(document.getElementById("ePropUnits").value),
    price:    Number(document.getElementById("ePropPrice").value),
    status:   document.getElementById("ePropStatus").value,
  };

  try {
    await updateProperty(propId, data);
    currentProp = { ...currentProp, ...data };
    renderHeader(currentProp);
    lucide.createIcons();
    hideModal(modalEditProp);
  } catch (err) {
    console.error("Error actualizando propiedad:", err);
  } finally {
    editPropSubmit.disabled = false;
    editPropSubmit.textContent = "Guardar Cambios";
  }
});

// ── Modal: editar unidad ──────────────────────────────────────
function openEditUnitModal(unit) {
  editUnitTitle.textContent = `Editar — ${unit.label}`;
  document.getElementById("editUnitId").value    = unit.id;
  document.getElementById("eUnitLabel").value    = unit.label;
  document.getElementById("eUnitStatus").value   = unit.status;
  document.getElementById("eUnitPrice").value    = unit.price || "";
  document.getElementById("eUnitArea").value     = unit.area  || "";
  document.getElementById("eTenantName").value   = unit.tenant?.name  || "";
  document.getElementById("eTenantPhone").value  = unit.tenant?.phone || "";
  document.getElementById("eTenantEmail").value  = unit.tenant?.email || "";
  document.getElementById("eLeaseEnd").value     = unit.tenant?.leaseEnd || "";
  document.getElementById("eUnitNotes").value    = unit.notes || "";
  showModal(modalEditUnit);
}

[editUnitClose, editUnitCancel].forEach(b => b.addEventListener("click", () => hideModal(modalEditUnit)));
modalEditUnit.addEventListener("click", e => { if (e.target === modalEditUnit) hideModal(modalEditUnit); });

editUnitForm.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = editUnitForm.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando…";

  const unitId = document.getElementById("editUnitId").value;
  const data = {
    label:  document.getElementById("eUnitLabel").value.trim(),
    status: document.getElementById("eUnitStatus").value,
    price:  Number(document.getElementById("eUnitPrice").value) || 0,
    area:   Number(document.getElementById("eUnitArea").value)  || null,
    notes:  document.getElementById("eUnitNotes").value.trim(),
    tenant: {
      name:     document.getElementById("eTenantName").value.trim(),
      phone:    document.getElementById("eTenantPhone").value.trim(),
      email:    document.getElementById("eTenantEmail").value.trim(),
      leaseEnd: document.getElementById("eLeaseEnd").value || null,
    },
  };

  // Limpiar tenant si no hay nombre
  if (!data.tenant.name) data.tenant = null;

  try {
    await updateUnit(propId, unitId, data);
    // Actualizar estado local
    const idx = currentUnits.findIndex(u => u.id === unitId);
    if (idx !== -1) currentUnits[idx] = { ...currentUnits[idx], ...data };

    // Re-renderizar
    if (multiView.hidden === false) {
      renderUnitsBar(currentUnits);
      selectUnit(unitId);
    } else {
      singleDetail.innerHTML = buildDetailHTML(currentUnits[0] || synthUnit(currentProp), currentProp);
      bindDetailActions(singleDetail, currentUnits[0]);
    }

    lucide.createIcons();
    hideModal(modalEditUnit);
  } catch (err) {
    console.error("Error actualizando unidad:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Guardar Unidad";
  }
});

// ── Escape ────────────────────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (!modalEditProp.hidden) hideModal(modalEditProp);
    if (!modalEditUnit.hidden) hideModal(modalEditUnit);
  }
});

// ── Helpers ───────────────────────────────────────────────────
function showModal(m) { m.hidden = false; document.body.style.overflow = "hidden"; setTimeout(() => m.querySelector("input,select,button")?.focus(), 50); }
function hideModal(m) { m.hidden = true;  document.body.style.overflow = ""; }

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

function getInitials(name) {
  return (name || "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

function isLeaseClose(dateStr) {
  if (!dateStr) return false;
  const diff = new Date(dateStr) - new Date();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

// Sintetiza una unidad desde los datos de la propiedad (casas de 1 unidad sin unidades en BD)
function synthUnit(prop) {
  return {
    id:     "synth",
    label:  prop.name,
    status: prop.status,
    price:  prop.price,
    area:   null,
    tenant: null,
    notes:  "",
  };
}