// ============================================================
//  FLOAST — propertyService.js
//  Capa de datos para propiedades.
//  Mismo patrón: mock hoy, Firestore mañana.
//
//  MODELO:
//  type:         "vivienda" | "edificio"
//  rentMode:     "completo" | "individual"
//  buildingType: "normal" | "hibrido"  (solo edificios)
//  price:        número global (solo rentMode === "completo")
//  description:  descripción general
//  status:       "disponible" | "rentada" | "mantenimiento"
// ============================================================

// ── Descomentar cuando Firestore esté listo ──────────────────
// import { auth } from "./firebase.js";
// import { getFirestore, collection, doc, getDocs,
//          addDoc, updateDoc, deleteDoc, getDoc,
//          query, where, serverTimestamp }
//   from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// const db = getFirestore();
// ─────────────────────────────────────────────────────────────

// ── MOCK ─────────────────────────────────────────────────────
let MOCK_PROPERTIES = [
  // Vivienda rentada completa
  {
    id:           "prop_1",
    name:         "Casa las Torres",
    type:         "vivienda",
    rentMode:     "completo",
    buildingType: null,
    location:     "Col. Centro",
    description:  "Casa de un piso con 3 habitaciones, 2 baños, sala, comedor y cocina integral. Cuenta con patio trasero y estacionamiento para 1 auto.",
    habCount:     3,
    localCount:   0,
    price:        8500,
    status:       "rentada",
    ownerId:      "mock_user",
    createdAt:    new Date("2024-01-15"),
  },
  // Vivienda rentada por habitaciones individuales
  {
    id:           "prop_2",
    name:         "Casa Madero",
    type:         "vivienda",
    rentMode:     "individual",
    buildingType: null,
    location:     "Fco. I. Madero",
    description:  "Casa amplia dividida en 4 habitaciones independientes con baño compartido, cocina y área de lavado de uso común.",
    habCount:     4,
    localCount:   0,
    price:        null,
    status:       "disponible",
    ownerId:      "mock_user",
    createdAt:    new Date("2024-03-08"),
  },
  // Edificio normal, renta individual por habitaciones
  {
    id:           "prop_3",
    name:         "Edificio Antonieta",
    type:         "edificio",
    rentMode:     "individual",
    buildingType: "normal",
    location:     "Av. Juárez",
    description:  "Edificio de 3 pisos con 12 habitaciones amuebladas, baño privado en cada una, área de lavandería común y acceso controlado.",
    habCount:     12,
    localCount:   0,
    price:        null,
    status:       "rentada",
    ownerId:      "mock_user",
    createdAt:    new Date("2024-06-21"),
  },
  // Edificio híbrido, renta individual (habitaciones + locales)
  {
    id:           "prop_4",
    name:         "Edificio Juárez Centro",
    type:         "edificio",
    rentMode:     "individual",
    buildingType: "hibrido",
    location:     "Av. Juárez 45",
    description:  "Edificio mixto de 4 pisos: planta baja con 4 locales comerciales, pisos 1-3 con 8 habitaciones. Ideal para emprendimientos y renta habitacional.",
    habCount:     8,
    localCount:   4,
    price:        null,
    status:       "disponible",
    ownerId:      "mock_user",
    createdAt:    new Date("2024-09-10"),
  },
  // Edificio rentado completo
  {
    id:           "prop_5",
    name:         "Edificio Norte",
    type:         "edificio",
    rentMode:     "completo",
    buildingType: "normal",
    location:     "Col. Norte",
    description:  "Edificio completo de 2 pisos con 6 habitaciones, ideal para empresas que requieren alojamiento para su personal.",
    habCount:     6,
    localCount:   0,
    price:        18000,
    status:       "rentada",
    ownerId:      "mock_user",
    createdAt:    new Date("2024-11-01"),
  },
];

let mockIdCounter = 6;
// ─────────────────────────────────────────────────────────────


export async function getProperties() {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(350);
  return [...MOCK_PROPERTIES];
  // ── FIRESTORE ───────────────────────────────────────────────
  // const q = query(collection(db,"properties"), where("ownerId","==",auth.currentUser.uid));
  // const snap = await getDocs(q);
  // return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function getPropertyById(id) {
  // ── MOCK ────────────────────────────────────────────────────
  const found = MOCK_PROPERTIES.find(p => p.id === id);
  return found ? { ...found } : null;
  // ── FIRESTORE ───────────────────────────────────────────────
  // const snap = await getDoc(doc(db,"properties",id));
  // return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}


export async function addProperty(data) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(500);
  const newProp = { id: `prop_${mockIdCounter++}`, ownerId: "mock_user", createdAt: new Date(), ...data };
  MOCK_PROPERTIES.push(newProp);
  return { ...newProp };
  // ── FIRESTORE ───────────────────────────────────────────────
  // const ref = await addDoc(collection(db,"properties"), { ...data, ownerId: auth.currentUser.uid, createdAt: serverTimestamp() });
  // return { id: ref.id, ...data };
}


export async function updateProperty(id, data) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(400);
  const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (idx === -1) throw new Error("Propiedad no encontrada.");
  MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...data };
  // ── FIRESTORE ───────────────────────────────────────────────
  // await updateDoc(doc(db,"properties",id), { ...data, updatedAt: serverTimestamp() });
}


export async function deleteProperty(id) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(400);
  MOCK_PROPERTIES = MOCK_PROPERTIES.filter(p => p.id !== id);
  // ── FIRESTORE ───────────────────────────────────────────────
  // await deleteDoc(doc(db,"properties",id));
}


function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }