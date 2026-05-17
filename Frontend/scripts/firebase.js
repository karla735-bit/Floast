// ============================================================
//  FLOAST — firebase.js
//  Configuración e inicialización del SDK de Firebase.
//
//  INSTRUCCIONES:
//  1. Ve a https://console.firebase.google.com
//  2. Crea un proyecto → Agrega una app web
//  3. Copia el objeto firebaseConfig que te dan y pégalo aquí
//  4. En Firebase Console activa Authentication → Email/Password
//  ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// 🔑 Reemplaza estos valores con los de tu proyecto Firebase
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID",
};

// Inicialización — no tocar después de pegar las credenciales
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };