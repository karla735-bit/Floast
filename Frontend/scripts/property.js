// ============================================================
//  FLOAST — property.js  |  Vista de detalle de propiedad
//
//  Casos:
//  1. vivienda + completo   → ficha única (sin tabs)
//  2. vivienda + individual → tabs de habitaciones
//  3. edificio + completo   → ficha única (sin tabs)
//  4. edificio normal + individual → tabs de habitaciones
//  5. edificio híbrido + individual → tabs con dos grupos: locales y habitaciones
// ============================================================

import { getPropertyById, updateProperty } from "./propertyService.js";
import { getUnits, updateUnit }             from "./unitService.js";
import { onAuthChange }                     from "./auth.js";

onAuthChange(user => { if (!user) window.location.href = "login.html"; });

const params = new URLSearchParams(window.location.search);
const propId = params.get("id");
if (!propId) window.location.href = "dashboard.html";

// ── DOM ───────────────────────────────────────────────────────
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

// Modal editar propiedad
const modalEditProp   = document.getElementById("modalEditProp");
const editPropForm    = document.getElementById("editPropForm");
const editPropClose   = document.getElementById("editPropClose");
const editPropCancel  = document.getElementById("editPropCancel");
const editPropSubmit  = document.getElementById("editPropSubmit");

// Modal editar unidad
const modalEditUnit   = document.getElementById("modalEditUnit");
const editUnitForm    = document.getElementById("editUnitForm");
const editUnitClose   = document.getElementById("editUnitClose");
const editUnitCancel  = document.getElementById("editUnitCancel");
const editUnitTitle   = document.getElementById("editUnitTitle");

let currentProp  = null;
let currentUnits = [];
let activeUnitId = null;

const TYPE_LABELS     = { vivienda: "Vivienda", edificio: "Edificio" };
const BUILDING_LABELS = { normal: "Normal", hibrido: "Híbrido" };
const RENT_LABELS     = { completo: "Completo", individual: "Por unidades" };

// ── Init ──────────────────────────────────────────────────────
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

  const typeLabel     = TYPE_LABELS[prop.type] || prop.type;
  const buildingLabel = prop.buildingType ? ` · ${BUILDING_LABELS[prop.buildingType]}` : "";
  const rentLabel     = RENT_LABELS[prop.rentMode] || "";

  headerMeta.innerHTML = `
    <span class="header-meta-item"><i data-lucide="tag"></i>${typeLabel}${buildingLabel}</span>
    <span class="header-meta-item"><i data-lucide="map-pin"></i>${prop.location}</span>
    <span class="header-meta-item"><i data-lucide="key"></i>${rentLabel}</span>
  `;

  propStatusBadge.textContent    = capitalize(prop.status);
  propStatusBadge.dataset.status = prop.status;
}

// ── Contenido principal ───────────────────────────────────────
function renderContent(prop, units) {
  const isCompleto = prop.rentMode === "completo";

  if (isCompleto) {
    // Ficha única — sin tabs
    multiView.hidden  = true;
    singleView.hidden = false;
    singleDetail.innerHTML = buildSingleHTML(prop);
    bindDetailActions(singleDetail, null, true);
  } else {
    // Con tabs de unidades
    multiView.hidden  = false;
    singleView.hidden = true;
    renderUnitsBar(units, prop);
    if (units.length > 0) selectUnit(units[0].id);
  }
}

