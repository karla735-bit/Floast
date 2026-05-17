// ============================================================
//  FLOAST — propertyService.js
//  Capa de abstracción de datos para propiedades.
//
//  Igual que auth.js: hoy usa mock local, mañana Firestore.
//  dashboard.js NUNCA toca Firestore directamente.
//
//  Para conectar Firestore:
//  1. Descomenta los bloques ── FIRESTORE ──
//  2. Comenta/elimina los bloques ── MOCK ──
//  3. Asegúrate de que firebase.js esté configurado
// ============================================================

// ── Descomentar cuando Firestore esté listo ──────────────────
// import { auth }       from "./firebase.js";
// import { getFirestore, collection, doc,
//          getDocs, addDoc, updateDoc,
//          deleteDoc, query, where,
//          serverTimestamp }   from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// const db = getFirestore();
// ─────────────────────────────────────────────────────────────

// ── MOCK — datos de ejemplo ───────────────────────────────────
let MOCK_PROPERTIES = [
  {
    id:       "prop_1",
    name:     "Casa las Torres",
    type:     "casa",
    location: "Col. Centro",
    units:    3,
    price:    8500,
    status:   "rentada",
    ownerId:  "mock_user",
    createdAt: new Date("2024-01-15"),
  },
  {
    id:       "prop_2",
    name:     "Condominio Francisco",
    type:     "condominio",
    location: "Fco. I. Madero",
    units:    6,
    price:    22000,
    status:   "disponible",
    ownerId:  "mock_user",
    createdAt: new Date("2024-03-08"),
  },
  {
    id:       "prop_3",
    name:     "Edificio Antonieta",
    type:     "edificio",
    location: "Av. Juárez",
    units:    12,
    price:    12000,
    status:   "rentada",
    ownerId:  "mock_user",
    createdAt: new Date("2024-06-21"),
  },
];

let mockIdCounter = 4;
// ─────────────────────────────────────────────────────────────


/**
 * Obtiene todas las propiedades del usuario actual.
 * @returns {Promise<Property[]>}
 */
export async function getProperties() {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(400);
  return [...MOCK_PROPERTIES];
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // const userId = auth.currentUser?.uid;
  // const q = query(
  //   collection(db, "properties"),
  //   where("ownerId", "==", userId)
  // );
  // const snapshot = await getDocs(q);
  // return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  // ──────────────────────────────────────────────────────────
}


/**
 * Agrega una nueva propiedad.
 * @param {Omit<Property, 'id' | 'ownerId' | 'createdAt'>} data
 * @returns {Promise<Property>}
 */
export async function addProperty(data) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(600);
  const newProp = {
    id:        `prop_${mockIdCounter++}`,
    ownerId:   "mock_user",
    createdAt: new Date(),
    ...data,
  };
  MOCK_PROPERTIES.push(newProp);
  return { ...newProp };
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // const userId = auth.currentUser?.uid;
  // const docRef = await addDoc(collection(db, "properties"), {
  //   ...data,
  //   ownerId:   userId,
  //   createdAt: serverTimestamp(),
  // });
  // return { id: docRef.id, ...data, ownerId: userId };
  // ──────────────────────────────────────────────────────────
}


/**
 * Actualiza una propiedad existente.
 * @param {string} id
 * @param {Partial<Property>} data
 * @returns {Promise<void>}
 */
export async function updateProperty(id, data) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(500);
  const idx = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (idx === -1) throw new Error("Propiedad no encontrada.");
  MOCK_PROPERTIES[idx] = { ...MOCK_PROPERTIES[idx], ...data };
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // await updateDoc(doc(db, "properties", id), {
  //   ...data,
  //   updatedAt: serverTimestamp(),
  // });
  // ──────────────────────────────────────────────────────────
}


/**
 * Elimina una propiedad.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProperty(id) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(500);
  MOCK_PROPERTIES = MOCK_PROPERTIES.filter(p => p.id !== id);
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // await deleteDoc(doc(db, "properties", id));
  // ──────────────────────────────────────────────────────────
}


// ── Utilidad interna ──────────────────────────────────────────
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Obtiene una propiedad por su id.
 * @param {string} id
 * @returns {Promise<Property | null>}
 */
export async function getPropertyById(id) {

  // ── MOCK ──────────────────────────────────────────────────
  const found = MOCK_PROPERTIES.find(p => p.id === id);
  return found ? { ...found } : null;
  // ──────────────────────────────────────────────────────────

  // ── FIRESTORE ─────────────────────────────────────────────
  // const snap = await getDoc(doc(db, "properties", id));
  // return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  // ──────────────────────────────────────────────────────────
}