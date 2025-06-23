import { db, auth } from './firebaseConfig.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";


// Escuchar cambios en autenticación
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Debe iniciar sesión.");
    window.location.href = "Index.html";
    return;
  }

  const form = document.getElementById("formIntereses");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const tipoNegocio = formData.get("tipoNegocio");
    const rangoInversion = formData.get("rangoInversion");
    const frecuencia = formData.get("frecuencia");
    const riesgo = formData.get("riesgo");
    const duracion = formData.get("duracion");
    const involucramiento = formData.get("involucramiento");
    const sectores = formData.getAll("sectores");

    const intereses = {
      email: user.email,
      tipoNegocio,
      rangoInversion,
      frecuencia,
      riesgo,
      duracion,
      involucramiento,
      sectores
    };

    try {
      const docRef = doc(db, "interesesUsuarios", user.uid);
      await setDoc(docRef, intereses);
      alert("Respuestas guardadas correctamente");
      window.location.href = "Inicio_Inversionista.html";
    } catch (error) {
      console.error("Error al guardar datos:", error);
      alert("Error al guardar datos: " + error.message);
    }
  });
});