import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Validaciones
function esMayorDeEdad(fecha) {
  const hoy = new Date();
  const nacimiento = new Date(fecha);
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  return (edad > 18) || (edad === 18 && (mes > 0 || (mes === 0 && hoy.getDate() >= nacimiento.getDate())));
}

function esCorreoValido(correo) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

function esContrasenaValida(contrasena) {
  return contrasena.length >= 8;
}

function esDuiValido(dui) {
  return /^\d{8}-\d{1}$/.test(dui);
}

// Formato DUI
document.getElementById("dui").addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "").substring(0, 9);
  if (valor.length > 8) valor = valor.slice(0, 8) + "-" + valor.slice(8);
  e.target.value = valor;
});

// Formato Teléfono
document.getElementById("telefono").addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, "").substring(0, 8);
  if (valor.length > 4) valor = valor.slice(0, 4) + " " + valor.slice(4);
  e.target.value = valor;
});

// Registro
document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  const fechaNacimiento = document.getElementById("fecha_nacimiento").value;
  const documentoIdentidad = document.getElementById("dui").value.trim();
  const telefono = document.getElementById("telefono").value.trim().replace(/\s/g, "");
  const tipoUsuario = document.querySelector('input[name="tipo_usuario"]:checked')?.value;

  // Validaciones
  if (!esMayorDeEdad(fechaNacimiento)) return alert("Debes ser mayor de edad para registrarte.");
  if (!esCorreoValido(correo)) return alert("El correo no es válido.");
  if (!esContrasenaValida(contrasena)) return alert("La contraseña debe tener al menos 8 caracteres.");
  if (telefono.length !== 8) return alert("El número de teléfono debe tener 8 dígitos.");
  if (!esDuiValido(documentoIdentidad)) return alert("El DUI no es válido. Usa el formato ########-#.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, correo, contrasena);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      correo,
      contrasena,
      fechaNacimiento,
      documentoIdentidad,
      telefono,
      tipoUsuario
    });

    alert("Registro exitoso.");

    // Redirección según tipo de usuario
    if (tipoUsuario === "Inversionista") {
      window.location.href = "intereses.html";
    } else if (tipoUsuario === "Emprendedor") {
      window.location.href = "formEmprendedor.html";
    }

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Este correo ya está registrado.");
    } else {
      console.error("Error en el registro:", error);
      alert("Error al registrar usuario.");
    }
  }
});
