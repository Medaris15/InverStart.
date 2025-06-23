import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut, deleteUser } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { app } from './firebase-config.js';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

let negocioId = "";

// Mostrar información de usuario
onAuthStateChanged(auth, async (user) => {
    if (user) {
        negocioId = user.uid;
        // Nombre y correo
        document.querySelector("#nombreUsuario span").textContent = user.displayName || "Nombre de usuario";
        document.getElementById("correoUsuario").value = user.email || "";
        // Foto de perfil
        cargarFotoPerfil(user.uid);
        // PayPal
        const docRef = doc(db, "negocios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById("paypalInput").value = data.paypal || "";
        }
    }
});

 // Cambiar foto de perfil
 document.getElementById("fotoPerfilInput").addEventListener("change", async function(e){
     const file = e.target.files[0];
     if (!file || !auth.currentUser) return;
     const fileRef = ref(storage, `usuarios/${auth.currentUser.uid}/perfil.jpg`);
     await uploadBytes(fileRef, file);
     const url = await getDownloadURL(fileRef);
     document.getElementById("fotoPerfilImg").src = url;
     // Guarda la URL en Firestore
     const docRef = doc(db, "negocios", auth.currentUser.uid);
     await updateDoc(docRef, { fotoPerfilURL: url });
 });

async function cargarFotoPerfil(uid){
    // Intenta cargar de Firestore, si no usa el default
    const docRef = doc(db, "negocios", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.fotoPerfilURL)
            document.getElementById("fotoPerfilImg").src = data.fotoPerfilURL;
    }
}

// Guardar correo de PayPal
document.getElementById("guardarPaypalBtn").addEventListener("click", async function(e){
    e.preventDefault();
    if (!auth.currentUser) return;
    const valor = document.getElementById("paypalInput").value.trim();
    const docRef = doc(db, "negocios", auth.currentUser.uid);
    await updateDoc(docRef, { paypal: valor });
    document.getElementById("paypalGuardado").style.display = "block";
    setTimeout(() => document.getElementById("paypalGuardado").style.display = "none", 1800);
});

// Cerrar sesión
document.getElementById("cerrarSesionBtn").addEventListener("click", async function(){
    await signOut(auth);
    window.location.href = "login.html";
});

// Eliminar cuenta (elimina usuario de Auth, Firestore y Storage)
document.getElementById("eliminarCuentaBtn").addEventListener("click", async function(){
    if(!auth.currentUser) return;
    if(!confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    const uid = auth.currentUser.uid;
    // Elimina datos de Firestore
    await deleteDoc(doc(db, "negocios", uid));
    // Elimina foto de perfil de Storage
    try {
        await deleteObject(ref(storage, `usuarios/${uid}/perfil.jpg`));
    } catch(e){}
    // Elimina usuario de Auth
    try {
        await deleteUser(auth.currentUser);
        alert("Cuenta eliminada.");
        window.location.href = "login.html";
    } catch(e){
        alert("Error al eliminar la cuenta. Vuelve a iniciar sesión y vuelve a intentarlo.");
    }
});