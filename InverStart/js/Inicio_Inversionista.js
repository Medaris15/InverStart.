import { db, auth } from "./firebaseConfig.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Usuario autenticado:", user.uid);
    cargarYMostrarProyectos();
  } else {
    console.log("Usuario no autenticado");
  }
});

// Referencias DOM
const productList = document.getElementById('proyectos-container') || document.getElementById('product-list');
const searchInput = document.getElementById('search');
const toggleDropdownBtn = document.getElementById('toggleDropdown');
const categoryDropdown = document.getElementById('categoryDropdown');

let todosLosProyectos = [];

// Obtener proyectos desde Firestore
async function obtenerProyectos() {
  try {
    const snapshot = await getDocs(collection(db, "formEmprendedor"));
    const proyectos = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      proyectos.push(data);
    });

    return proyectos;
  } catch (error) {
    console.error("❌ Error al obtener los proyectos:", error.message);
    return [];
  }
}

// Mostrar proyectos
function mostrarProyectos(proyectos) {
  productList.innerHTML = '';

  if (proyectos.length === 0) {
    productList.innerHTML = '<p>No se encontraron proyectos para mostrar.</p>';
    return;
  }

  proyectos.forEach(data => {
    if (!data.nombre || !data.descripcionCorta || !data.ubicacion) return;

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-img">
        <img src="${data.imagenURL || 'https://i.ibb.co/8bQbB8z/placeholder.png'}" alt="Imagen de ${data.nombre}">
      </div>
      <div class="card-info">
        <div class="card-title">${data.nombre}</div>
        <div class="card-desc">${data.descripcionCorta}</div>
        <small><b>Ubicación:</b> ${data.ubicacion}</small><br>
        <button class="ver-mas-btn" data-id="${data.id}">Ver más</button>
      </div>
    `;

    productList.appendChild(card);
  });

  agregarEventosVerMas();
}

// Botón "Ver más"
function agregarEventosVerMas() {
  const botones = document.querySelectorAll('.ver-mas-btn');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      window.location.href = `detalle.html?id=${id}`;
    });
  });
}

// Búsqueda por texto
searchInput.addEventListener('input', () => {
  const texto = searchInput.value.toLowerCase().trim();
  const resultados = todosLosProyectos.filter(p => {
    const contenido = `${p.nombreNegocio} ${p.descripcionCorta} ${p.categoria || ""}`.toLowerCase();
    return contenido.includes(texto);
  });
  mostrarProyectos(resultados);
});

// Mostrar / ocultar menú de categorías
toggleDropdownBtn.addEventListener('click', () => {
  categoryDropdown.style.display = categoryDropdown.style.display === 'flex' ? 'none' : 'flex';
});

// Filtro por categoría desde el dropdown
categoryDropdown.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', () => {
    const categoria = button.dataset.categoria;
    if (categoria === 'todos') {
      mostrarProyectos(todosLosProyectos);
    } else {
      const filtrados = todosLosProyectos.filter(p =>
        (p.categoria || '').toLowerCase().trim() === categoria
      );
      mostrarProyectos(filtrados);
    }

    categoryDropdown.style.display = 'none'; 
  });
});

// Cargar al iniciar
document.addEventListener('DOMContentLoaded', async () => {
  todosLosProyectos = await obtenerProyectos();
  mostrarProyectos(todosLosProyectos);
});