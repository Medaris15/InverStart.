import { db } from "./firebaseConfig.js"; // ✅ Usa tu configuración existente
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// 🔎 Obtener ID desde la URL
function getIDDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 🔍 Obtener proyecto desde Firestore
async function obtenerProyectoPorID(id) {
  try {
    const ref = doc(db, "formEmprendedor", id);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error("❌ Error al obtener proyecto:", error);
    return null;
  }
}

// 🖼️ Mostrar detalle en el HTML
async function mostrarDetalle() {
  const id = getIDDesdeURL();
  const contenedor = document.getElementById("detalle-proyecto");

  if (!id) {
    contenedor.innerHTML = "<p>Error: No se proporcionó ID en la URL.</p>";
    return;
  }

  const proyecto = await obtenerProyectoPorID(id);
  if (!proyecto) {
    contenedor.innerHTML = "<p>No se encontró el proyecto.</p>";
    return;
  }

  let fechaFormateada = "No disponible";
  if (proyecto.fecha?.seconds) {
    fechaFormateada = new Date(proyecto.fecha.seconds * 1000).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const template = `
    <article class="proyecto-card">
      <h2 class="titulo-proyecto">${proyecto.nombre}</h2>
      <div class="logo-y-datos">
        <img src="${proyecto.imagenes?.[0] || 'img/no-img.png'}" alt="Imagen del proyecto" class="detalle-imagen" />
        <div class="datos-proyecto">
          <p><strong>Propietario:</strong> ${proyecto.nombre}</p>
          <p><strong>Categoría:</strong> ${proyecto.categoria}</p>
          <p>📍 <strong>Ubicación:</strong> ${proyecto.ubicacion}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        </div>
      </div>

      <h3 class="detalle-subtitulo">Descripción corta</h3>
      <p class="detalle-descripcion">${proyecto.descripcionCorta}</p>

      <h3 class="detalle-subtitulo">Descripción larga</h3>
      <p class="detalle-descripcion">${proyecto.descripcionLarga}</p>
    </article>
  `;

  contenedor.innerHTML = template;
}

// Ejecutar
mostrarDetalle();