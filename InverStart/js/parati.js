import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const contenedor = document.getElementById("recomendaciones");
console.log("📌 Contenedor:", contenedor);

onAuthStateChanged(auth, async (user) => {
  console.log("👤 Usuario autenticado:", user);

  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "interesesUsuarios", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const intereses = docSnap.data();
      console.log("📄 Intereses del usuario:", intereses);
      mostrarRecomendaciones(intereses);
    } else {
      contenedor.innerHTML = "<p>No se encontraron intereses guardados.</p>";
    }
  } else {
    contenedor.innerHTML = "<p>Debe iniciar sesión para ver sus recomendaciones.</p>";
  }
});

// Función para normalizar texto (minúsculas, sin acentos, sin espacios)
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD') // separa acentos
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .trim();
}

async function mostrarRecomendaciones(intereses) {
  console.log("🔍 Ejecutando mostrarRecomendaciones con intereses:", intereses);

  const proyectosSnapshot = await getDocs(collection(db, "formEmprendedor"));
  const proyectos = [];

  proyectosSnapshot.forEach(doc => {
    const proyecto = doc.data();
    proyecto.id = doc.id;
    proyectos.push(proyecto);
  });

  console.log("📦 Proyectos obtenidos:", proyectos);

  // Normalizar categorías de usuario (supongo que están en 'sectores')
  const categoriasUsuario = (intereses.sectores || []).map(c => normalizarTexto(c));
  console.log("🎯 Categorías usuario normalizadas:", categoriasUsuario);

  // Filtrar proyectos que coincidan con las categorías del usuario
  const coincidencias = proyectos.filter(proy => {
    const categoriaProyecto = normalizarTexto(proy.categoria || "");
    const coincide = categoriasUsuario.includes(categoriaProyecto);
    console.log(`🧪 Proyecto "${proy.nombre}" → Categoría: ${categoriaProyecto}, Coincide: ${coincide}`);
    return coincide;
  });

  console.log("✅ Coincidencias por categoría:", coincidencias.length);

  if (coincidencias.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron proyectos en sus categorías de interés.</p>";
    return;
  }

  contenedor.innerHTML = coincidencias.map(proy => `
    <div class="product">
      <img src="${proy.imagenURL}" alt="Proyecto ${proy.nombreNegocio}" />
      <h4>${proy.nombre}</h4>
      <h4>${proy.descripcionCorta}</h4>
      <p class="categoria">${proy.categoria}</p>
      <button onclick="location.href='detalle.html?id=${proy.id}'">Ver más</button>
    </div>
  `).join("");
}
