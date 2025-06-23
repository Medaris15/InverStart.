import './css/emprende.css';
import './css/Perfil.css';
import './css/dashboard.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export async function cargarProyectos() {
  const contenedor = document.getElementById('proyectosContainer');
  const querySnapshot = await getDocs(collection(db, "proyectos"));

  querySnapshot.forEach((doc) => {
    const proyecto = doc.data();

    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta');

    tarjeta.innerHTML = `
      <img src="${proyecto.imagenURL}" alt="Proyecto">
      <h3>${proyecto.titulo}</h3>
      <p>${proyecto.tipo}</p>
    `;

    tarjeta.addEventListener("click", () => {
      localStorage.setItem("proyectoSeleccionado", JSON.stringify(proyecto));
      window.location.href = "/detalle-proyecto.html";
    });

    contenedor.appendChild(tarjeta);
  });
}

cargarProyectos();