// ============================================================
//  FLOAST — auth.js
//  Capa de abstracción de autenticación.
//
//  CÓMO FUNCIONA:
//  - Hoy: cada función simula la respuesta (modo mock).
//  - Cuando tengas Firebase: descomenta el bloque "── FIREBASE ──"
//    y comenta/elimina el bloque "── MOCK ──" de cada función.
//  - login.js y el resto de la app nunca cambian.
//
//  FLUJO:
//  login.js  →  loginUser()   →  Firebase Auth (o mock)
//  login.js  →  logoutUser()  →  Firebase Auth (o mock)
//  new_user.js → registerUser() → Firebase Auth (o mock)
// ============================================================


// ── Descomentar cuando Firebase esté configurado ──────────────
// import { auth } from "./firebase.js";
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged,
//   sendPasswordResetEmail,
// } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
// ─────────────────────────────────────────────────────────────


// ── MOCK — usuarios de prueba mientras no hay Firebase ────────
const MOCK_USERS = [
  { email: "admin@floast.com", password: "Admin123!", name: "Admin" },
  { email: "prueba@floast.com", password: "Prueba123!", name: "Usuario Prueba" },
];
// ─────────────────────────────────────────────────────────────


/**
 * Inicia sesión con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { email: string, name: string } }>}
 */
export async function loginUser(email, password) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(900); // simula latencia de red
  const found = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!found) {
    throw { code: "auth/invalid-credential" };
  }
  return { user: { email: found.email, name: found.name } };
  // ──────────────────────────────────────────────────────────

  // ── FIREBASE — descomentar y eliminar el bloque MOCK ──────
  // const credential = await signInWithEmailAndPassword(auth, email, password);
  // return { user: credential.user };
  // ──────────────────────────────────────────────────────────
}


/**
 * Registra un nuevo usuario con email y contraseña.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: { email: string } }>}
 */
export async function registerUser(email, password) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(1000);
  const exists = MOCK_USERS.some((u) => u.email === email);
  if (exists) {
    throw { code: "auth/email-already-in-use" };
  }
  MOCK_USERS.push({ email, password, name: "Nuevo Usuario" });
  return { user: { email } };
  // ──────────────────────────────────────────────────────────

  // ── FIREBASE — descomentar y eliminar el bloque MOCK ──────
  // const credential = await createUserWithEmailAndPassword(auth, email, password);
  // return { user: credential.user };
  // ──────────────────────────────────────────────────────────
}


/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export async function logoutUser() {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(300);
  sessionStorage.removeItem("floast_user");
  return;
  // ──────────────────────────────────────────────────────────

  // ── FIREBASE — descomentar y eliminar el bloque MOCK ──────
  // await signOut(auth);
  // ──────────────────────────────────────────────────────────
}


/**
 * Envía un correo de recuperación de contraseña.
 * @param {string} email
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {

  // ── MOCK ──────────────────────────────────────────────────
  await _delay(800);
  const exists = MOCK_USERS.some((u) => u.email === email);
  if (!exists) {
    throw { code: "auth/user-not-found" };
  }
  console.info(`[Mock] Correo de recuperación enviado a: ${email}`);
  return;
  // ──────────────────────────────────────────────────────────

  // ── FIREBASE — descomentar y eliminar el bloque MOCK ──────
  // await sendPasswordResetEmail(auth, email);
  // ──────────────────────────────────────────────────────────
}


/**
 * Observa el estado de sesión. Llama a callback(user) cuando cambia.
 * user es el objeto del usuario o null si no hay sesión.
 * @param {function} callback
 * @returns {function} unsubscribe — llama a esta función para dejar de escuchar
 */
export function onAuthChange(callback) {

  // ── MOCK ──────────────────────────────────────────────────
  const stored = sessionStorage.getItem("floast_user");
  callback(stored ? JSON.parse(stored) : null);
  // Devuelve un unsubscribe vacío para mantener la misma API
  return () => {};
  // ──────────────────────────────────────────────────────────

  // ── FIREBASE — descomentar y eliminar el bloque MOCK ──────
  // return onAuthStateChanged(auth, callback);
  // ──────────────────────────────────────────────────────────
}


// ── Mensajes de error en español ─────────────────────────────
// Mapea los códigos de error de Firebase a mensajes amigables.
// Funcionan igual con el mock porque usamos los mismos códigos.
export function getAuthErrorMessage(code) {
  const messages = {
    "auth/invalid-credential":     "Correo o contraseña incorrectos.",
    "auth/user-not-found":         "No existe una cuenta con ese correo.",
    "auth/wrong-password":         "Contraseña incorrecta.",
    "auth/email-already-in-use":   "Ya existe una cuenta con ese correo.",
    "auth/weak-password":          "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email":          "El formato del correo no es válido.",
    "auth/too-many-requests":      "Demasiados intentos. Espera unos minutos.",
    "auth/network-request-failed": "Sin conexión. Revisa tu internet.",
    "auth/user-disabled":          "Esta cuenta ha sido deshabilitada.",
  };
  return messages[code] ?? "Ocurrió un error inesperado. Intenta de nuevo.";
}


// ── Utilidad interna ──────────────────────────────────────────
function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}