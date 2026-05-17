// ============================================================
//  FLOAST — new_user.js
//  Lógica de UI del registro (2 pasos).
//  Solo habla con auth.js — nunca con Firebase directamente.
// ============================================================

import { registerUser, getAuthErrorMessage } from "./auth.js";

// ── Pasos ────────────────────────────────────────────────────
const step1El     = document.getElementById("registerStep1");
const step2El     = document.getElementById("registerStep2");
const nextBtn     = document.getElementById("nextStep1");
const backBtn     = document.getElementById("backStep2");

// ── Campos paso 1 ────────────────────────────────────────────
const firstNameInput      = document.getElementById("firstName");
const fatherLastNameInput = document.getElementById("fatherLastName");
const motherLastNameInput = document.getElementById("motherLastName");
const countryCodeSelect   = document.getElementById("countryCode");
const phoneInput          = document.getElementById("phone");

// ── Campos paso 2 ────────────────────────────────────────────
const emailInput          = document.getElementById("registerEmail");
const passwordInput       = document.getElementById("registerPassword");
const confirmInput        = document.getElementById("confirmPassword");
const togglePassword      = document.getElementById("toggleRegisterPassword");
const toggleConfirm       = document.getElementById("toggleConfirmPassword");

// ── Fortaleza ─────────────────────────────────────────────────
const strengthBar  = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

// ── Requisitos ────────────────────────────────────────────────
const reqLength    = document.getElementById("req-length");
const reqUppercase = document.getElementById("req-uppercase");
const reqNumber    = document.getElementById("req-number");
const reqSpecial   = document.getElementById("req-special");

// ── Indicador de pasos ────────────────────────────────────────
const dotStep1    = document.getElementById("dotStep1");
const dotStep2    = document.getElementById("dotStep2");
const connector   = document.getElementById("stepConnector");

// ── Navegación entre pasos ────────────────────────────────────
nextBtn.addEventListener("click", () => {
  if (!validateStep1()) return;
  goToStep(2);
});

backBtn.addEventListener("click", () => goToStep(1));

function goToStep(n) {
  if (n === 2) {
    step1El.classList.remove("active");
    step2El.classList.add("active");
    dotStep1.classList.remove("active");
    dotStep1.classList.add("completed");
    dotStep1.querySelector(".dot").textContent = "✓";
    connector.classList.add("completed");
    dotStep2.classList.add("active");
  } else {
    step2El.classList.remove("active");
    step1El.classList.add("active");
    dotStep1.classList.add("active");
    dotStep1.classList.remove("completed");
    dotStep1.querySelector(".dot").textContent = "1";
    connector.classList.remove("completed");
    dotStep2.classList.remove("active");
  }
}

// ── Validación paso 1 ─────────────────────────────────────────
function validateStep1() {
  let valid = true;

  // Nombre
  if (!firstNameInput.value.trim()) {
    showError(firstNameInput, "firstNameError", "El nombre es obligatorio.");
    valid = false;
  } else {
    clearError(firstNameInput, "firstNameError");
  }

  // Apellido paterno
  if (!fatherLastNameInput.value.trim()) {
    showError(fatherLastNameInput, "fatherLastNameError", "El apellido paterno es obligatorio.");
    valid = false;
  } else {
    clearError(fatherLastNameInput, "fatherLastNameError");
  }

  // Apellido materno — opcional, sin validación

  // Código de país
  if (!countryCodeSelect.value) {
    showError(countryCodeSelect, "phoneError", "Selecciona un país.");
    valid = false;
  } else if (!isValidPhone(phoneInput.value.trim())) {
    showError(phoneInput, "phoneError", "Ingresa un número válido (8–15 dígitos).");
    valid = false;
  } else {
    clearError(phoneInput, "phoneError");
  }

  return valid;
}

