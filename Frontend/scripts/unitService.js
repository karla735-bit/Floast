// ============================================================
//  FLOAST — unitService.js
//  Capa de datos para unidades/habitaciones de una propiedad.
//  Mismo patrón que propertyService: mock hoy, Firestore mañana.
//
//  Para conectar Firestore:
//  1. Descomenta los bloques ── FIRESTORE ──
//  2. Comenta/elimina los bloques ── MOCK ──
// ============================================================

// ── Descomentar cuando Firestore esté listo ──────────────────
// import { auth }  from "./firebase.js";
// import { getFirestore, collection, doc,
//          getDocs, addDoc, updateDoc, deleteDoc,
//          serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// const db = getFirestore();
// ─────────────────────────────────────────────────────────────


// ── MOCK — unidades por propiedad ─────────────────────────────
// La clave es el propId. Cada propiedad tiene su lista de unidades.
const MOCK_UNITS = {

  // Casa las Torres — tipo casa, 3 habitaciones
  prop_1: [
    {
      id:     "unit_1_1",
      propId: "prop_1",
      label:  "Habitación 1",
      status: "rentada",
      price:  3000,
      area:   18,
      notes:  "Baño compartido. Incluye agua y luz.",
      tenant: {
        name:     "Carlos Mendoza Ruiz",
        phone:    "+52 7441234567",
        email:    "carlos.mendoza@gmail.com",
        leaseEnd: "2025-08-31",
      },
    },
    {
      id:     "unit_1_2",
      propId: "prop_1",
      label:  "Habitación 2",
      status: "rentada",
      price:  2800,
      area:   15,
      notes:  "Baño compartido.",
      tenant: {
        name:     "Ana Sofía García",
        phone:    "+52 7449876543",
        email:    "asofia.garcia@hotmail.com",
        leaseEnd: "2025-06-15",
      },
    },
    {
      id:     "unit_1_3",
      propId: "prop_1",
      label:  "Habitación 3",
      status: "disponible",
      price:  2700,
      area:   14,
      notes:  "",
      tenant: null,
    },
  ],

  // Condominio Francisco — 6 departamentos
  prop_2: [
    {
      id:     "unit_2_1",
      propId: "prop_2",
      label:  "Depto 1A",
      status: "rentada",
      price:  4200,
      area:   55,
      notes:  "2 recámaras. Incluye estacionamiento.",
      tenant: {
        name:     "Roberto Juárez López",
        phone:    "+52 7445551234",
        email:    "roberto.juarez@empresa.com",
        leaseEnd: "2025-12-31",
      },
    },
    {
      id:     "unit_2_2",
      propId: "prop_2",
      label:  "Depto 1B",
      status: "disponible",
      price:  3800,
      area:   48,
      notes:  "1 recámara.",
      tenant: null,
    },
    {
      id:     "unit_2_3",
      propId: "prop_2",
      label:  "Depto 2A",
      status: "rentada",
      price:  4200,
      area:   55,
      notes:  "",
      tenant: {
        name:     "Patricia Vega Morales",
        phone:    "+52 7443334455",
        email:    "pvega@gmail.com",
        leaseEnd: "2025-09-30",
      },
    },
    {
      id:     "unit_2_4",
      propId: "prop_2",
      label:  "Depto 2B",
      status: "mantenimiento",
      price:  3800,
      area:   48,
      notes:  "En reparación de tuberías.",
      tenant: null,
    },
    {
      id:     "unit_2_5",
      propId: "prop_2",
      label:  "Depto 3A",
      status: "disponible",
      price:  4500,
      area:   60,
      notes:  "Piso más alto, mejor vista.",
      tenant: null,
    },
    {
      id:     "unit_2_6",
      propId: "prop_2",
      label:  "Depto 3B",
      status: "rentada",
      price:  4000,
      area:   50,
      notes:  "",
      tenant: {
        name:     "Miguel Ángel Torres",
        phone:    "+52 7447778899",
        email:    "ma.torres@outlook.com",
        leaseEnd: "2026-01-15",
      },
    },
  ],

  // Edificio Antonieta — 12 oficinas
  prop_3: [
    { id: "unit_3_1",  propId: "prop_3", label: "Oficina 101", status: "rentada",       price: 1200, area: 22, notes: "", tenant: { name: "Despacho Fiscal Reyes",   phone: "+52 7441112233", email: "fiscal.reyes@gmail.com",   leaseEnd: "2025-11-30" } },
    { id: "unit_3_2",  propId: "prop_3", label: "Oficina 102", status: "disponible",    price: 1000, area: 18, notes: "", tenant: null },
    { id: "unit_3_3",  propId: "prop_3", label: "Oficina 103", status: "rentada",       price: 1200, area: 22, notes: "", tenant: { name: "Consultoría Peña & Asoc.", phone: "+52 7442223344", email: "pena.asoc@empresa.mx",     leaseEnd: "2026-03-01" } },
    { id: "unit_3_4",  propId: "prop_3", label: "Oficina 104", status: "mantenimiento", price: 1000, area: 18, notes: "Pintura y electricidad.", tenant: null },
    { id: "unit_3_5",  propId: "prop_3", label: "Oficina 201", status: "rentada",       price: 1400, area: 28, notes: "", tenant: { name: "Estudio Legal Moreno",    phone: "+52 7443334455", email: "legal.moreno@hotmail.com", leaseEnd: "2025-07-31" } },
    { id: "unit_3_6",  propId: "prop_3", label: "Oficina 202", status: "rentada",       price: 1400, area: 28, notes: "", tenant: { name: "Arquitectos DG",          phone: "+52 7444445566", email: "dg.arq@gmail.com",        leaseEnd: "2025-10-15" } },
    { id: "unit_3_7",  propId: "prop_3", label: "Oficina 203", status: "disponible",    price: 1300, area: 25, notes: "", tenant: null },
    { id: "unit_3_8",  propId: "prop_3", label: "Oficina 204", status: "rentada",       price: 1300, area: 25, notes: "", tenant: { name: "Contadores Hernández",    phone: "+52 7445556677", email: "cont.hdz@empresa.com",     leaseEnd: "2026-02-28" } },
    { id: "unit_3_9",  propId: "prop_3", label: "Oficina 301", status: "disponible",    price: 1600, area: 35, notes: "Piso directivo.", tenant: null },
    { id: "unit_3_10", propId: "prop_3", label: "Oficina 302", status: "rentada",       price: 1600, area: 35, notes: "", tenant: { name: "Notaría Pública 42",     phone: "+52 7446667788", email: "notaria42@notarias.mx",    leaseEnd: "2026-06-30" } },
    { id: "unit_3_11", propId: "prop_3", label: "Oficina 303", status: "rentada",       price: 1500, area: 30, notes: "", tenant: { name: "Clínica Dental Soria",   phone: "+52 7447778899", email: "dental.soria@salud.mx",    leaseEnd: "2025-12-01" } },
    { id: "unit_3_12", propId: "prop_3", label: "Oficina 304", status: "disponible",    price: 1500, area: 30, notes: "", tenant: null },
  ],
};

