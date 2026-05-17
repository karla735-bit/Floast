// ============================================================
//  FLOAST — recover.js
//  Lógica de UI de recuperación de contraseña (3 pasos).
//  Solo habla con auth.js — nunca con Firebase directamente.
//
//  NOTA IMPORTANTE SOBRE EL FLUJO CON FIREBASE:
//  Firebase no usa un código OTP manual. Su flujo real es:
//    Paso 1 → sendPasswordResetEmail() envía un link al correo
//    El link lleva al usuario a una página de Firebase (o tu
//    dominio) donde cambia la contraseña directamente.
//  Por eso, cuando conectes Firebase:
//    - El paso 2 (código) desaparece o se convierte en un
//      mensaje de "revisa tu correo".
//    - El paso 3 (nueva contraseña) lo maneja Firebase en su
//      propia página, o tú con confirmPasswordReset(oobCode).
//  El mock actual simula los 3 pasos para que puedas probar
//  la UI completa mientras no hay backend.
// ============================================================

import { resetPassword, getAuthErrorMessage } from "./auth.js";

// ── Pasos ─────────────────────────────────────────────────────
const steps      = [1, 2, 3].map(n => document.getElementById(`recoverStep${n}`));
const dots       = [1, 2, 3].map(n => document.getElementById(`dotStep${n}`));
const connectors = [1, 2].map(n => document.getElementById(`stepConnector${n}`));

// ── Paso 1 ────────────────────────────────────────────────────
const emailInput  = document.getElementById("recoverEmail");
const emailError  = document.getElementById("recoverEmailError");
const sendBtn     = document.getElementById("nextStep1");
const successBanner = document.getElementById("successBanner");

// ── Paso 2 ────────────────────────────────────────────────────
const codeInput   = document.getElementById("verificationCode");
const codeError   = document.getElementById("codeError");
const verifyBtn   = document.getElementById("nextStep2");
const backBtn2    = document.getElementById("backStep2");
const resendBtn   = document.getElementById("resendBtn");

// ── Paso 3 ────────────────────────────────────────────────────
const newPassInput     = document.getElementById("newPassword");
const confirmPassInput = document.getElementById("confirmNewPassword");
const newPassError     = document.getElementById("newPasswordError");
const confirmPassError = document.getElementById("confirmNewPasswordError");
const backBtn3         = document.getElementById("backStep3");
const toggleNew        = document.getElementById("toggleNewPassword");
const toggleConfirm    = document.getElementById("toggleConfirmNewPassword");
const strengthBar      = document.getElementById("strengthBar");
const strengthText     = document.getElementById("strengthText");

// Estado interno
let verifiedEmail = "";
// Código mock — en Firebase esto no existe (lo gestiona el link del email)
const MOCK_CODE = "123456";
let resendCooldown = null;

// ── Navegación ────────────────────────────────────────────────
function goToStep(n) {
  steps.forEach((s, i) => s.classList.toggle("active", i === n - 1));

  dots.forEach((d, i) => {
    d.classList.remove("active", "completed");
    if (i < n - 1) {
      d.classList.add("completed");
      d.querySelector(".dot").textContent = "✓";
    } else if (i === n - 1) {
      d.classList.add("active");
      d.querySelector(".dot").textContent = i + 1;
    }
  });

  connectors.forEach((c, i) => c.classList.toggle("completed", i < n - 1));
}

// ── Paso 1: Enviar enlace ─────────────────────────────────────
sendBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    showError(emailInput, emailError, "Ingresa un correo válido.");
    return;
  }
  clearError(emailInput, emailError);
  setLoading(sendBtn, true, "Enviando…");

  try {
    await resetPassword(email);
    verifiedEmail = email;

    // Mostrar banner de éxito
    successBanner.classList.add("visible");

    // Avanzar al paso 2 tras un momento para que el usuario vea el banner
    setTimeout(() => goToStep(2), 1200);

  } catch (err) {
    showError(emailInput, emailError, getAuthErrorMessage(err.code));
  } finally {
    setLoading(sendBtn, false, "Enviar Enlace");
  }
});

emailInput.addEventListener("input", () => clearError(emailInput, emailError));

// ── Paso 2: Verificar código ──────────────────────────────────
verifyBtn.addEventListener("click", () => {
  const code = codeInput.value.trim();

  if (code.length !== 6) {
    showError(codeInput, codeError, "El código debe tener 6 dígitos.");
    return;
  }

  // ── MOCK: compara con código fijo ─────────────────────────
  if (code !== MOCK_CODE) {
    showError(codeInput, codeError, "Código incorrecto. Inténtalo de nuevo.");
    return;
  }
  // ── FIREBASE: aquí no habrá código; el link valida solo ───
  // El paso 2 completo se elimina cuando uses Firebase.

  clearError(codeInput, codeError);
  goToStep(3);
});