// ── Validación paso 2 ─────────────────────────────────────────
function validateStep2() {
  let valid = true;

  if (!isValidEmail(emailInput.value.trim())) {
    showError(emailInput, "registerEmailError", "Ingresa un correo válido.");
    valid = false;
  } else {
    clearError(emailInput, "registerEmailError");
  }

  const { level } = getPasswordStrength(passwordInput.value);
  if (level < 3) {
    showError(passwordInput, "registerPasswordError", "La contraseña no cumple los requisitos.");
    valid = false;
  } else {
    clearError(passwordInput, "registerPasswordError");
  }

  if (passwordInput.value !== confirmInput.value) {
    showError(confirmInput, "confirmPasswordError", "Las contraseñas no coinciden.");
    valid = false;
  } else if (confirmInput.value) {
    clearError(confirmInput, "confirmPasswordError");
  }

  return valid;
}

// ── Toggle contraseñas ────────────────────────────────────────
togglePassword.addEventListener("click", () => toggleVisibility(passwordInput, togglePassword));
toggleConfirm.addEventListener("click",  () => toggleVisibility(confirmInput,  toggleConfirm));

function toggleVisibility(input, btn) {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  btn.textContent = show ? "🙈" : "👁️";
}

// ── Fortaleza de contraseña ───────────────────────────────────
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  const { level, label } = getPasswordStrength(val);

  strengthBar.dataset.level  = val ? level : "";
  strengthText.dataset.level = val ? level : "";
  strengthText.textContent   = val ? label : "-";

  // Requisitos individuales
  updateReq(reqLength,    val.length >= 8);
  updateReq(reqUppercase, /[A-Z]/.test(val));
  updateReq(reqNumber,    /[0-9]/.test(val));
  updateReq(reqSpecial,   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val));

  // Limpiar error mientras escribe
  clearError(passwordInput, "registerPasswordError");
});

function updateReq(el, met) {
  el.classList.toggle("met", met);
  el.querySelector(".check").textContent = met ? "✓" : "✗";
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)   score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const levels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  return { level: score, label: levels[score] || "-" };
}

// ── Limpiar errores en tiempo real ────────────────────────────
[firstNameInput, fatherLastNameInput, phoneInput, emailInput, confirmInput].forEach(input => {
  input?.addEventListener("input", () => {
    const errorId = input.id + "Error";
    if (document.getElementById(errorId)) {
      clearError(input, errorId);
    }
  });
});

// ── Submit ────────────────────────────────────────────────────
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateStep2()) return;

  const submitBtn = e.target.querySelector('[type="submit"]');
  setLoading(submitBtn, true);

  // Datos que se enviarán al backend
  const userData = {
    firstName:      firstNameInput.value.trim(),
    fatherLastName: fatherLastNameInput.value.trim(),
    motherLastName: motherLastNameInput.value.trim(),
    phone:          countryCodeSelect.value + phoneInput.value.trim(),
    email:          emailInput.value.trim(),
    password:       passwordInput.value,
  };

  try {
    await registerUser(userData.email, userData.password);

    // ── Aquí puedes guardar el perfil en Firestore cuando esté listo ──
    // await saveUserProfile(userData); // función futura en auth.js

    // Redirigir al login con mensaje de éxito
    sessionStorage.setItem("floast_signup_success", "1");
    window.location.href = "login.html";

  } catch (err) {
    const message = getAuthErrorMessage(err.code);
    showError(emailInput, "registerEmailError", message);
  } finally {
    setLoading(submitBtn, false);
  }
});

// ── Helpers ───────────────────────────────────────────────────
function showError(input, errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
  input.closest(".form-group")?.classList.add("has-error");
  input.closest(".form-group")?.classList.remove("has-success");
}

function clearError(input, errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = "";
  input.closest(".form-group")?.classList.remove("has-error");
}

function setLoading(btn, loading) {
  btn.disabled     = loading;
  btn.textContent  = loading ? "Creando cuenta…" : "Crear Cuenta";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\d{8,15}$/.test(phone.replace(/\s/g, ""));
}