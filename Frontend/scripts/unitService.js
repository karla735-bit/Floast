// ============================================================
//  FLOAST — unitService.js
//  Capa de datos para unidades de una propiedad.
//
//  MODELO de unidad:
//  label:    string           — nombre/número ("Hab. 1", "Local A")
//  category: "habitacion" | "local"  — solo en edificios híbridos
//  status:   "disponible" | "rentada" | "mantenimiento"
//  price:    number           — solo en rentMode "individual"
//  area:     number | null
//  description: string        — descripción propia de la unidad
//  tenant:   object | null
// ============================================================

// ── Descomentar cuando Firestore esté listo ──────────────────
// import { getFirestore, collection, doc, getDocs,
//          addDoc, updateDoc, deleteDoc, serverTimestamp }
//   from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
// const db = getFirestore();
// ─────────────────────────────────────────────────────────────

// ── MOCK ─────────────────────────────────────────────────────
const MOCK_UNITS = {

  // prop_1: vivienda completa → sin unidades (se muestra como ficha única)

  // prop_2: vivienda individual → 4 habitaciones
  prop_2: [
    { id:"u2_1", propId:"prop_2", label:"Habitación 1", category:"habitacion", status:"rentada",    price:2200, area:16, description:"Habitación con cama matrimonial, closet amplio y ventana exterior.", tenant:{ name:"Laura Pérez Díaz",    phone:"+52 7441112233", email:"laura.pd@gmail.com",   leaseEnd:"2025-09-30" } },
    { id:"u2_2", propId:"prop_2", label:"Habitación 2", category:"habitacion", status:"rentada",    price:2000, area:14, description:"Habitación individual con escritorio y closet.", tenant:{ name:"Marco Ríos Soto",    phone:"+52 7442223344", email:"marco.rios@gmail.com",  leaseEnd:"2025-08-15" } },
    { id:"u2_3", propId:"prop_2", label:"Habitación 3", category:"habitacion", status:"disponible", price:1900, area:13, description:"Habitación individual, ideal para estudiante.", tenant:null },
    { id:"u2_4", propId:"prop_2", label:"Habitación 4", category:"habitacion", status:"disponible", price:2100, area:15, description:"Habitación amplia con baño semi-privado.", tenant:null },
  ],

  // prop_3: edificio normal individual → 12 habitaciones
  prop_3: [
    { id:"u3_1",  propId:"prop_3", label:"Hab. 101", category:"habitacion", status:"rentada",       price:1200, area:18, description:"Habitación primer piso, baño privado, vista al jardín.",    tenant:{ name:"Carlos Vega",      phone:"+52 7443334455", email:"cvega@mail.com",       leaseEnd:"2025-11-30" } },
    { id:"u3_2",  propId:"prop_3", label:"Hab. 102", category:"habitacion", status:"disponible",    price:1200, area:18, description:"Habitación primer piso, baño privado.",                    tenant:null },
    { id:"u3_3",  propId:"prop_3", label:"Hab. 103", category:"habitacion", status:"rentada",       price:1200, area:18, description:"Habitación primer piso, baño privado.",                    tenant:{ name:"Sofía Lara",       phone:"+52 7444445566", email:"sofia.l@mail.com",      leaseEnd:"2026-01-31" } },
    { id:"u3_4",  propId:"prop_3", label:"Hab. 104", category:"habitacion", status:"mantenimiento", price:1100, area:16, description:"Habitación en reparación.",                                tenant:null },
    { id:"u3_5",  propId:"prop_3", label:"Hab. 201", category:"habitacion", status:"rentada",       price:1300, area:20, description:"Segundo piso, mejor ventilación, baño privado.",           tenant:{ name:"Andrés Mora",      phone:"+52 7445556677", email:"andres.m@mail.com",     leaseEnd:"2025-10-15" } },
    { id:"u3_6",  propId:"prop_3", label:"Hab. 202", category:"habitacion", status:"rentada",       price:1300, area:20, description:"Segundo piso, baño privado, closet amplio.",               tenant:{ name:"Diana Cruz",       phone:"+52 7446667788", email:"diana.c@mail.com",      leaseEnd:"2026-03-01" } },
    { id:"u3_7",  propId:"prop_3", label:"Hab. 203", category:"habitacion", status:"disponible",    price:1300, area:20, description:"Segundo piso, baño privado.",                              tenant:null },
    { id:"u3_8",  propId:"prop_3", label:"Hab. 204", category:"habitacion", status:"rentada",       price:1300, area:20, description:"Segundo piso, baño privado.",                              tenant:{ name:"Roberto Juárez",   phone:"+52 7447778899", email:"rjuarez@mail.com",      leaseEnd:"2025-12-31" } },
    { id:"u3_9",  propId:"prop_3", label:"Hab. 301", category:"habitacion", status:"rentada",       price:1400, area:22, description:"Tercer piso, vista panorámica, baño privado.",             tenant:{ name:"Patricia Nava",    phone:"+52 7448889900", email:"p.nava@mail.com",       leaseEnd:"2026-02-28" } },
    { id:"u3_10", propId:"prop_3", label:"Hab. 302", category:"habitacion", status:"disponible",    price:1400, area:22, description:"Tercer piso, baño privado.",                               tenant:null },
    { id:"u3_11", propId:"prop_3", label:"Hab. 303", category:"habitacion", status:"rentada",       price:1400, area:22, description:"Tercer piso, baño privado, escritorio incluido.",          tenant:{ name:"Miguel Torres",    phone:"+52 7449990011", email:"m.torres@mail.com",     leaseEnd:"2025-07-31" } },
    { id:"u3_12", propId:"prop_3", label:"Hab. 304", category:"habitacion", status:"disponible",    price:1400, area:22, description:"Tercer piso, baño privado.",                               tenant:null },
  ],

  // prop_4: edificio híbrido individual → 4 locales + 8 habitaciones
  prop_4: [
    { id:"u4_1", propId:"prop_4", label:"Local A",   category:"local",       status:"rentada",    price:4500, area:35, description:"Local esquinero en planta baja, escaparate doble, baño propio.", tenant:{ name:"Panadería El Sol",     phone:"+52 7441234567", email:"panaderia.sol@mail.com", leaseEnd:"2025-12-31" } },
    { id:"u4_2", propId:"prop_4", label:"Local B",   category:"local",       status:"disponible", price:3800, area:28, description:"Local interior planta baja, ideal para oficina o estética.",    tenant:null },
    { id:"u4_3", propId:"prop_4", label:"Local C",   category:"local",       status:"rentada",    price:4000, area:30, description:"Local con acceso directo a la calle, baño propio.",              tenant:{ name:"Consultorio Médico",   phone:"+52 7449876543", email:"consultorio@mail.com",   leaseEnd:"2026-06-30" } },
    { id:"u4_4", propId:"prop_4", label:"Local D",   category:"local",       status:"disponible", price:3500, area:25, description:"Local pequeño, ideal para emprendimiento.",                      tenant:null },
    { id:"u4_5", propId:"prop_4", label:"Hab. 1-A",  category:"habitacion",  status:"rentada",    price:1500, area:18, description:"Primer piso, habitación amueblada con baño privado.",            tenant:{ name:"Ana García",           phone:"+52 7445551234", email:"ana.g@mail.com",          leaseEnd:"2025-09-15" } },
    { id:"u4_6", propId:"prop_4", label:"Hab. 1-B",  category:"habitacion",  status:"disponible", price:1500, area:18, description:"Primer piso, habitación amueblada con baño privado.",            tenant:null },
    { id:"u4_7", propId:"prop_4", label:"Hab. 2-A",  category:"habitacion",  status:"rentada",    price:1600, area:20, description:"Segundo piso, mejor vista, baño privado.",                       tenant:{ name:"Luis Mendoza",         phone:"+52 7443334455", email:"luis.m@mail.com",         leaseEnd:"2026-01-15" } },
    { id:"u4_8", propId:"prop_4", label:"Hab. 2-B",  category:"habitacion",  status:"disponible", price:1600, area:20, description:"Segundo piso, baño privado.",                                    tenant:null },
    { id:"u4_9", propId:"prop_4", label:"Hab. 3-A",  category:"habitacion",  status:"rentada",    price:1700, area:22, description:"Tercer piso, baño privado, excelente ventilación.",              tenant:{ name:"Fernanda López",       phone:"+52 7447778899", email:"fer.lopez@mail.com",      leaseEnd:"2025-11-30" } },
    { id:"u4_10",propId:"prop_4", label:"Hab. 3-B",  category:"habitacion",  status:"disponible", price:1700, area:22, description:"Tercer piso, baño privado.",                                    tenant:null },
    { id:"u4_11",propId:"prop_4", label:"Hab. 4-A",  category:"habitacion",  status:"disponible", price:1800, area:24, description:"Cuarto piso, vista completa, baño privado.",                    tenant:null },
    { id:"u4_12",propId:"prop_4", label:"Hab. 4-B",  category:"habitacion",  status:"disponible", price:1800, area:24, description:"Cuarto piso, baño privado.",                                    tenant:null },
  ],

  // prop_5: edificio completo → sin unidades individuales
};

