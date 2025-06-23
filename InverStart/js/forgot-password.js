import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdTLgIBEAul5d6wAwnzYycumjkGimQGxo",
  authDomain: "inverstart-fbc07.firebaseapp.com",
  projectId: "inverstart-fbc07",
  storageBucket: "inverstart-fbc07.appspot.com",
  messagingSenderId: "896645486301",
  appId: "1:896645486301:web:58988f8302d689ba16ad34",
  measurementId: "G-RMT34T63YL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elementos
const btnRecuperar = document.getElementById("btnRecuperar");
const emailInput = document.getElementById("email");
const modal = document.getElementById("modalCorreo");

btnRecuperar.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    alert("Por favor ingrese su correo.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    mostrarModal();
  } catch (error) {
    console.error("Error al enviar correo:", error);
    alert("Error: " + error.message);
  }
});

function mostrarModal() {
  modal.style.display = "flex";
}

window.cerrarModalYRedirigir = function () {
  modal.style.display = "none";
  window.location.href = "Index.html";
};
