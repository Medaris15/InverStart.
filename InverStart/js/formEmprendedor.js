import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const API_KEY_IMGBB = "dd703e4e94771f7628f690270e282354";

// Mostrar u ocultar campo de ubicación según modalidad
function verificarUbicacion() {
  const modalidad = document.getElementById("modalidad").value;
  const ubicacionContainer = document.getElementById("ubicacion-container");

  if (modalidad === "presencial" || modalidad === "semi") {
    ubicacionContainer.style.display = "block";
    document.getElementById("ubicacion").disabled = false;
  } else {
    ubicacionContainer.style.display = "none";
    document.getElementById("ubicacion").disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modalidad").addEventListener("change", verificarUbicacion);
  verificarUbicacion();
});

const form = document.getElementById("proyectoForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const descripcionCorta = document.getElementById("descripcionCorta").value;
  const descripcionLarga = document.getElementById("descripcionLarga").value;
  const correo = document.getElementById("correo").value;
  const numero = document.getElementById("numero").value;
  const categoria = document.getElementById("categoria").value;
  const modalidad = document.getElementById("modalidad").value;
  const ubicacion = (modalidad === "presencial" || modalidad === "semi")
    ? document.getElementById("ubicacion").value
    : "No aplica";
  const potencial = document.getElementById("potencial").value;
  const ingresos = parseFloat(document.getElementById("ingresos").value);
  const egresos = parseFloat(document.getElementById("egresos").value);

  const inputImagen = document.getElementById("imagen");
  const inputLogo = document.getElementById("logo");

  // Validación
  if ((modalidad === "presencial" || modalidad === "semi") && ubicacion.trim() === "") {
    alert("Debe ingresar la ubicación del negocio.");
    return;
  }

  // Calcular margen de ganancia
  let margen_ganancia = 0;
  if (ingresos > 0 && egresos > 0) {
    margen_ganancia = ((ingresos - egresos) / egresos) * 100;
  }

  document.getElementById("margen_ganancia").value = margen_ganancia.toFixed(2) + "%";

  // Función para subir una sola imagen (logo)
  async function subirImagen(input) {
    const archivo = input.files[0];
    if (!archivo) return "";

    const formData = new FormData();
    formData.append("image", archivo);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    if (data.success) return data.data.url;
    else throw new Error(`Error al subir imagen: ${data.error?.message || 'desconocido'}`);
  }

  // Función para subir varias imágenes
  async function subirMultiplesImagenes(input) {
    const archivos = input.files;
    const urls = [];

    for (const archivo of archivos) {
      const formData = new FormData();
      formData.append("image", archivo);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY_IMGBB}`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        urls.push(data.data.url);
      } else {
        throw new Error(`Error al subir imagen: ${data.error?.message || 'desconocido'}`);
      }
    }

    return urls;
  }

  // Subir todo y guardar en Firestore
  try {
    const imagenesURLs = await subirMultiplesImagenes(inputImagen);
    const logoURL = await subirImagen(inputLogo);

    await addDoc(collection(db, "formEmprendedor"), {
      nombre,
      descripcionCorta,
      descripcionLarga,
      correo,
      numero,
      categoria,
      modalidad,
      ubicacion,
      imagenes: imagenesURLs,
      logo: logoURL,
      potencial,
      ingresos,
      egresos,
      margen_ganancia: margen_ganancia.toFixed(2),
      fecha: new Date()
    });

    alert("¡Proyecto guardado exitosamente!");
    form.reset();
    verificarUbicacion(); // Reinicia la visibilidad del campo ubicación

  } catch (error) {
    console.error("Error al guardar en Firestore:", error);
    alert("Ocurrió un error al guardar el proyecto.");
  }
});