backBtn2.addEventListener("click", () => {
  codeInput.value = "";
  clearError(codeInput, codeError);
  successBanner.classList.remove("visible");
  goToStep(1);
});

codeInput.addEventListener("input", () => {
  // Solo dígitos
  codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
  clearError(codeInput, codeError);
});

// Reenvío con cooldown de 60 segundos
resendBtn.addEventListener("click", async () => {
  if (resendCooldown) return;
  resendBtn.disabled = true;

  try {
    await resetPassword(verifiedEmail);
  } catch {
    // Si falla silenciosamente, el usuario puede intentar de nuevo
  }

  let seconds = 60;
  resendBtn.textContent = `Reenviar (${seconds}s)`;

  resendCooldown = setInterval(() => {
    seconds--;
    resendBtn.textContent = `Reenviar (${seconds}s)`;
    if (seconds <= 0) {
      clearInterval(resendCooldown);
      resendCooldown = null;
      resendBtn.disabled = false;
      resendBtn.textContent = "Reenviar";
    }
  }, 1000);
});

// ── Paso 3: Nueva contraseña ──────────────────────────────────
backBtn3.addEventListener("click", () => {
  newPassInput.value = "";
  confirmPassInput.value = "";
  clearError(newPassInput,     newPassError);
  clearError(confirmPassInput, confirmPassError);
  resetStrength();
  goToStep(2);
});

newPassInput.addEventListener("input", () => {
  const val = newPassInput.value;
  const { level, label } = getPasswordStrength(val);

  strengthBar.dataset.level  = val ? level : "";
  strengthText.dataset.level = val ? level : "";
  strengthText.textContent   = val ? label : "-";

  updateReq("req-length",    val.length >= 8);
  updateReq("req-uppercase", /[A-Z]/.test(val));
  updateReq("req-number",    /[0-9]/.test(val));
  updateReq("req-special",   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val));

  clearError(newPassInput, newPassError);
});

confirmPassInput.addEventListener("input", () => clearError(confirmPassInput, confirmPassError));

toggleNew.addEventListener("click",     () => toggleVisibility(newPassInput,     toggleNew));
toggleConfirm.addEventListener("click", () => toggleVisibility(confirmPassInput, toggleConfirm));

// Submit paso 3
document.getElementById("recoverForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPass     = newPassInput.value;
  const confirmPass = confirmPassInput.value;
  let valid = true;

  if (getPasswordStrength(newPass).level < 3) {
    showError(newPassInput, newPassError, "La contraseña no cumple los requisitos mínimos.");
    valid = false;
  }

  if (newPass !== confirmPass) {
    showError(confirmPassInput, confirmPassError, "Las contraseñas no coinciden.");
    valid = false;
  }

  if (!valid) return;

  const submitBtn = e.target.querySelector('[type="submit"]');
  setLoading(submitBtn, true, "Guardando…");

  try {
    // ── MOCK ─────────────────────────────────────────────────
    await _delay(900);
    // ── FIREBASE — descomentar cuando esté listo ─────────────
    // El oobCode llega en la URL cuando el usuario hace clic en
    // el link del correo. Lo capturas así:
    // const oobCode = new URLSearchParams(window.location.search).get('oobCode');
    // await confirmPasswordReset(auth, oobCode, newPass);

    // Redirigir al login con mensaje
    sessionStorage.setItem("floast_password_reset", "1");
    window.location.href = "login.html";

  } catch (err) {
    showError(newPassInput, newPassError, getAuthErrorMessage(err.code));
  } finally {
    setLoading(submitBtn, false, "Cambiar Contraseña");
  }
});

// ── Helpers ───────────────────────────────────────────────────
function showError(input, errorEl, message) {
  if (errorEl) errorEl.textContent = message;
  input.closest(".form-group")?.classList.add("has-error");
  input.closest(".form-group")?.classList.remove("has-success");
}

function clearError(input, errorEl) {
  if (errorEl) errorEl.textContent = "";
  input.closest(".form-group")?.classList.remove("has-error");
}

function setLoading(btn, loading, text) {
  btn.disabled    = loading;
  btn.textContent = text;
}

function toggleVisibility(input, btn) {
  const show  = input.type === "password";
  input.type  = show ? "text" : "password";
  btn.textContent = show ? "🙈" : "👁️";
}

function updateReq(id, met) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("met", met);
  el.querySelector(".check").textContent = met ? "✓" : "✗";
}

function resetStrength() {
  strengthBar.dataset.level  = "";
  strengthText.dataset.level = "";
  strengthText.textContent   = "-";
  ["req-length","req-uppercase","req-number","req-special"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("met");
      el.querySelector(".check").textContent = "✗";
    }
  });
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}