let unitIdCounter = 200;
// ─────────────────────────────────────────────────────────────


export async function getUnits(propId) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(250);
  return [...(MOCK_UNITS[propId] ?? [])];
  // ── FIRESTORE ───────────────────────────────────────────────
  // const snap = await getDocs(collection(db,"properties",propId,"units"));
  // return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function updateUnit(propId, unitId, data) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(350);
  if (!MOCK_UNITS[propId]) throw new Error("Propiedad no encontrada.");
  const idx = MOCK_UNITS[propId].findIndex(u => u.id === unitId);
  if (idx === -1) throw new Error("Unidad no encontrada.");
  MOCK_UNITS[propId][idx] = { ...MOCK_UNITS[propId][idx], ...data };
  // ── FIRESTORE ───────────────────────────────────────────────
  // await updateDoc(doc(db,"properties",propId,"units",unitId), { ...data, updatedAt: serverTimestamp() });
}


export async function addUnit(propId, data) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(350);
  if (!MOCK_UNITS[propId]) MOCK_UNITS[propId] = [];
  const newUnit = { id: `unit_${unitIdCounter++}`, propId, ...data };
  MOCK_UNITS[propId].push(newUnit);
  return { ...newUnit };
  // ── FIRESTORE ───────────────────────────────────────────────
  // const ref = await addDoc(collection(db,"properties",propId,"units"), { ...data, propId, createdAt: serverTimestamp() });
  // return { id: ref.id, propId, ...data };
}


export async function deleteUnit(propId, unitId) {
  // ── MOCK ────────────────────────────────────────────────────
  await _delay(300);
  if (!MOCK_UNITS[propId]) return;
  MOCK_UNITS[propId] = MOCK_UNITS[propId].filter(u => u.id !== unitId);
  // ── FIRESTORE ───────────────────────────────────────────────
  // await deleteDoc(doc(db,"properties",propId,"units",unitId));
}


function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