// ── Vista completa (ficha única) ──────────────────────────────
function buildSingleHTML(prop) {
  const priceStr = prop.price
    ? `$${Number(prop.price).toLocaleString("es-MX")}<span class="summary-price-sub">/ mes</span>`
    : `<span class="summary-price-sub">Sin precio registrado</span>`;

  return `
    <div class="detail-grid">
      <div class="detail-card">
        <div class="detail-card-header">
          <span class="detail-card-title"><i data-lucide="home"></i>Resumen</span>
          <button class="card-edit-btn" data-action="edit-prop"><i data-lucide="pencil"></i>Editar</button>
        </div>
        <div class="summary-row">${priceStr}</div>
        <span class="unit-status-badge" data-status="${prop.status}">
          <span class="dot"></span>${capitalize(prop.status)}
        </span>
        ${prop.description ? `
        <div style="margin-top:1rem">
          <p class="detail-data-label" style="margin-bottom:.4rem"><i data-lucide="file-text" style="width:13px;height:13px"></i> Descripción</p>
          <p class="notes-text">${prop.description}</p>
        </div>` : ""}
      </div>

      <div class="detail-card" id="tenantCardSingle">
        <div class="detail-card-header">
          <span class="detail-card-title"><i data-lucide="user"></i>Inquilino</span>
          <button class="card-edit-btn" data-action="edit-tenant-single"><i data-lucide="pencil"></i>Editar</button>
        </div>
        <div class="tenant-empty">
          <i data-lucide="user-x"></i>
          <p>Sin inquilino asignado</p>
          <p style="font-size:.75rem;margin-top:.25rem">Usa el botón Editar para agregar uno</p>
        </div>
      </div>
    </div>
  `;
}

// ── Barra de tabs ─────────────────────────────────────────────
function renderUnitsBar(units, prop) {
  unitsBar.innerHTML = "";

  const isHibrido = prop.type === "edificio" && prop.buildingType === "hibrido";

  if (isHibrido) {
    // Dos grupos: locales primero, luego habitaciones
    const locales     = units.filter(u => u.category === "local");
    const habitaciones= units.filter(u => u.category === "habitacion");

    if (locales.length) {
      const sep = document.createElement("span");
      sep.className = "units-bar-label";
      sep.textContent = "Locales";
      unitsBar.appendChild(sep);
      locales.forEach(u => unitsBar.appendChild(buildTab(u)));
    }

    if (habitaciones.length) {
      const sep = document.createElement("span");
      sep.className = "units-bar-label";
      sep.style.marginLeft = "0.75rem";
      sep.textContent = "Habitaciones";
      unitsBar.appendChild(sep);
      habitaciones.forEach(u => unitsBar.appendChild(buildTab(u)));
    }
  } else {
    const sep = document.createElement("span");
    sep.className = "units-bar-label";
    sep.textContent = "Unidades";
    unitsBar.appendChild(sep);
    units.forEach(u => unitsBar.appendChild(buildTab(u)));
  }
}

function buildTab(unit) {
  const tab = document.createElement("button");
  tab.className      = "unit-tab";
  tab.dataset.id     = unit.id;
  tab.dataset.status = unit.status;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-selected", "false");

  // Ícono diferenciado para locales
  const dotColor = unit.category === "local" ? "var(--color-warning)" : "";
  tab.innerHTML = `<span class="tab-dot" style="${dotColor ? `background:${dotColor}` : ""}"></span>${unit.label}`;
  tab.addEventListener("click", () => selectUnit(unit.id));
  return tab;
}

function selectUnit(unitId) {
  activeUnitId = unitId;
  unitsBar.querySelectorAll(".unit-tab").forEach(t => {
    const active = t.dataset.id === unitId;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", active);
  });

  const unit = currentUnits.find(u => u.id === unitId);
  if (!unit) return;

  unitDetail.innerHTML = "";
  unitDetail.insertAdjacentHTML("beforeend", buildUnitDetailHTML(unit));
  bindDetailActions(unitDetail, unit, false);
  lucide.createIcons();
}

// ── HTML detalle de unidad individual ────────────────────────
function buildUnitDetailHTML(unit) {
  const priceFormatted = unit.price ? `$${Number(unit.price).toLocaleString("es-MX")}` : "—";
  const hasTenant      = !!unit.tenant?.name;
  const leaseWarning   = unit.tenant?.leaseEnd ? isLeaseClose(unit.tenant.leaseEnd) : false;
  const categoryLabel  = unit.category === "local" ? "Local comercial" : "Habitación";

  return `
    <div class="detail-grid">
      <div class="detail-card">
        <div class="detail-card-header">
          <span class="detail-card-title"><i data-lucide="${unit.category === "local" ? "store" : "door-open"}"></i>${categoryLabel}</span>
          <button class="card-edit-btn" data-action="edit-unit" data-id="${unit.id}"><i data-lucide="pencil"></i>Editar</button>
        </div>
        <div class="summary-row">
          <span class="summary-price">${priceFormatted}</span>
          <span class="summary-price-sub">/ mes</span>
        </div>
        <span class="unit-status-badge" data-status="${unit.status}">
          <span class="dot"></span>${capitalize(unit.status)}
        </span>
        <div class="detail-data-list" style="margin-top:1rem">
          ${unit.area ? `<div class="detail-data-row"><span class="detail-data-label"><i data-lucide="square"></i>Área</span><span class="detail-data-value">${unit.area} m²</span></div>` : ""}
          <div class="detail-data-row"><span class="detail-data-label"><i data-lucide="hash"></i>Identificador</span><span class="detail-data-value">${unit.label}</span></div>
        </div>
        ${unit.description ? `<div style="margin-top:.85rem"><p class="notes-text">${unit.description}</p></div>` : ""}
      </div>

      <div class="detail-card">
        <div class="detail-card-header">
          <span class="detail-card-title"><i data-lucide="user"></i>Inquilino</span>
          <button class="card-edit-btn" data-action="edit-unit" data-id="${unit.id}"><i data-lucide="pencil"></i>Editar</button>
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
            ${unit.tenant.phone ? `<div class="detail-data-row"><span class="detail-data-label"><i data-lucide="phone"></i>Teléfono</span><span class="detail-data-value">${unit.tenant.phone}</span></div>` : ""}
            ${unit.tenant.email ? `<div class="detail-data-row"><span class="detail-data-label"><i data-lucide="mail"></i>Correo</span><span class="detail-data-value">${unit.tenant.email}</span></div>` : ""}
          </div>
          ${leaseWarning ? `<div class="lease-alert"><i data-lucide="alert-triangle"></i>El contrato vence en menos de 30 días.</div>` : ""}
        ` : `
          <div class="tenant-empty">
            <i data-lucide="user-x"></i>
            <p>Sin inquilino asignado</p>
          </div>
        `}
      </div>

      ${unit.notes ? `
      <div class="detail-card full-width">
        <div class="detail-card-header">
          <span class="detail-card-title"><i data-lucide="file-text"></i>Notas</span>
        </div>
        <p class="notes-text">${unit.notes}</p>
      </div>` : ""}
    </div>
  `;
}

// ── Listeners de acciones en el panel ────────────────────────
function bindDetailActions(container, unit, isSingle) {
  container.querySelectorAll("[data-action='edit-unit']").forEach(btn => {
    btn.addEventListener("click", () => openEditUnitModal(unit));
  });
  container.querySelectorAll("[data-action='edit-prop']").forEach(btn => {
    btn.addEventListener("click", () => openEditPropModal());
  });
  container.querySelectorAll("[data-action='edit-tenant-single']").forEach(btn => {
    btn.addEventListener("click", () => openEditPropModal());
  });
}

// ── Modal editar propiedad ────────────────────────────────────
function openEditPropModal() {
  document.getElementById("ePropName").value     = currentProp.name;
  document.getElementById("ePropType").value     = currentProp.type;
  document.getElementById("ePropLocation").value = currentProp.location;
  document.getElementById("ePropStatus").value   = currentProp.status;
  document.getElementById("ePropDescription").value = currentProp.description || "";

  // Precio solo si rentMode completo
  const priceGroup = document.getElementById("ePropPriceGroup");
  if (priceGroup) priceGroup.hidden = currentProp.rentMode !== "completo";
  const priceInput = document.getElementById("ePropPrice");
  if (priceInput) priceInput.value = currentProp.price || "";

  showModal(modalEditProp);
}

[editPropClose, editPropCancel].forEach(b => b?.addEventListener("click", () => hideModal(modalEditProp)));
modalEditProp.addEventListener("click", e => { if (e.target === modalEditProp) hideModal(modalEditProp); });

editPropForm.addEventListener("submit", async e => {
  e.preventDefault();
  editPropSubmit.disabled = true;
  editPropSubmit.textContent = "Guardando…";

  const data = {
    name:        document.getElementById("ePropName").value.trim(),
    location:    document.getElementById("ePropLocation").value.trim(),
    status:      document.getElementById("ePropStatus").value,
    description: document.getElementById("ePropDescription").value.trim(),
  };

  if (currentProp.rentMode === "completo") {
    data.price = Number(document.getElementById("ePropPrice")?.value) || null;
  }

  try {
    await updateProperty(propId, data);
    currentProp = { ...currentProp, ...data };
    renderHeader(currentProp);

    // Re-renderizar detalle si es vista completa
    if (currentProp.rentMode === "completo") {
      singleDetail.innerHTML = buildSingleHTML(currentProp);
      bindDetailActions(singleDetail, null, true);
    }
    lucide.createIcons();
    hideModal(modalEditProp);
  } catch (err) {
    console.error("Error actualizando propiedad:", err);
  } finally {
    editPropSubmit.disabled = false;
    editPropSubmit.textContent = "Guardar Cambios";
  }
});

// ── Modal editar unidad ───────────────────────────────────────
function openEditUnitModal(unit) {
  if (!unit) return;
  editUnitTitle.textContent = `Editar — ${unit.label}`;
  document.getElementById("editUnitId").value   = unit.id;
  document.getElementById("eUnitLabel").value   = unit.label;
  document.getElementById("eUnitStatus").value  = unit.status;
  document.getElementById("eUnitPrice").value   = unit.price || "";
  document.getElementById("eUnitArea").value    = unit.area  || "";
  document.getElementById("eUnitDesc").value    = unit.description || "";
  document.getElementById("eTenantName").value  = unit.tenant?.name  || "";
  document.getElementById("eTenantPhone").value = unit.tenant?.phone || "";
  document.getElementById("eTenantEmail").value = unit.tenant?.email || "";
  document.getElementById("eLeaseEnd").value    = unit.tenant?.leaseEnd || "";
  document.getElementById("eUnitNotes").value   = unit.notes || "";
  showModal(modalEditUnit);
}

[editUnitClose, editUnitCancel].forEach(b => b?.addEventListener("click", () => hideModal(modalEditUnit)));
modalEditUnit.addEventListener("click", e => { if (e.target === modalEditUnit) hideModal(modalEditUnit); });

editUnitForm.addEventListener("submit", async e => {
  e.preventDefault();
  const submitBtn = editUnitForm.querySelector('[type="submit"]');
  submitBtn.disabled = true; submitBtn.textContent = "Guardando…";

  const unitId = document.getElementById("editUnitId").value;
  const data = {
    label:       document.getElementById("eUnitLabel").value.trim(),
    status:      document.getElementById("eUnitStatus").value,
    price:       Number(document.getElementById("eUnitPrice").value) || 0,
    area:        Number(document.getElementById("eUnitArea").value)  || null,
    description: document.getElementById("eUnitDesc").value.trim(),
    notes:       document.getElementById("eUnitNotes").value.trim(),
    tenant: {
      name:     document.getElementById("eTenantName").value.trim(),
      phone:    document.getElementById("eTenantPhone").value.trim(),
      email:    document.getElementById("eTenantEmail").value.trim(),
      leaseEnd: document.getElementById("eLeaseEnd").value || null,
    },
  };
  if (!data.tenant.name) data.tenant = null;

  try {
    await updateUnit(propId, unitId, data);
    const idx = currentUnits.findIndex(u => u.id === unitId);
    if (idx !== -1) currentUnits[idx] = { ...currentUnits[idx], ...data };
    renderUnitsBar(currentUnits, currentProp);
    selectUnit(unitId);
    lucide.createIcons();
    hideModal(modalEditUnit);
  } catch (err) {
    console.error("Error actualizando unidad:", err);
  } finally {
    submitBtn.disabled = false; submitBtn.textContent = "Guardar Unidad";
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
function getInitials(n) { return (n||"").split(" ").filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join(""); }
function formatDate(d) { if (!d) return ""; return new Date(d+"T00:00:00").toLocaleDateString("es-MX",{day:"2-digit",month:"short",year:"numeric"}); }
function isLeaseClose(d) { if (!d) return false; const diff = new Date(d)-new Date(); return diff > 0 && diff < 30*24*60*60*1000; }
