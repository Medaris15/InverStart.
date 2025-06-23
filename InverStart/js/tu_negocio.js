import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
let negocioId = "";

// Tabs
window.openTab = function(evt, tabName) {
    document.querySelectorAll('.tabcontent').forEach(e => e.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
    document.querySelectorAll('.tablinks').forEach(e => e.classList.remove('active'));
    evt.currentTarget.classList.add('active');
};

// Cargar datos
async function cargarNegocio() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            negocioId = user.uid;
            const docRef = doc(db, "negocios", negocioId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('nombreNegocio').textContent = data.nombre || '';
                document.getElementById('eslogan').value = data.eslogan || '';
                document.getElementById('descripcion').value = data.descripcion || '';
                if (data.portadaURL) document.getElementById('imgPortada').src = data.portadaURL;
                if (data.fotoPerfilURL) document.getElementById('imgPerfilNegocio').src = data.fotoPerfilURL;
                if (data.presupuestoURL) mostrarPresupuesto(data.presupuestoURL);
                cargarGaleriaMedia();
            }
        }
    });
}

// Guardar cambios
window.guardarNegocio = async function() {
    if (!negocioId) return;
    const eslogan = document.getElementById('eslogan').value;
    const descripcion = document.getElementById('descripcion').value;
    const docRef = doc(db, "negocios", negocioId);
    await updateDoc(docRef, { eslogan, descripcion });
    alert('¡Cambios guardados!');
};

// Subir fotos o videos a Firebase (solo cuando el usuario haga click en el botón)
document.getElementById('btnSubirMedia').addEventListener('click', async function() {
    if (!negocioId) return;
    const input = document.getElementById('fotosVideos');
    const files = input.files;
    if (!files.length) {
        alert('Selecciona archivos para subir.');
        return;
    }
    for (let file of files) {
        const fileRef = ref(storage, `negocios/${negocioId}/media/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
    }
    input.value = '';
    cargarGaleriaMedia();
});

  // Galería de fotos/videos después de subir
  async function cargarGaleriaMedia() {
      if (!negocioId) return;
      const galeria = document.getElementById('galeriaMedia');
      galeria.innerHTML = "";
      const mediaRef = ref(storage, `negocios/${negocioId}/media`);
      const res = await listAll(mediaRef);
      // Mostrar los archivos más recientes primero
      const items = res.items.sort((a, b) => b.name.localeCompare(a.name));
      for (const itemRef of items) {
          const url = await getDownloadURL(itemRef);
          let el;
          if (itemRef.name.match(/\.(mp4|webm|ogg)$/i)) {
              el = document.createElement('video');
              el.controls = true;
              el.src = url;
              el.style.maxWidth = "90%";
              el.style.maxHeight = "180px";
          } else {
              el = document.createElement('img');
              el.src = url;
              el.style.maxWidth = "90%";
              el.style.maxHeight = "180px";
          }
          // Botón de eliminar
          const btnDel = document.createElement('button');
          btnDel.textContent = 'Eliminar';
          btnDel.onclick = async () => {
              await deleteObject(itemRef);
              cargarGaleriaMedia();
          };
          const wrap = document.createElement('div');
          wrap.className = "media-item";
          wrap.appendChild(el);
          wrap.appendChild(btnDel);
          galeria.appendChild(wrap);
      }
  }

// Subir presupuesto
window.subirPresupuesto = async function() {
    if (!negocioId) return;
    const fileInput = document.getElementById('presupuestoDoc');
    if (!fileInput.files.length) return alert('Selecciona un archivo');
    const file = fileInput.files[0];
    const fileRef = ref(storage, `negocios/${negocioId}/presupuesto/${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    const docRef = doc(db, "negocios", negocioId);
    await updateDoc(docRef, { presupuestoURL: url });
    mostrarPresupuesto(url);
};

function mostrarPresupuesto(url) {
    document.getElementById('presupuestoActual').innerHTML = `
        <a href="${url}" target="_blank">Ver presupuesto subido</a>
    `;
}

cargarNegocio();