let unitIdCounter = 100;
// ─────────────────────────────────────────────────────────────


/**
 * Obtiene todas las unidades de una propiedad.
 * @param {string} propId
 * @returns {Promise<Unit[]>}
 */
export async function getUnits(propId) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(250);
  // Si la propiedad no tiene unidades registradas, devuelve []
  return [...(MOCK_UNITS[propId] ?? [])];
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // const snap = await getDocs(collection(db, "properties", propId, "units"));
  // return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // ──────────────────────────────────────────────────────────
}


/**
 * Actualiza una unidad.
 * @param {string} propId
 * @param {string} unitId
 * @param {Partial<Unit>} data
 * @returns {Promise<void>}
 */
export async function updateUnit(propId, unitId, data) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(400);
  if (!MOCK_UNITS[propId]) throw new Error("Propiedad no encontrada.");
  const idx = MOCK_UNITS[propId].findIndex(u => u.id === unitId);
  if (idx === -1) throw new Error("Unidad no encontrada.");
  MOCK_UNITS[propId][idx] = { ...MOCK_UNITS[propId][idx], ...data };
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // await updateDoc(doc(db, "properties", propId, "units", unitId), {
  //   ...data,
  //   updatedAt: serverTimestamp(),
  // });
  // ──────────────────────────────────────────────────────────
}


/**
 * Agrega una unidad a una propiedad.
 * @param {string} propId
 * @param {Omit<Unit, 'id' | 'propId'>} data
 * @returns {Promise<Unit>}
 */
export async function addUnit(propId, data) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(400);
  if (!MOCK_UNITS[propId]) MOCK_UNITS[propId] = [];
  const newUnit = { id: `unit_mock_${unitIdCounter++}`, propId, ...data };
  MOCK_UNITS[propId].push(newUnit);
  return { ...newUnit };
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // const ref = await addDoc(collection(db, "properties", propId, "units"), {
  //   ...data,
  //   propId,
  //   createdAt: serverTimestamp(),
  // });
  // return { id: ref.id, propId, ...data };
  // ──────────────────────────────────────────────────────────
}


/**
 * Elimina una unidad.
 * @param {string} propId
 * @param {string} unitId
 * @returns {Promise<void>}
 */
export async function deleteUnit(propId, unitId) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(350);
  if (!MOCK_UNITS[propId]) return;
  MOCK_UNITS[propId] = MOCK_UNITS[propId].filter(u => u.id !== unitId);
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // await deleteDoc(doc(db, "properties", propId, "units", unitId));
  // ──────────────────────────────────────────────────────────
}


// ── Utilidad interna ──────────────────────────────────────────
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}