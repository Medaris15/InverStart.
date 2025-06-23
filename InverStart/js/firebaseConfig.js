// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBdTLgIBEAul5d6wAwnzYycumjkGimQGxo",
  authDomain: "inverstart-fbc07.firebaseapp.com",
  projectId: "inverstart-fbc07",
  storageBucket: "inverstart-fbc07.firebasestorage.app",
  messagingSenderId: "896645486301",
  appId: "1:896645486301:web:58988f8302d689ba16ad34",
  measurementId: "G-RMT34T63YL"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };