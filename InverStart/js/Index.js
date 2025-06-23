import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { auth, db } from './firebaseConfig.js';

// Escuchar el formulario de login
const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("correo").value;
  const password = document.getElementById("contrasena").value;

  try {
    // Iniciar sesión con Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    //Obtener los datos del usuario en Firestore
    const docSnap = await getDoc(doc(db, "usuarios", user.uid));

    if (!docSnap.exists()) {
      alert("No se encontraron datos del usuario.");
      return;
    }

    const data = docSnap.data();

    // Redirigir según el tipo de usuario y estado de intereses
    if (data.tipoUsuario === "Inversionista") {
      if (!data.interesesCompletados) {
        window.location.href = "Inicio_Inversionista.html";
      }
    } else if (data.tipoUsuario === "Emprendedor") {
      window.location.href = "tu_negocio.html";
    } else {
      alert("No te has registrado.¡Registrate!");
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Correo o contraseña incorrectos.");
  }
});
